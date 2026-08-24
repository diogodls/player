import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../entities';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './jwt-payload.interface';

const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });

    // Timing-safe: sempre executa bcrypt, mesmo quando usuário não existe,
    // para evitar enumeração de usuários via tempo de resposta.
    const hash = user?.passwordHash ?? '$2b$12$invalidhashinvalidhashinvalidhas';
    const valid = await bcrypt.compare(dto.senha, hash);

    if (!user || !valid) {
      throw new UnauthorizedException('Email ou senha inválidos.');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: ACCESS_TOKEN_EXPIRY }),
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: REFRESH_TOKEN_EXPIRY,
      }),
    ]);

    const refreshHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
    await this.userRepo.update(user.id, { refreshTokenHash: refreshHash });

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Sessão encerrada.');
    }

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!valid) {
      // Possível roubo de token — invalida todas as sessões do usuário
      await this.userRepo.update(user.id, { refreshTokenHash: null });
      throw new UnauthorizedException('Refresh token inválido. Faça login novamente.');
    }

    const newPayload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(newPayload, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    return { accessToken };
  }

  async logout(userId: string): Promise<void> {
    await this.userRepo.update(userId, { refreshTokenHash: null });
  }

  /**
   * Utilitário para criar/atualizar usuários manualmente (use no script de seed ou CLI).
   * Nunca exposto como endpoint público.
   */
  async createUser(email: string, senha: string): Promise<UserEntity> {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new InternalServerErrorException(`Usuário ${email} já existe.`);
    }
    const passwordHash = await bcrypt.hash(senha, BCRYPT_ROUNDS);
    const user = this.userRepo.create({ email, passwordHash });
    return this.userRepo.save(user);
  }
}
