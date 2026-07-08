import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PlayerDto } from './player.dto';

describe('PlayerDto', () => {
  it('accepts a player with a null id and trims its name', async () => {
    const dto = plainToInstance(PlayerDto, {
      id: null,
      name: '  Ana Silva  ',
      age: 21,
      positionId: 3,
      preferredSideId: 2,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.name).toBe('Ana Silva');
  });

  it('accepts a player with a UUID id', async () => {
    const dto = plainToInstance(PlayerDto, {
      id: '79fbbbe8-39b1-4b25-bd11-236a0f228cb0',
      name: 'Ana Silva',
      age: 21,
      positionId: 3,
      preferredSideId: 2,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects invalid required fields', async () => {
    const dto = plainToInstance(PlayerDto, {
      name: '   ',
      age: 0,
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining([
        'id',
        'name',
        'age',
        'positionId',
        'preferredSideId',
      ]),
    );
  });

  it('rejects an invalid player id', async () => {
    const dto = plainToInstance(PlayerDto, {
      id: 'invalid-id',
      name: 'Ana Silva',
      age: 21,
      positionId: 3,
      preferredSideId: 2,
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('id');
  });

  it('rejects teamId because the player always uses the only team', async () => {
    const dto = plainToInstance(PlayerDto, {
      id: null,
      name: 'Ana Silva',
      age: 21,
      positionId: 3,
      preferredSideId: 2,
      teamId: 'd62ec1e1-f762-45bd-a1e9-09ba8ef8d461',
    });

    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors.map((error) => error.property)).toContain('teamId');
  });

  it('rejects goalkeeper as a player position', async () => {
    const dto = plainToInstance(PlayerDto, {
      id: null,
      name: 'João',
      age: 20,
      positionId: 1,
      preferredSideId: 1,
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('positionId');
  });
});
