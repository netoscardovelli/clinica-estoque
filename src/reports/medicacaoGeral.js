import { supabase } from '../supabaseClient';

export async function relatorioMedicacaoGeral(nomeMedicacao) {
  try {
    const { data: medicacao, error: medicacaoError } = await supabase
      .from('medicacoes')
      .select('id')
      .eq('nome', nomeMedicacao)
      .single();
    if (medicacaoError) throw medicacaoError;

    const { data: aplicacoes, error: aplicacoesError } = await supabase
      .from('aplicacoes')
      .select('data, dose, paciente_id')
      .eq('medicacao_id', medicacao.id);
    if (aplicacoesError) throw aplicacoesError;

    const pacientesIds = [...new Set(aplicacoes.map((a) => a.paciente_id))];

    const pacientes = await Promise.all(
      pacientesIds.map(async (id) => {
        const { data: info, error } = await supabase
          .from('pacientes')
          .select('nome, cpf')
          .eq('id', id)
          .single();
        if (error) throw error;

        const historico = aplicacoes
          .filter((a) => a.paciente_id === id)
          .map((a) => ({ data: a.data, dose: a.dose }));

        return {
          nome: info.nome,
          cpf: info.cpf,
          doses_utilizadas: historico,
          dose_atual: historico[historico.length - 1]?.dose,
        };
      })
    );

    return {
      medicacao: nomeMedicacao,
      quantidade_pacientes_ativos: pacientes.length,
      pacientes,
    };
  } catch (error) {
    console.error('Erro ao gerar relatorioMedicacaoGeral', error);
    throw error;
  }
}
