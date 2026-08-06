import { validate } from 'class-validator';
import { CreateTaggedActionDto } from './create-tagged-action.dto';

const CATALOG_ACTION_ID = '00000000-0000-0000-0000-000000000418';
// Active player read from PostgreSQL's jogadores table.
const PLAYER_ID = '00000000-0000-0000-0000-000000000202';

describe('CreateTaggedActionDto', () => {
  it('accepts a real PostgreSQL player id without requiring a UUID version', async () => {
    const dto = Object.assign(new CreateTaggedActionDto(), {
      clientActionId: 'temporary-action-1',
      catalogActionId: CATALOG_ACTION_ID,
      playerId: PLAYER_ID,
      timestampSeconds: 12,
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('accepts playerId null', async () => {
    const dto = Object.assign(new CreateTaggedActionDto(), {
      clientActionId: 'temporary-action-2',
      catalogActionId: CATALOG_ACTION_ID,
      playerId: null,
      timestampSeconds: 12,
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects malformed identifiers', async () => {
    const dto = Object.assign(new CreateTaggedActionDto(), {
      clientActionId: '',
      catalogActionId: 'invalid',
      playerId: 'also-invalid',
      timestampSeconds: 12,
    });
    const errors = await validate(dto);
    expect(errors.map(({ property }) => property)).toEqual(
      expect.arrayContaining(['clientActionId', 'catalogActionId', 'playerId']),
    );
  });
});
