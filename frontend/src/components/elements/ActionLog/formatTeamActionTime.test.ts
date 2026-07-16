import { formatTeamActionTime } from './formatTeamActionTime';

describe('formatTeamActionTime', () => {
  it.each([
    ['30', '00:00:30'],
    ['90', '00:01:30'],
    ['2400', '00:40:00'],
    ['3665', '01:01:05'],
    ['90.75', '00:01:30'],
  ])('formats %s seconds as %s', (seconds, expected) => {
    expect(formatTeamActionTime(seconds)).toBe(expected);
  });

  it('preserves an invalid original value', () => {
    expect(formatTeamActionTime('invalid')).toBe('invalid');
  });
});
