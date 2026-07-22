import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SessionDto } from './session.dto';

describe('SessionDto', () => {
  it('accepts a session with a null id and trims its description', async () => {
    const dto = plainToInstance(SessionDto, {
      id: null,
      typeId: 1,
      locationId: 1,
      courtSizeId: 2,
      date: '2026-02-15',
      description: '  Finalizacao e 1x1  ',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.description).toBe('Finalizacao e 1x1');
  });

  it('accepts a session with a UUID id', async () => {
    const dto = plainToInstance(SessionDto, {
      id: '79fbbbe8-39b1-4b25-bd11-236a0f228cb0',
      typeId: 2,
      locationId: 2,
      courtSizeId: 1,
      date: '2026-02-19',
      description: 'Atlantico',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects invalid required fields', async () => {
    const dto = plainToInstance(SessionDto, {
      description: '   ',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining([
        'id',
        'typeId',
        'locationId',
        'courtSizeId',
        'date',
      ]),
    );
  });

  it('rejects invalid catalog ids', async () => {
    const dto = plainToInstance(SessionDto, {
      id: null,
      typeId: 3,
      locationId: 3,
      courtSizeId: 3,
      date: '2026-02-15',
      description: 'Finalizacao',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['typeId', 'locationId', 'courtSizeId']),
    );
  });

  it('rejects teamId because the session always uses the only team', async () => {
    const dto = plainToInstance(SessionDto, {
      id: null,
      typeId: 1,
      locationId: 1,
      courtSizeId: 1,
      date: '2026-02-15',
      description: 'Finalizacao',
      teamId: 'd62ec1e1-f762-45bd-a1e9-09ba8ef8d461',
    });

    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors.map((error) => error.property)).toContain('teamId');
  });
});
