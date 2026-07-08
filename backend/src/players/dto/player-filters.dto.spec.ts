import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PlayerFiltersDto } from './player-filters.dto';

describe('PlayerFiltersDto', () => {
  it('accepts valid optional filters and trims the player name', async () => {
    const dto = plainToInstance(PlayerFiltersDto, {
      name: '  Ana  ',
      positionId: '3',
      page: '2',
      limit: '8',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.name).toBe('Ana');
    expect(dto.positionId).toBe(3);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(8);
  });

  it('rejects an invalid player position', async () => {
    const dto = plainToInstance(PlayerFiltersDto, {
      positionId: '1',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('positionId');
  });

  it('rejects invalid pagination params', async () => {
    const dto = plainToInstance(PlayerFiltersDto, {
      page: '0',
      limit: '101',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['page', 'limit']),
    );
  });
});
