import { QueryRunner } from 'typeorm';
import { CreatePlayerSessionMinutes1786406400000 } from './1786406400000-CreatePlayerSessionMinutes';

describe('CreatePlayerSessionMinutes1786406400000', () => {
  it('creates the table with constraints and backend timestamps', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const migration = new CreatePlayerSessionMinutes1786406400000();

    await migration.up({ query } as unknown as QueryRunner);

    const sql = query.mock.calls[0][0] as string;
    expect(sql).toContain('CREATE TABLE player_session_minutes');
    expect(sql).toMatch(/CHECK \(total_seconds >= 0\)/);
    expect(sql).toMatch(/UNIQUE \(session_id, player_id\)/);
    expect(sql).toMatch(/REFERENCES sessoes\(id\) ON DELETE CASCADE/);
    expect(sql).toMatch(/REFERENCES jogadores\(id\) ON DELETE CASCADE/);
    expect(sql).toContain('active_since timestamptz NULL');
  });
});
