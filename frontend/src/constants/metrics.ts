export const PLAYER_COLORS = Object.freeze([
  "#60A5FA",
  "#fb923c",
  "#FA4F58",
  "#22BF75",
]);

export const METRICS_TYPES = Object.freeze({
  "Ofensivo em quadra": ["goals"],
  "Defensivo em quadra": ["goalsTaken"],
  "Ações Ofensivas": ["defensiveActions"],
  "Ações Defensivas": ["offensiveActions"],
});

export const INDEXES_COLORS = Object.freeze({
  offensive: "#60A5FA",
  deffensive: "#FB923C",
  general: "#F9CB15",
});

export const INDEXES_META = {
  radj: { label: "Relação Ataque-Defesa por jogo", category: "general" },
  goalsRelations: { label: "+/- gols", category: "general" },
  actionsRelations: { label: "+/- ações", category: "general" },
  atd: {
    label: "Relação ataque + transições defensivas",
    category: "general",
  },
  dto: {
    label: "Relação defesa + transições ofensivas",
    category: "general",
  },

  pgj: { label: "Participações em gol por jogo", category: "offensive" },
  ic: { label: "Índice de criação", category: "offensive" },
  tio: { label: "Taxa de influência ofensiva", category: "offensive" },

  gtj: { label: "Gols tomados por jogo", category: "deffensive" },
  rf: {
    label: "Relação recuperação/falhas defensivas",
    category: "deffensive",
  },
  tid: { label: "Taxa de influência defensiva", category: "deffensive" },
};

export const INDEXES_LABELS = {
  general: "Índices gerais",
  offensive: "Índices ofensivos",
  deffensive: "Índices defensivos",
};
