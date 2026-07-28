import {describe, expect, it} from "vitest";
import {formatVideoTime} from "./videoTime";

describe("formatVideoTime", () => {
  it.each([
    ["30", "00:00:30"],
    ["90", "00:01:30"],
    ["2400", "00:40:00"],
    ["3665", "01:01:05"],
    ["90.75", "00:01:30"],
  ])("formats %s seconds as %s", (seconds, expected) => {
    expect(formatVideoTime(seconds)).toBe(expected);
  });

  it.each([null, undefined, "", "invalid", -1])(
    "returns zero time for invalid input %s",
    (value) => {
      expect(formatVideoTime(value)).toBe("00:00:00");
    },
  );
});
