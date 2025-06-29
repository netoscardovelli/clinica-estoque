import { supabase } from '../supabaseClient';

export async function relatorioIndicadoresMedicacao(medicacaoId, dataInicio, dataFim) {
  try {
    const { data: aplicacoes, error } = await supabase
      .from('aplicacoes')
      .select('data, dose, paciente_id')
      .eq('medicacao_id', medicacaoId)
      .gte('data', dataInicio)
      .lte('data', dataFim);
    if (error) throw error;

    const totalAplicacoes = aplicacoes.length;
    const totalMg = aplicacoes.reduce((sum, a) => sum + parseFloat(a.dose), 0);
    const pacientesUnicos = [...new Set(aplicacoes.map((a) => a.paciente_id))];
    const diasPeriodo =
      (new Date(dataFim).getTime() - new Date(dataInicio).getTime()) /
      (1000 * 60 * 60 * 24);

    return {
      total_mg_aplicado: totalMg,
      media_diaria: totalMg / diasPeriodo,
      media_por_aplicacao: totalMg / totalAplicacoes,
      media_por_paciente: totalMg / pacientesUnicos.length,
      numero_pacientes: pacientesUnicos.length,
    };
  } catch (error) {
    console.error('Erro ao gerar relatorioIndicadoresMedicacao', error);
    throw error;
  }
}
