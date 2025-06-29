import { supabase } from '../supabaseClient';

export async function relatorioPorPeriodo(dataInicio, dataFim) {
  try {
    const { data: aplicacoes, error } = await supabase
      .from('aplicacoes')
      .select('data, paciente_id, medicacao_id, dose')
      .gte('data', dataInicio)
      .lte('data', dataFim);
    if (error) throw error;

    return aplicacoes;
  } catch (error) {
    console.error('Erro ao gerar relatorioPorPeriodo', error);
    throw error;
  }
}
