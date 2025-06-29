import { supabase } from '../supabaseClient';

export async function relatorioEvolucaoPaciente(pacienteId) {
  try {
    const { data: paciente, error: pacienteError } = await supabase
      .from('pacientes')
      .select('nome, cpf')
      .eq('id', pacienteId)
      .single();
    if (pacienteError) throw pacienteError;

    const { data: evolucoes, error: evolucoesError } = await supabase
      .from('evolucoes')
      .select('data, descricao, medicacoes, profissional')
      .eq('paciente_id', pacienteId)
      .order('data', { ascending: false });
    if (evolucoesError) throw evolucoesError;

    return {
      paciente: paciente.nome,
      cpf: paciente.cpf,
      evolucoes,
    };
  } catch (error) {
    console.error('Erro ao gerar relatorioEvolucaoPaciente', error);
    throw error;
  }
}
