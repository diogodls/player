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

CREATE TABLE adversarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome varchar(255) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT adversarios_nome_unique UNIQUE (nome)
);

CREATE TABLE jogadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id uuid NOT NULL REFERENCES equipes(id),
  posicao_id smallint NOT NULL REFERENCES posicoes(id),
  lado_preferencial_id smallint NOT NULL REFERENCES lados_preferenciais(id),
  nome varchar(255) NOT NULL,
  idade integer NOT NULL CHECK (idade > 0),
  ativo boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX jogadores_equipe_ativo_idx
  ON jogadores (equipe_id, ativo);

CREATE INDEX jogadores_nome_idx
  ON jogadores (nome);

CREATE TABLE sessoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id uuid NOT NULL REFERENCES equipes(id),
  session_type_id smallint NOT NULL REFERENCES session_types(id),
  session_location_id smallint NOT NULL REFERENCES session_locations(id),
  data date NOT NULL,
  descricao text NULL,
  adversario_id uuid NULL REFERENCES adversarios(id),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT sessoes_tipo_adversario_check CHECK (
    (session_type_id = 1 AND adversario_id IS NULL) OR
    (session_type_id = 2 AND adversario_id IS NOT NULL)
  )
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
  ativa boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT categorias_acao_tipo_nome_unique UNIQUE (tipo_analise_id, nome)
);

CREATE INDEX categorias_acao_tipo_ativa_idx
  ON categorias_acao (tipo_analise_id, ativa);

CREATE TABLE acoes_catalogo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_acao_id uuid NOT NULL REFERENCES categorias_acao(id),
  impacto_id smallint NOT NULL REFERENCES impactos(id),
  nome varchar(255) NOT NULL,
  sigla varchar(30) NOT NULL,
  ativa boolean NOT NULL DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT acoes_catalogo_categoria_nome_unique UNIQUE (categoria_acao_id, nome),
  CONSTRAINT acoes_catalogo_categoria_sigla_unique UNIQUE (categoria_acao_id, sigla)
);

CREATE INDEX acoes_catalogo_categoria_ativa_idx
  ON acoes_catalogo (categoria_acao_id, ativa);

CREATE TABLE acoes_taggeadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sessao_id uuid NOT NULL REFERENCES sessoes(id),
  acao_catalogo_id uuid NOT NULL REFERENCES acoes_catalogo(id),
  jogador_id uuid NULL REFERENCES jogadores(id),
  timestamp_segundos integer NOT NULL CHECK (timestamp_segundos >= 0),
  observacao text NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
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

CREATE TRIGGER adversarios_set_updated_at
BEFORE UPDATE ON adversarios
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
