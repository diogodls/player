import { describe, expect, it } from "vitest";
import type { ComparisonPoint } from "./index";
import {
  buildMockIndexes,
  formatMetricDelta,
  getMetricSummary,
  getPointMetricValue,
  getTrend,
} from "./comparisonMetrics";

const point: ComparisonPoint = {
  sessionId: "session-1",
  metrics: {
    positiveActions: 4,
    negativeActions: 1,
    offensiveActions: 3,
    defensiveActions: 2,
    totalActions: 5,
    performancePercentage: 80,
  },
  indexes: null,
};

describe("comparison metrics", () => {
  it("creates stable mock indexes for an athlete and session", () => {
    expect(buildMockIndexes("athlete-1", "session-1")).toEqual(
      buildMockIndexes("athlete-1", "session-1"),
    );
    expect(buildMockIndexes("athlete-1", "session-1")).not.toEqual(
      buildMockIndexes("athlete-1", "session-2"),
    );
  });

  it("prefers real indexes over the fixture", () => {
    const realPoint: ComparisonPoint = {
      ...point,
      indexes: {
        radj: 9,
        goalsRelations: 8,
        actionsRelations: 7,
        atd: 6,
        dto: 5,
        pgj: 4,
        ic: 3,
        tio: 2,
        gtj: 1,
        rf: 0.5,
        tid: 10,
      },
    };

    expect(getPointMetricValue(realPoint, "radj", "athlete-1", true)).toEqual({
      value: 9,
      isMock: false,
    });
  });

  it("calculates first, last and percentage-point delta", () => {
    const summary = getMetricSummary(
      [
        point,
        {
          ...point,
          sessionId: "session-2",
          metrics: { ...point.metrics, performancePercentage: 65 },
        },
      ],
      "performancePercentage",
      "athlete-1",
      false,
    );

    expect(summary).toEqual({
      first: 80,
      last: 65,
      delta: -15,
      hasMock: false,
    });
  });

  it("respects lower-is-better and neutral trend directions", () => {
    expect(getTrend(-2, "lower")).toBe("improved");
    expect(getTrend(2, "lower")).toBe("declined");
    expect(getTrend(2, "neutral")).toBe("changed");
    expect(getTrend(0, "higher")).toBe("stable");
  });

  it("formats performance changes as percentage points", () => {
    expect(formatMetricDelta(15, "performancePercentage")).toBe("15 pp");
    expect(formatMetricDelta(-2, "positiveActions")).toBe("-2");
  });
});
