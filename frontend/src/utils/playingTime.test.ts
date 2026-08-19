import { describe, expect, it } from "vitest";
import {
  displayedPlayingSeconds,
  formatPlayingTime,
  parsePlayingTime,
} from "./playingTime";

describe("playingTime", () => {
  it.each([
    [0, "00:00"],
    [65, "01:05"],
    [851, "14:11"],
    [2130, "35:30"],
  ])("formats %i seconds", (seconds, expected) => {
    expect(formatPlayingTime(seconds)).toBe(expected);
  });

  it("parses manual time without imposing a minute limit", () => {
    expect(parsePlayingTime("35:30")).toBe(2130);
    expect(parsePlayingTime("120:00")).toBe(7200);
  });

  it.each(["", "-1:00", "10:60", "10", "1:2"])(
    "rejects invalid manual value %s",
    (value) => expect(parsePlayingTime(value)).toBeNull(),
  );

  it("adds only visual elapsed time to an active consolidated value", () => {
    expect(
      displayedPlayingSeconds(
        600,
        "2026-08-17T12:00:00.000Z",
        true,
        Date.parse("2026-08-17T12:01:05.000Z"),
      ),
    ).toBe(665);
  });
});
