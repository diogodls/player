import { DataSource } from 'typeorm';
import source from '../data-source';
import { EnsureProductionBaseData1789401600000 } from './1789401600000-EnsureProductionBaseData';
import {
  SessionEntity,
  TeamEntity,
  TaggedActionEntity,
  PlayerSessionMinutesEntity,
} from '../entities';
import { SessionsService } from '../sessions/sessions.service';
import { PlayersService } from '../players/players.service';
import { CatalogService } from '../catalog/catalog.service';
import { ActionCategoryEntity } from '../entities';

jest.setTimeout(60000);

// Opt-in integration suite. Only an explicitly selected disposable local database is accepted.
const port = process.env.PLAYER_BASE_TEST_PORT;
(port ? describe : describe.skip)(
  'production base data (real PostgreSQL)',
  () => {
    let db: DataSource;
    const migration = new EnsureProductionBaseData1789401600000();
    async function apply() {
      const runner = db.createQueryRunner();
      await runner.connect();
      try {
        await migration.up(runner);
      } finally {
        await runner.release();
      }
    }
    async function snapshot() {
      const tables = await db.query(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
      );
      const result = {};
      for (const { tablename } of tables) {
        result[tablename] = await db.query(
          `SELECT * FROM "${tablename}" ORDER BY id`,
        );
      }
      return result;
    }
    async function createSession() {
      const service = new SessionsService(
        db.getRepository(SessionEntity),
        db.getRepository(TeamEntity),
        db.getRepository(TaggedActionEntity),
        {} as PlayersService,
        db.getRepository(PlayerSessionMinutesEntity),
      );
      return service.create({
        id: null,
        typeId: 1,
        locationId: 1,
        courtSizeId: 1,
        date: '2026-09-14',
        description: 'teste',
      });
    }
    beforeAll(async () => {
      db = new DataSource({
        ...source.options,
        host: '127.0.0.1',
        port: Number(port),
        username: 'postgres',
        password: 'isolated-test',
        database: 'player_base_test',
        migrationsRun: false,
        synchronize: false,
      });
      await db.initialize();
    });
    beforeEach(async () => {
      await db.dropDatabase();
      // Reproduce Railway: every historical migration has already been recorded.
      const all = db.migrations;
      db.migrations = all.filter((item) => item.name !== migration.name);
      const previousEnvironment = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      try {
        await db.runMigrations();
      } finally {
        if (previousEnvironment === undefined) delete process.env.NODE_ENV;
        else process.env.NODE_ENV = previousEnvironment;
        db.migrations = all;
      }
    });
    afterAll(async () => {
      if (db?.isInitialized) await db.destroy();
    });

    it('fills a database created only by migrations and creates the requested session', async () => {
      expect(await db.query('SELECT * FROM equipes')).toHaveLength(0);
      expect(await db.query('SELECT * FROM acoes_catalogo')).toHaveLength(2);
      await db.runMigrations();
      for (const [table, count] of Object.entries({
        session_types: 2,
        session_locations: 2,
        session_court_sizes: 2,
        posicoes: 3,
        lados_preferenciais: 2,
        tipos_analise: 2,
        impactos: 3,
        equipes: 1,
        acoes_catalogo: 33,
        contextos_acao_equipe: 14,
      })) {
        expect(await db.query(`SELECT * FROM ${table}`)).toHaveLength(count);
      }
      const catalog = new CatalogService(
        db.getRepository(ActionCategoryEntity),
      );
      const individual = await catalog.getIndividualCatalog();
      expect(individual.groups).toHaveLength(5);
      expect(individual.groups.flatMap((group) => group.actions)).toHaveLength(
        21,
      );
      const team = await catalog.getTeamCatalogV2();
      expect(team.groups).toHaveLength(3);
      expect(team.groups.flatMap((group) => group.actions)).toHaveLength(12);
      expect(await createSession()).toMatchObject({
        typeId: 1,
        locationId: 1,
        courtSizeId: 1,
        description: 'teste',
      });
    });

    it('is idempotent and preserves complete existing history', async () => {
      await apply();
      const session = await createSession();
      await db.query(`INSERT INTO jogadores (id,equipe_id,posicao_id,lado_preferencial_id,nome,idade)
      VALUES ('10000000-0000-4000-8000-000000000001','00000000-0000-0000-0000-000000000001',2,1,'Real athlete',25)`);
      await db.query(
        `INSERT INTO acoes_taggeadas (sessao_id,acao_catalogo_id,jogador_id,timestamp_segundos)
      VALUES ($1,'00000000-0000-0000-0000-000000000411','10000000-0000-4000-8000-000000000001',42)`,
        [session.id],
      );
      await db.query(
        `INSERT INTO player_session_minutes (session_id,player_id,total_seconds)
      VALUES ($1,'10000000-0000-4000-8000-000000000001',120)`,
        [session.id],
      );
      const before = await snapshot();
      await apply();
      expect(await snapshot()).toEqual(before);
    });

    it('preserves an existing active team without adding the default', async () => {
      await db.query("INSERT INTO equipes (nome) VALUES ('Existing team')");
      const before = await db.query('SELECT * FROM equipes');
      await apply();
      expect(await db.query('SELECT * FROM equipes')).toEqual(before);
    });

    it('rejects deleted teams and rolls back all new base data', async () => {
      await db.query(
        "INSERT INTO equipes (nome,deleted_at) VALUES ('Equipe Principal',NOW())",
      );
      const before = await snapshot();
      await expect(apply()).rejects.toThrow('only deleted teams');
      expect(await snapshot()).toEqual(before);
    });

    it.each([
      "INSERT INTO session_types (id,nome) VALUES (1,'Wrong type')",
      "INSERT INTO session_types (id,nome) VALUES (9,'Treino')",
      "UPDATE categorias_acao SET chave='WRONG' WHERE id='00000000-0000-0000-0000-000000000701'",
      "UPDATE contextos_acao_equipe SET deleted_at=NOW() WHERE id='00000000-0000-0000-0000-000000000731'",
    ])(
      'rejects identity/metadata conflicts without changing data: %s',
      async (sql) => {
        await db.query(sql);
        const before = await snapshot();
        await expect(apply()).rejects.toThrow('Base data conflict');
        expect(await snapshot()).toEqual(before);
      },
    );
  },
);
