import { fireEvent, render, screen, within } from "@testing-library/react";
import type { TeamIndex, TeamIndexPhase } from "../../../pages/CoachDashboard";
import TeamData from "./TeamData";

const index = (
  id: string,
  title: string,
  phase: TeamIndexPhase,
  value: number | null,
): TeamIndex => ({ id, title, phase, value, maxValue: 100 });

const indexes: TeamIndex[] = [
  index("offensive-transition", "Transição ofensiva", "offensive", 0),
  index("playing-out-pressure", "Saída de pressão", "offensive", null),
  index("positional-attack", "Ataque posicional", "offensive", 75),
  index("fly-goalkeeper", "Goleiro linha", "offensive", 50),
  index("defensive-fly-goalkeeper", "Goleiro linha defensivo", "defensive", 40),
  index("variable-pressing", "Marcação variando pra pressão", "defensive", 60),
  index("pressing", "Pressão", "defensive", 70),
  index("low-block", "Marcação baixa", "defensive", 90),
  index("defensive-transition", "Transição defensiva", "defensive", 100),
  index("corner", "Canto", "set-piece", 20),
  index("offensive-kick-in", "Lateral ofensivo", "set-piece", 30),
  index("defensive-kick-in", "Lateral defensivo", "set-piece", 40),
  index("free-kick", "Falta", "set-piece", 50),
  index("goal-clearance", "Arremesso de meta", "set-piece", 60),
];

describe("TeamData V2 carousel", () => {
  it("renders the 14 backend cards in one carousel and in received order", () => {
    render(<TeamData teamRelevantIndexes={indexes} />);
    const carousel = screen.getByLabelText("Índices coletivos");

    expect(screen.getAllByLabelText("Índices coletivos")).toHaveLength(1);
    expect(within(carousel).getAllByRole("article")).toHaveLength(14);
    expect(
      within(carousel)
        .getAllByRole("heading", { level: 3 })
        .map((title) => title.textContent),
    ).toEqual(indexes.map(({ title }) => title));
    expect(screen.queryByText("Bolas paradas")).not.toBeInTheDocument();
    expect(screen.getAllByText("Bola parada")).toHaveLength(5);
  });

  it("preserves null and zero values supplied by the backend", () => {
    render(<TeamData teamRelevantIndexes={indexes} />);
    expect(screen.getByText("Nenhum dado registrado")).toBeInTheDocument();
    expect(screen.getByText("0,0%")).toBeInTheDocument();
  });

  it("scrolls the single carousel one card in either direction", () => {
    render(<TeamData teamRelevantIndexes={indexes} />);
    const carousel = screen.getByLabelText("Índices coletivos");
    const firstCard =
      within(carousel).getAllByRole("article")[0].parentElement!;
    const scrollBy = vi.fn();
    Object.defineProperty(carousel, "scrollBy", { value: scrollBy });
    vi.spyOn(firstCard, "getBoundingClientRect").mockReturnValue({
      width: 240,
      height: 100,
      top: 0,
      right: 240,
      bottom: 100,
      left: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    fireEvent.click(screen.getByRole("button", { name: "Ver próximos cards" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Ver cards anteriores" }),
    );

    expect(scrollBy).toHaveBeenNthCalledWith(1, {
      left: 256,
      behavior: "smooth",
    });
    expect(scrollBy).toHaveBeenNthCalledWith(2, {
      left: -256,
      behavior: "smooth",
    });
  });
});
