import { supabase } from '../supabaseClient';

export async function relatorioEstoqueCritico() {
  try {
    const { data: itens, error } = await supabase
      .from('estoque')
      .select('nome, tipo, quantidade_atual, estoque_minimo, unidade, consumo_medio_diario');
    if (error) throw error;

    const criticos = itens
      .filter((item) => item.quantidade_atual < item.estoque_minimo)
      .map((item) => {
        const dias = item.consumo_medio_diario
          ? Math.floor(item.quantidade_atual / item.consumo_medio_diario)
          : null;
        return {
          nome: item.nome,
          tipo: item.tipo,
          quantidade_atual: item.quantidade_atual,
          estoque_minimo: item.estoque_minimo,
          unidade: item.unidade,
          dias_restantes_estimados: dias,
          status: 'Crítico',
        };
      });

    return criticos.sort((a, b) => a.quantidade_atual - b.quantidade_atual);
  } catch (error) {
    console.error('Erro ao gerar relatorioEstoqueCritico', error);
    throw error;
  }
}
