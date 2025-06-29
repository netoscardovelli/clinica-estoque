import { supabase } from '../supabaseClient';

export async function relatorioAlertasClinicos() {
  try {
    const { data: pacientes, error } = await supabase
      .from('pacientes')
      .select('id, nome');
    if (error) throw error;

    const hoje = new Date();
    const diasLimite = 14;

    const alertas = await Promise.all(
      pacientes.map(async (p) => {
        const { data: ultima, error: aplicacaoError } = await supabase
          .from('aplicacoes')
          .select('data')
          .eq('paciente_id', p.id)
          .order('data', { ascending: false })
          .limit(1)
          .single();
        if (aplicacaoError) throw aplicacaoError;

        const diasSemAplicar = ultima?.data
          ? Math.floor((hoje.getTime() - new Date(ultima.data).getTime()) / (1000 * 60 * 60 * 24))
          : null;

        if (diasSemAplicar !== null && diasSemAplicar > diasLimite) {
          return {
            paciente: p.nome,
            dias_sem_aplicacao: diasSemAplicar,
          };
        }
        return null;
      })
    );

    return alertas.filter(Boolean);
  } catch (error) {
    console.error('Erro ao gerar relatorioAlertasClinicos', error);
    throw error;
  }
}
