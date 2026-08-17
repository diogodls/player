import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateLegacyPlayerSessionMinutes1786492800000 implements MigrationInterface {
  name = 'MigrateLegacyPlayerSessionMinutes1786492800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      WITH RECURSIVE ordered_events AS (
        SELECT
          tagged.sessao_id AS session_id,
          tagged.jogador_id AS player_id,
          tagged.timestamp_segundos,
          tagged.id,
          catalog.sigla AS code,
          ROW_NUMBER() OVER (
            PARTITION BY tagged.sessao_id, tagged.jogador_id
            ORDER BY tagged.timestamp_segundos ASC, tagged.id ASC
          ) AS event_number
        FROM acoes_taggeadas tagged
        INNER JOIN acoes_catalogo catalog ON catalog.id = tagged.acao_catalogo_id
        INNER JOIN sessoes session ON session.id = tagged.sessao_id
        INNER JOIN jogadores player ON player.id = tagged.jogador_id
        WHERE catalog.sigla IN ('ENTROU', 'SAIU')
          AND tagged.jogador_id IS NOT NULL
          AND tagged.deleted_at IS NULL
          AND catalog.deleted_at IS NULL
          AND session.deleted_at IS NULL
          AND player.deleted_at IS NULL
      ), processed_events AS (
        SELECT
          event.session_id,
          event.player_id,
          event.event_number,
          CASE WHEN event.code = 'ENTROU' THEN event.timestamp_segundos ELSE NULL END AS entered_at,
          0::bigint AS total_seconds,
          0::integer AS completed_intervals
        FROM ordered_events event
        WHERE event.event_number = 1

        UNION ALL

        SELECT
          event.session_id,
          event.player_id,
          event.event_number,
          CASE
            WHEN event.code = 'ENTROU' THEN COALESCE(processed.entered_at, event.timestamp_segundos)
            WHEN event.code = 'SAIU' AND processed.entered_at IS NOT NULL THEN NULL
            ELSE processed.entered_at
          END AS entered_at,
          processed.total_seconds + CASE
            WHEN event.code = 'SAIU' AND processed.entered_at IS NOT NULL
              THEN event.timestamp_segundos - processed.entered_at
            ELSE 0
          END AS total_seconds,
          processed.completed_intervals + CASE
            WHEN event.code = 'SAIU' AND processed.entered_at IS NOT NULL THEN 1
            ELSE 0
          END AS completed_intervals
        FROM processed_events processed
        INNER JOIN ordered_events event
          ON event.session_id = processed.session_id
          AND event.player_id = processed.player_id
          AND event.event_number = processed.event_number + 1
      ), final_totals AS (
        SELECT DISTINCT ON (session_id, player_id)
          session_id,
          player_id,
          total_seconds,
          completed_intervals
        FROM processed_events
        ORDER BY session_id, player_id, event_number DESC
      )
      INSERT INTO player_session_minutes (
        session_id,
        player_id,
        total_seconds,
        active_since
      )
      SELECT
        session_id,
        player_id,
        total_seconds::integer,
        NULL
      FROM final_totals
      WHERE completed_intervals > 0
      ON CONFLICT (session_id, player_id) DO NOTHING
    `);
  }

  async down(_queryRunner: QueryRunner): Promise<void> {
    // Intentionally a no-op: migrated rows cannot be distinguished safely from
    // legitimate rows created by the new manual/live minutes workflow.
  }
}
