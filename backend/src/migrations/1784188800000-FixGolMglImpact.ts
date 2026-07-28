import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixGolMglImpact1784188800000 implements MigrationInterface {
  name = 'FixGolMglImpact1784188800000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE acoes_catalogo AS acao
      SET impacto_id = impacto.id
      FROM categorias_acao categoria, impactos impacto
      WHERE acao.categoria_acao_id = categoria.id
        AND categoria.tipo_analise_id = 1
        AND acao.sigla = 'Gol MGL'
        AND impacto.nome = 'Positiva'
        AND acao.impacto_id IS DISTINCT FROM impacto.id
    `);
  }

  async down(): Promise<void> {
    // Correcao de dado sem reversao: voltar ao valor incorreto nao e seguro.
  }
}
