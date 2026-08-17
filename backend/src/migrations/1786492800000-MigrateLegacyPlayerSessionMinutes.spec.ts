import { QueryRunner } from 'typeorm';
import { MigrateLegacyPlayerSessionMinutes1786492800000 } from './1786492800000-MigrateLegacyPlayerSessionMinutes';

type LegacyMinuteEvent = {
  id: string;
  sessionId: string;
  playerId: string;
  code: 'ENTROU' | 'SAIU';
  timestampSeconds: number;
};

describe('MigrateLegacyPlayerSessionMinutes1786492800000', () => {
  it('uses a deterministic state machine and preserves existing rows', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    await new MigrateLegacyPlayerSessionMinutes1786492800000().up({
      query,
    } as unknown as QueryRunner);

    const sql = query.mock.calls[0][0] as string;
    expect(sql).toContain('WITH RECURSIVE ordered_events');
    expect(sql).toMatch(
      /ORDER BY tagged\.timestamp_segundos ASC, tagged\.id ASC/,
    );
    expect(sql).toContain("catalog.sigla IN ('ENTROU', 'SAIU')");
    expect(sql).toContain('ON CONFLICT (session_id, player_id) DO NOTHING');
    expect(sql).toContain('WHERE completed_intervals > 0');
  });

  it('migrates one complete interval', () => {
    expect(
      calculate([event('1', 'ENTROU', 30), event('2', 'SAIU', 150)]),
    ).toEqual([expect.objectContaining({ totalSeconds: 120 })]);
  });

  it('sums multiple complete intervals', () => {
    expect(
      calculate([
        event('1', 'ENTROU', 30),
        event('2', 'SAIU', 150),
        event('3', 'ENTROU', 300),
        event('4', 'SAIU', 480),
      ])[0].totalSeconds,
    ).toBe(300);
  });

  it('ignores an unmatched exit and an open final entry', () => {
    expect(
      calculate([
        event('1', 'SAIU', 10),
        event('2', 'ENTROU', 30),
        event('3', 'SAIU', 150),
        event('4', 'ENTROU', 300),
      ])[0].totalSeconds,
    ).toBe(120);
  });

  it('keeps the first of two consecutive entries', () => {
    expect(
      calculate([
        event('1', 'ENTROU', 30),
        event('2', 'ENTROU', 60),
        event('3', 'SAIU', 150),
      ])[0].totalSeconds,
    ).toBe(120);
  });

  it('does not create a row for a group without a completed interval', () => {
    expect(calculate([event('1', 'ENTROU', 30)])).toEqual([]);
  });

  it('separates players and sessions', () => {
    const rows = calculate([
      event('1', 'ENTROU', 0, 'player-1', 'session-1'),
      event('2', 'SAIU', 60, 'player-1', 'session-1'),
      event('3', 'ENTROU', 0, 'player-2', 'session-1'),
      event('4', 'SAIU', 120, 'player-2', 'session-1'),
      event('5', 'ENTROU', 0, 'player-1', 'session-2'),
      event('6', 'SAIU', 180, 'player-1', 'session-2'),
    ]);

    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          playerId: 'player-1',
          sessionId: 'session-1',
          totalSeconds: 60,
        }),
        expect.objectContaining({
          playerId: 'player-2',
          sessionId: 'session-1',
          totalSeconds: 120,
        }),
        expect.objectContaining({
          playerId: 'player-1',
          sessionId: 'session-2',
          totalSeconds: 180,
        }),
      ]),
    );
  });

  it.each([1000, 0])(
    'preserves an existing new row with %i seconds',
    (seconds) => {
      const stored = new Map([['player-1:session-1', seconds]]);
      const existing = new Set(['player-1:session-1']);
      const migrated = calculateLegacyPlayerSessionMinutes(
        [event('1', 'ENTROU', 0), event('2', 'SAIU', 800)],
        existing,
      );

      expect(migrated).toEqual([]);
      expect(stored.get('player-1:session-1')).toBe(seconds);
    },
  );
});

function calculate(events: LegacyMinuteEvent[]) {
  return calculateLegacyPlayerSessionMinutes(events);
}

function calculateLegacyPlayerSessionMinutes(
  events: LegacyMinuteEvent[],
  existingPairs = new Set<string>(),
) {
  const grouped = new Map<string, LegacyMinuteEvent[]>();
  events.forEach((event) => {
    const key = `${event.playerId}:${event.sessionId}`;
    grouped.set(key, [...(grouped.get(key) ?? []), event]);
  });
  return Array.from(grouped.entries()).flatMap(([key, group]) => {
    if (existingPairs.has(key)) return [];
    group.sort(
      (left, right) =>
        left.timestampSeconds - right.timestampSeconds ||
        left.id.localeCompare(right.id),
    );
    let enteredAt: number | null = null;
    let totalSeconds = 0;
    let completedIntervals = 0;
    group.forEach((event) => {
      if (event.code === 'ENTROU') {
        if (enteredAt === null) enteredAt = event.timestampSeconds;
      } else if (enteredAt !== null) {
        totalSeconds += event.timestampSeconds - enteredAt;
        completedIntervals += 1;
        enteredAt = null;
      }
    });
    return completedIntervals > 0
      ? [
          {
            playerId: group[0].playerId,
            sessionId: group[0].sessionId,
            totalSeconds,
          },
        ]
      : [];
  });
}

function event(
  id: string,
  code: LegacyMinuteEvent['code'],
  timestampSeconds: number,
  playerId = 'player-1',
  sessionId = 'session-1',
): LegacyMinuteEvent {
  return { id, code, timestampSeconds, playerId, sessionId };
}
