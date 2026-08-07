import { describe, expect, it } from "vitest";
import type { ComparisonPoint } from "./index";
import {
  COMPARISON_METRICS,
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

describe("comparison metrics", () => {
  it("reads the real indexes returned by the API", () => {
    expect(getPointMetricValue(point, "radj")).toBe(9);
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
    );

    expect(summary).toEqual({
      first: 80,
      last: 65,
      delta: -15,
    });
  });

  it("respects lower-is-better and neutral trend directions", () => {
    expect(COMPARISON_METRICS.gtj.direction).toBe("lower");
    expect(COMPARISON_METRICS.dto.direction).toBe("lower");
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
