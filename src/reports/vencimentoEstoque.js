import { supabase } from '../supabaseClient';

export async function relatorioVencimentoEstoque() {
  try {
    const hoje = new Date().toISOString();

    const { data: lotes, error } = await supabase
      .from('estoque_lotes')
      .select('medicamento, lote, quantidade, validade')
      .gte('validade', hoje)
      .order('validade', { ascending: true });
    if (error) throw error;

    return lotes.map((item) => {
      const diasRestantes = Math.floor(
        (new Date(item.validade).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return {
        medicamento: item.medicamento,
        lote: item.lote,
        quantidade: item.quantidade,
        validade: item.validade,
        dias_restantes: diasRestantes,
        situacao:
          diasRestantes < 30 ? 'Urgente' : diasRestantes < 60 ? 'Priorizar' : 'OK',
      };
    });
  } catch (error) {
    console.error('Erro ao gerar relatorioVencimentoEstoque', error);
    throw error;
  }
}
