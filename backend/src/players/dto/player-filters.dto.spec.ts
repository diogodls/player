import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PlayerFiltersDto } from './player-filters.dto';

describe('PlayerFiltersDto', () => {
  it('accepts valid optional filters and trims the player name', async () => {
    const dto = plainToInstance(PlayerFiltersDto, {
      name: '  Ana  ',
      positionId: '3',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.name).toBe('Ana');
    expect(dto.positionId).toBe(3);
  });

  it('rejects an invalid player position', async () => {
    const dto = plainToInstance(PlayerFiltersDto, {
      positionId: '1',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('positionId');
  });
});
