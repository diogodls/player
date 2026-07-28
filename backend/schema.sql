CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE equipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(255) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  deleted_at timestamptz NULL,
  CONSTRAINT equipes_nome_unique UNIQUE (nome)
);

CREATE TABLE session_types (
  id smallint PRIMARY KEY,
  nome varchar(50) NOT NULL,
  CONSTRAINT session_types_nome_unique UNIQUE (nome)
);

CREATE TABLE session_locations (
  id smallint PRIMARY KEY,
  nome varchar(50) NOT NULL,
  CONSTRAINT session_locations_nome_unique UNIQUE (nome)
);

CREATE TABLE session_court_sizes (
  id smallint PRIMARY KEY,
  nome varchar(50) NOT NULL,
  CONSTRAINT session_court_sizes_nome_unique UNIQUE (nome)
);

CREATE TABLE posicoes (
  id smallint PRIMARY KEY,
  nome varchar(50) NOT NULL,
  CONSTRAINT posicoes_nome_unique UNIQUE (nome)
);

CREATE TABLE lados_preferenciais (
  id smallint PRIMARY KEY,
  nome varchar(50) NOT NULL,
  CONSTRAINT lados_preferenciais_nome_unique UNIQUE (nome)
);

CREATE TABLE jogadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id uuid NOT NULL REFERENCES equipes(id),
  posicao_id smallint NOT NULL REFERENCES posicoes(id),
  lado_preferencial_id smallint NOT NULL REFERENCES lados_preferenciais(id),
  nome varchar(255) NOT NULL,
  idade integer NOT NULL CHECK (idade > 0),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  deleted_at timestamptz NULL
);

CREATE INDEX jogadores_equipe_deleted_at_idx
  ON jogadores (equipe_id, deleted_at);

CREATE INDEX jogadores_nome_idx
  ON jogadores (nome);


CREATE TABLE indices_jogadores (
  jogador_id uuid PRIMARY KEY REFERENCES jogadores(id) ON DELETE CASCADE,
  radj double precision NULL,
  goals_relations double precision NULL,
  actions_relations double precision NULL,
  atd double precision NULL,
  dto double precision NULL,
  pgj double precision NULL,
  ic double precision NULL,
  tio double precision NULL CHECK (tio BETWEEN 0 AND 100),
  gtj double precision NULL,
  rf double precision NULL,
  tid double precision NULL CHECK (tid BETWEEN 0 AND 100)
);

CREATE TABLE sessoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id uuid NOT NULL REFERENCES equipes(id),
  session_type_id smallint NOT NULL REFERENCES session_types(id),
  session_location_id smallint NOT NULL REFERENCES session_locations(id),
  session_court_size_id smallint NOT NULL REFERENCES session_court_sizes(id),
  data date NOT NULL,
  descricao text NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  deleted_at timestamptz NULL
);

CREATE INDEX sessoes_equipe_data_idx
  ON sessoes (equipe_id, data DESC);

CREATE INDEX sessoes_tipo_idx
  ON sessoes (session_type_id);

CREATE TABLE tipos_analise (
  id smallint PRIMARY KEY,
  nome varchar(50) NOT NULL,
  CONSTRAINT tipos_analise_nome_unique UNIQUE (nome)
);

CREATE TABLE impactos (
  id smallint PRIMARY KEY,
  nome varchar(50) NOT NULL,
  CONSTRAINT impactos_nome_unique UNIQUE (nome)
);

CREATE TABLE categorias_acao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_analise_id smallint NOT NULL REFERENCES tipos_analise(id),
  nome varchar(100) NOT NULL,
  chave varchar(50) NULL,
  ordem smallint NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  deleted_at timestamptz NULL,
  CONSTRAINT categorias_acao_tipo_nome_unique UNIQUE (tipo_analise_id, nome)
);

CREATE UNIQUE INDEX categorias_acao_tipo_chave_unique
  ON categorias_acao (tipo_analise_id, chave)
  WHERE chave IS NOT NULL;

CREATE INDEX categorias_acao_tipo_deleted_at_idx
  ON categorias_acao (tipo_analise_id, deleted_at);

CREATE TABLE acoes_catalogo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_acao_id uuid NOT NULL REFERENCES categorias_acao(id),
  impacto_id smallint NOT NULL REFERENCES impactos(id),
  nome varchar(255) NOT NULL,
  sigla varchar(30) NOT NULL,
  ordem smallint NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  deleted_at timestamptz NULL,
  CONSTRAINT acoes_catalogo_categoria_nome_unique UNIQUE (categoria_acao_id, nome),
  CONSTRAINT acoes_catalogo_categoria_sigla_unique UNIQUE (categoria_acao_id, sigla)
);

CREATE INDEX acoes_catalogo_categoria_deleted_at_idx
  ON acoes_catalogo (categoria_acao_id, deleted_at);

CREATE TABLE acoes_taggeadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sessao_id uuid NOT NULL REFERENCES sessoes(id),
  acao_catalogo_id uuid NOT NULL REFERENCES acoes_catalogo(id),
  jogador_id uuid NULL REFERENCES jogadores(id),
  timestamp_segundos integer NOT NULL CHECK (timestamp_segundos >= 0),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  deleted_at timestamptz NULL
);

CREATE INDEX acoes_taggeadas_sessao_tempo_idx
  ON acoes_taggeadas (sessao_id, timestamp_segundos);

CREATE INDEX acoes_taggeadas_jogador_idx
  ON acoes_taggeadas (jogador_id);

CREATE INDEX acoes_taggeadas_acao_idx
  ON acoes_taggeadas (acao_catalogo_id);

CREATE TRIGGER equipes_set_updated_at
BEFORE UPDATE ON equipes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER jogadores_set_updated_at
BEFORE UPDATE ON jogadores
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER sessoes_set_updated_at
BEFORE UPDATE ON sessoes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER categorias_acao_set_updated_at
BEFORE UPDATE ON categorias_acao
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER acoes_catalogo_set_updated_at
BEFORE UPDATE ON acoes_catalogo
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER acoes_taggeadas_set_updated_at
BEFORE UPDATE ON acoes_taggeadas
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE session_types IS
'Catalogo fixo para os tipos de sessao. Esperado: 1 = Treino, 2 = Jogo.';

COMMENT ON TABLE session_locations IS
'Catalogo fixo para local da sessao. Esperado: 1 = Casa, 2 = Fora.';

COMMENT ON TABLE session_court_sizes IS
'Catalogo fixo para tamanho da quadra da sessao. Esperado: 1 = Pequena, 2 = Grande.';

COMMENT ON TABLE posicoes IS
'Catalogo fixo das posicoes dos jogadores.';

COMMENT ON TABLE lados_preferenciais IS
'Catalogo fixo da lateralidade do jogador. Ex.: Destro, Canhoto.';

COMMENT ON TABLE tipos_analise IS
'Catalogo fixo dos fluxos de analise. Esperado: 1 = Individual, 2 = Equipe.';

COMMENT ON TABLE impactos IS
'Catalogo fixo do impacto da acao. Ex.: Positiva, Negativa.';

COMMENT ON TABLE categorias_acao IS
'Categorias separadas por tipo de analise, para organizar o catalogo de acoes.';

COMMENT ON TABLE acoes_catalogo IS
'Catalogo das acoes disponiveis para tagueamento. A coluna sigla representa a abreviacao da acao usada no mock/front.';

COMMENT ON TABLE acoes_taggeadas IS
'Evento bruto salvo durante a analise. jogador_id deve ser preenchido apenas para acoes do fluxo individual; para equipe deve permanecer nulo.';
