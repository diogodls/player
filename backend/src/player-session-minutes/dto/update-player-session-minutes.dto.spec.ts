import { validate } from 'class-validator';
import { UpdatePlayerSessionMinutesDto } from './update-player-session-minutes.dto';

describe('UpdatePlayerSessionMinutesDto', () => {
  it.each([-1, 1.5])('rejects invalid totalSeconds %p', async (value) => {
    const dto = Object.assign(new UpdatePlayerSessionMinutesDto(), {
      totalSeconds: value,
    });

    expect(await validate(dto)).not.toHaveLength(0);
  });

  it('accepts a non-negative integer', async () => {
    const dto = Object.assign(new UpdatePlayerSessionMinutesDto(), {
      totalSeconds: 2130,
    });

    expect(await validate(dto)).toHaveLength(0);
  });
});
