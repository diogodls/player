import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1784000000000 implements MigrationInterface {
  name = 'CreateInitialSchema1784000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Existing installations created by schema.sql are adopted without
    // recreating or changing their tables. TypeORM will record this baseline.
    if (await queryRunner.hasTable('equipes')) return;

    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`
      CREATE TABLE equipes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        nome varchar(255) NOT NULL CONSTRAINT equipes_nome_unique UNIQUE,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        deleted_at timestamptz NULL
      )
    `);
    await queryRunner.query(`
      CREATE TABLE session_types (
        id smallint PRIMARY KEY,
        nome varchar(50) NOT NULL CONSTRAINT session_types_nome_unique UNIQUE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE session_locations (
        id smallint PRIMARY KEY,
        nome varchar(50) NOT NULL CONSTRAINT session_locations_nome_unique UNIQUE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE session_court_sizes (
        id smallint PRIMARY KEY,
        nome varchar(50) NOT NULL CONSTRAINT session_court_sizes_nome_unique UNIQUE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE posicoes (
        id smallint PRIMARY KEY,
        nome varchar(50) NOT NULL CONSTRAINT posicoes_nome_unique UNIQUE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE lados_preferenciais (
        id smallint PRIMARY KEY,
        nome varchar(50) NOT NULL CONSTRAINT lados_preferenciais_nome_unique UNIQUE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE tipos_analise (
        id smallint PRIMARY KEY,
        nome varchar(50) NOT NULL CONSTRAINT tipos_analise_nome_unique UNIQUE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE impactos (
        id smallint PRIMARY KEY,
        nome varchar(50) NOT NULL CONSTRAINT impactos_nome_unique UNIQUE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE jogadores (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        equipe_id uuid NOT NULL REFERENCES equipes(id),
        posicao_id smallint NOT NULL REFERENCES posicoes(id),
        lado_preferencial_id smallint NOT NULL REFERENCES lados_preferenciais(id),
        nome varchar(255) NOT NULL,
        idade integer NOT NULL CONSTRAINT jogadores_idade_check CHECK (idade > 0),
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        deleted_at timestamptz NULL
      )
    `);
    await queryRunner.query(`
      CREATE TABLE sessoes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        equipe_id uuid NOT NULL REFERENCES equipes(id),
        session_type_id smallint NOT NULL REFERENCES session_types(id),
        session_location_id smallint NOT NULL REFERENCES session_locations(id),
        session_court_size_id smallint NOT NULL REFERENCES session_court_sizes(id),
        data date NOT NULL,
        descricao text NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        deleted_at timestamptz NULL
      )
    `);
    await queryRunner.query(`
      CREATE TABLE categorias_acao (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tipo_analise_id smallint NOT NULL REFERENCES tipos_analise(id),
        nome varchar(100) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        deleted_at timestamptz NULL,
        CONSTRAINT categorias_acao_tipo_nome_unique UNIQUE (tipo_analise_id, nome)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE acoes_catalogo (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        categoria_acao_id uuid NOT NULL REFERENCES categorias_acao(id),
        impacto_id smallint NOT NULL REFERENCES impactos(id),
        nome varchar(255) NOT NULL,
        sigla varchar(30) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        deleted_at timestamptz NULL,
        CONSTRAINT acoes_catalogo_categoria_nome_unique UNIQUE (categoria_acao_id, nome),
        CONSTRAINT acoes_catalogo_categoria_sigla_unique UNIQUE (categoria_acao_id, sigla)
      )
    `);
    await queryRunner.query(`
      CREATE TABLE acoes_taggeadas (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        sessao_id uuid NOT NULL REFERENCES sessoes(id),
        acao_catalogo_id uuid NOT NULL REFERENCES acoes_catalogo(id),
        jogador_id uuid NULL REFERENCES jogadores(id),
        timestamp_segundos integer NOT NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        deleted_at timestamptz NULL,
        CONSTRAINT acoes_taggeadas_timestamp_check CHECK (timestamp_segundos >= 0)
      )
    `);

    const indexes = [
      'CREATE INDEX jogadores_equipe_deleted_at_idx ON jogadores (equipe_id, deleted_at)',
      'CREATE INDEX jogadores_nome_idx ON jogadores (nome)',
      'CREATE INDEX sessoes_equipe_data_idx ON sessoes (equipe_id, data DESC)',
      'CREATE INDEX sessoes_tipo_idx ON sessoes (session_type_id)',
      'CREATE INDEX categorias_acao_tipo_deleted_at_idx ON categorias_acao (tipo_analise_id, deleted_at)',
      'CREATE INDEX acoes_catalogo_categoria_deleted_at_idx ON acoes_catalogo (categoria_acao_id, deleted_at)',
      'CREATE INDEX acoes_taggeadas_sessao_tempo_idx ON acoes_taggeadas (sessao_id, timestamp_segundos)',
      'CREATE INDEX acoes_taggeadas_jogador_idx ON acoes_taggeadas (jogador_id)',
      'CREATE INDEX acoes_taggeadas_acao_idx ON acoes_taggeadas (acao_catalogo_id)',
    ];
    for (const index of indexes) await queryRunner.query(index);

    for (const table of [
      'equipes',
      'jogadores',
      'sessoes',
      'categorias_acao',
      'acoes_catalogo',
      'acoes_taggeadas',
    ]) {
      await queryRunner.query(`
        CREATE TRIGGER ${table}_set_updated_at
        BEFORE UPDATE ON ${table}
        FOR EACH ROW EXECUTE FUNCTION set_updated_at()
      `);
    }
    // Required by retained historical catalog migrations. The explicit seed
    // command also upserts these stable reference values.
    await queryRunner.query(`
      INSERT INTO tipos_analise (id, nome) VALUES
        (1, 'Individual'), (2, 'Equipe')
      ON CONFLICT (id) DO NOTHING
    `);
    await queryRunner.query(`
      CREATE TABLE player_schema_baseline (
        id smallint PRIMARY KEY CHECK (id = 1),
        created_at timestamptz NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(
      'INSERT INTO player_schema_baseline (id) VALUES (1)',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Never tear down a legacy database that this migration only adopted.
    if (!(await queryRunner.hasTable('player_schema_baseline'))) return;
    await queryRunner.query('DROP TABLE player_schema_baseline');
    await queryRunner.query('DROP TABLE IF EXISTS acoes_taggeadas');
    await queryRunner.query('DROP TABLE IF EXISTS acoes_catalogo');
    await queryRunner.query('DROP TABLE IF EXISTS categorias_acao');
    await queryRunner.query('DROP TABLE IF EXISTS sessoes');
    await queryRunner.query('DROP TABLE IF EXISTS jogadores');
    await queryRunner.query('DROP TABLE IF EXISTS impactos');
    await queryRunner.query('DROP TABLE IF EXISTS tipos_analise');
    await queryRunner.query('DROP TABLE IF EXISTS lados_preferenciais');
    await queryRunner.query('DROP TABLE IF EXISTS posicoes');
    await queryRunner.query('DROP TABLE IF EXISTS session_court_sizes');
    await queryRunner.query('DROP TABLE IF EXISTS session_locations');
    await queryRunner.query('DROP TABLE IF EXISTS session_types');
    await queryRunner.query('DROP TABLE IF EXISTS equipes');
    await queryRunner.query('DROP FUNCTION IF EXISTS set_updated_at()');
  }
}
