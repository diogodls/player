import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateSessionDto } from './update-session.dto';

const SESSION_ID = '70000000-0000-4000-8000-000000000010';

describe('UpdateSessionDto', () => {
  it('accepts a partial update with a UUID v4 id', async () => {
    const dto = plainToInstance(UpdateSessionDto, {
      id: SESSION_ID,
      description: '  Treino atualizado  ',
      locationId: 2,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.description).toBe('Treino atualizado');
  });

  it('allows null to clear the optional description', async () => {
    const dto = plainToInstance(UpdateSessionDto, {
      id: SESSION_ID,
      description: null,
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects an invalid or non-v4 id', async () => {
    const dto = plainToInstance(UpdateSessionDto, {
      id: '70000000-0000-0000-0000-000000000010',
      date: '2026-08-06',
    });

    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toContain('id');
  });

  it('validates optional catalog ids when supplied', async () => {
    const dto = plainToInstance(UpdateSessionDto, {
      id: SESSION_ID,
      typeId: 3,
      locationId: 3,
      courtSizeId: 3,
    });

    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['typeId', 'locationId', 'courtSizeId']),
    );
  });
});
