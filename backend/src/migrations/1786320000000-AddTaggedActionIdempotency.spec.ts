import { QueryRunner } from 'typeorm';
import { AddTaggedActionIdempotency1786320000000 } from './1786320000000-AddTaggedActionIdempotency';

describe('AddTaggedActionIdempotency1786320000000', () => {
  it('adds a nullable client key and a partial unique session index', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const migration = new AddTaggedActionIdempotency1786320000000();

    await migration.up({ query } as unknown as QueryRunner);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('ADD COLUMN IF NOT EXISTS client_action_id'),
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringMatching(
        /UNIQUE INDEX.*\(sessao_id, client_action_id\).*client_action_id IS NOT NULL.*deleted_at IS NULL/,
      ),
    );
  });
});
