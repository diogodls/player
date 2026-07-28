import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SessionComparisonFiltersDto } from './session-comparison-filters.dto';

describe('SessionComparisonFiltersDto', () => {
  it('accepts an ISO date range and transforms the optional type', async () => {
    const dto = plainToInstance(SessionComparisonFiltersDto, {
      startDate: '2026-02-15',
      endDate: '2026-02-19',
      typeId: '1',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.typeId).toBe(1);
  });

  it('rejects invalid dates and session types', async () => {
    const dto = plainToInstance(SessionComparisonFiltersDto, {
      startDate: '15/02/2026',
      endDate: 'not-a-date',
      typeId: '99',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['startDate', 'endDate', 'typeId']),
    );
  });
});
