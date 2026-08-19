import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SessionViewFiltersDto } from './session-view-filters.dto';

describe('SessionViewFiltersDto', () => {
  it.each(['positive', 'negative', 'neutral'])(
    'accepts the %s outcome',
    async (outcome) => {
      const dto = plainToInstance(SessionViewFiltersDto, { outcome });
      await expect(validate(dto)).resolves.toHaveLength(0);
    },
  );

  it('rejects an unsupported outcome', async () => {
    const dto = plainToInstance(SessionViewFiltersDto, { outcome: 'other' });
    const errors = await validate(dto);
    expect(errors.map(({ property }) => property)).toContain('outcome');
  });
});
