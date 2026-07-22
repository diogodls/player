import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SessionFiltersDto } from './session-filters.dto';

describe('SessionFiltersDto', () => {
  it('transforms numeric filters and pagination', async () => {
    const dto = plainToInstance(SessionFiltersDto, {
      typeId: '1',
      locationId: '2',
      date: '2026-02-15',
      page: '2',
      limit: '5',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.typeId).toBe(1);
    expect(dto.locationId).toBe(2);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(5);
  });

  it('rejects invalid filters', async () => {
    const dto = plainToInstance(SessionFiltersDto, {
      typeId: '3',
      locationId: '3',
      date: 'invalid-date',
      page: '0',
      limit: '101',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['typeId', 'locationId', 'date', 'page', 'limit']),
    );
  });
});
