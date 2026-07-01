import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePlayerDto } from './create-player.dto';
import { UpdatePlayerDto } from './update-player.dto';

describe('Player DTOs', () => {
  it('accepts and trims a valid player', async () => {
    const dto = plainToInstance(CreatePlayerDto, {
      name: '  Ana Silva  ',
      age: 21,
      positionId: 3,
      preferredSideId: 2,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.name).toBe('Ana Silva');
  });

  it('rejects invalid required fields', async () => {
    const dto = plainToInstance(CreatePlayerDto, {
      name: '   ',
      age: 0,
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['name', 'age', 'positionId', 'preferredSideId']),
    );
  });

  it('rejects goalkeeper as a player position', async () => {
    const dto = plainToInstance(CreatePlayerDto, {
      name: 'João',
      age: 20,
      positionId: 1,
      preferredSideId: 1,
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('positionId');
  });

  it('validates only fields supplied when updating', async () => {
    const validDto = plainToInstance(UpdatePlayerDto, { name: 'Novo nome' });
    const invalidDto = plainToInstance(UpdatePlayerDto, {
      teamId: 'invalid-id',
      preferredSideId: 9,
    });

    await expect(validate(validDto)).resolves.toHaveLength(0);
    await expect(validate(invalidDto)).resolves.toHaveLength(2);
  });
});
