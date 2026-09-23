import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import request from 'supertest';
import type { App } from 'supertest/types';
import * as bcrypt from 'bcrypt';
import type { FindManyOptions } from 'typeorm';
import { UserEntity } from '../entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AdminGuard } from './admin.guard';

describe('Administrative users HTTP authorization and password reset', () => {
  let app: INestApplication<App>;
  let jwt: JwtService;
  let users: UserEntity[];
  const repo = {
    find: jest.fn<Promise<UserEntity[]>, [FindManyOptions<UserEntity>]>(),
    findOne: jest.fn(),
    update: jest.fn(),
  };
  const id = (n: number) =>
    `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
  const token = (n: number, email = users[n].email) =>
    jwt.sign({ sub: users[n].id, email, equipeId: users[n].equipeId });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: 'admin-test-secret',
          signOptions: { expiresIn: '15m' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtStrategy,
        AdminGuard,
        { provide: getRepositoryToken(UserEntity), useValue: repo },
        {
          provide: ConfigService,
          useValue: { getOrThrow: () => 'admin-test-secret' },
        },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    jwt = module.get(JwtService);
  });
  beforeEach(() => {
    users = [
      'pranke@player.ufsm',
      'analista@player.ufsm',
      'coach@feminina.player',
      'coach@juvenil.player',
    ].map(
      (email, n) =>
        ({
          id: id(n + 1),
          email,
          equipeId: id(n < 2 ? 10 : n + 10),
          passwordHash: 'old-hash',
          refreshTokenHash: 'old-refresh-hash',
          equipe: {
            id: id(n < 2 ? 10 : n + 10),
            nome: ['Masculina', 'Masculina', 'Feminina', 'Juvenis'][n],
          },
        }) as UserEntity,
    );
    jest.clearAllMocks();
    repo.find.mockImplementation(() => Promise.resolve(users));
    repo.findOne.mockImplementation(({ where }: { where: { id: string } }) =>
      Promise.resolve(users.find((user) => user.id === where.id) ?? null),
    );
    repo.update.mockImplementation(
      (target: string, changes: Partial<UserEntity>) => {
        const user = users.find((item) => item.id === target);
        if (user) Object.assign(user, changes);
        return Promise.resolve({ affected: user ? 1 : 0 });
      },
    );
  });
  afterAll(async () => {
    await app.close();
  });

  it('lists all teams for Pranke without hashes or tokens', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/admin/users')
      .auth(token(0), { type: 'bearer' })
      .expect(200);
    expect(response.body).toEqual(
      users.map((user) => ({
        id: user.id,
        email: user.email,
        equipeId: user.equipeId,
        equipeNome: user.equipe!.nome,
      })),
    );
    expect(repo.find.mock.calls[0][0]).not.toHaveProperty('where');
    expect(repo.find.mock.calls[0][0].select).not.toHaveProperty(
      'passwordHash',
    );
    expect(repo.find.mock.calls[0][0].select).not.toHaveProperty(
      'refreshTokenHash',
    );
  });
  it.each(['get', 'put'] as const)(
    '%s rejects absent/invalid tokens and non-admin identities',
    async (method) => {
      const path =
        method === 'get'
          ? '/auth/admin/users'
          : `/auth/admin/users/${id(2)}/password`;
      await request(app.getHttpServer())
        [method](path)
        .send({ password: 'new-password' })
        .expect(401);
      await request(app.getHttpServer())
        [method](path)
        .auth('invalid', { type: 'bearer' })
        .send({ password: 'new-password' })
        .expect(401);
      // Even a signed token claiming the admin email must use the database identity.
      await request(app.getHttpServer())
        [method](path)
        .auth(token(1, 'pranke@player.ufsm'), { type: 'bearer' })
        .send({ password: 'new-password' })
        .expect(403);
      expect(repo.update).not.toHaveBeenCalled();
    },
  );
  it.each([
    'Pranke@player.ufsm',
    'pranke@player.ufsm.evil',
    'admin@player.local',
  ])('requires exact email: %s', async (email) => {
    users[0].email = email;
    await request(app.getHttpServer())
      .get('/auth/admin/users')
      .auth(token(0), { type: 'bearer' })
      .expect(403);
  });
  it.each([0, 1, 2, 3])(
    'resets user %i across teams, including self, with bcrypt and refresh invalidation',
    async (n) => {
      const equipeId = users[n].equipeId;
      await request(app.getHttpServer())
        .put(`/auth/admin/users/${users[n].id}/password`)
        .auth(token(0), { type: 'bearer' })
        .send({ password: 'new-password' })
        .expect(204);
      expect(users[n].passwordHash).not.toBe('new-password');
      expect(await bcrypt.compare('new-password', users[n].passwordHash)).toBe(
        true,
      );
      expect(bcrypt.getRounds(users[n].passwordHash)).toBe(12);
      expect(users[n].refreshTokenHash).toBeNull();
      expect(users[n].equipeId).toBe(equipeId);
    },
  );
  it('returns 404 for an unknown target', async () => {
    await request(app.getHttpServer())
      .put(`/auth/admin/users/${id(99)}/password`)
      .auth(token(0), { type: 'bearer' })
      .send({ password: 'new-password' })
      .expect(404);
    expect(repo.update).not.toHaveBeenCalled();
  });
  it.each([
    {},
    { password: 'short' },
    { password: 123456 },
    { password: 'valid-password', email: 'pranke@player.ufsm' },
  ])('validates the password payload %j', async (body) => {
    await request(app.getHttpServer())
      .put(`/auth/admin/users/${id(2)}/password`)
      .auth(token(0), { type: 'bearer' })
      .send(body)
      .expect(400);
    expect(repo.update).not.toHaveBeenCalled();
  });
});
