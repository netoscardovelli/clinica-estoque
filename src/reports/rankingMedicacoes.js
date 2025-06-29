import { supabase } from '../supabaseClient';

export async function relatorioRankingMedicacoes(dataInicio, dataFim) {
  try {
    const { data: aplicacoes, error } = await supabase
      .from('aplicacoes')
      .select('medicacao_id')
      .gte('data', dataInicio)
      .lte('data', dataFim);
    if (error) throw error;

    const totalPorMedicacao = aplicacoes.reduce((acc, a) => {
      acc[a.medicacao_id] = (acc[a.medicacao_id] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(totalPorMedicacao)
      .map(([medicacao_id, total]) => ({ medicacao_id, total }))
      .sort((a, b) => b.total - a.total);
  } catch (error) {
    console.error('Erro ao gerar relatorioRankingMedicacoes', error);
    throw error;
  }
}
