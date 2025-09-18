import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RelatoInfracao from '@/models/RelatoInfracao';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { idRelato } = await request.json();

    if (!idRelato) {
      return NextResponse.json(
        { error: 'ID do relato é obrigatório' },
        { status: 400 }
      );
    }

    const relato = await RelatoInfracao.findOne({ idRelato });

    if (!relato) {
      return NextResponse.json(
        { error: 'Relato não encontrado' },
        { status: 404 }
      );
    }

    // Simulação de análise de IA baseada nos metadados
    const score = calcularScoreAnalise(relato);
    const status = score > 70 ? 'ALTO_RISCO' : score > 40 ? 'MEDIO_RISCO' : 'BAIXO_RISCO';

    // Atualizar relato com score e status
    const relatoAtualizado = await RelatoInfracao.findOneAndUpdate(
      { idRelato },
      { 
        scoreAnalise: score,
        statusRelato: status,
        dataAtualizacao: new Date()
      },
      { new: true }
    );

    return NextResponse.json({
      message: 'Análise concluída com sucesso',
      idRelato: relatoAtualizado?.idRelato,
      scoreAnalise: score,
      statusRelato: status,
      recomendacoes: gerarRecomendacoes(score, relato)
    });

  } catch (error) {
    console.error('Erro ao processar análise:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function calcularScoreAnalise(relato: any): number {
  let score = 0;

  // Fatores de risco baseados nos metadados
  const { metadadosAnalise, transacao, pagador, recebedor } = relato;

  // Relatos anteriores do recebedor (peso alto)
  if (metadadosAnalise.relatosAnterioresRecebedor > 5) {
    score += 30;
  } else if (metadadosAnalise.relatosAnterioresRecebedor > 2) {
    score += 20;
  } else if (metadadosAnalise.relatosAnterioresRecebedor > 0) {
    score += 10;
  }

  // Valor da transação vs valor médio
  const valorTransacao = transacao.valor;
  const valorMedio = metadadosAnalise.valorMedioTransacoesRecebedor;
  if (valorTransacao > valorMedio * 3) {
    score += 25;
  } else if (valorTransacao > valorMedio * 2) {
    score += 15;
  }

  // Score de risco da conta do recebedor
  if (recebedor.conta.scoreRiscoConta < 300) {
    score += 20;
  } else if (recebedor.conta.scoreRiscoConta < 600) {
    score += 10;
  }

  // Novo dispositivo
  if (metadadosAnalise.dispositivoTransacao.novoDispositivo) {
    score += 15;
  }

  // Histórico inconsistente do pagador
  if (!metadadosAnalise.historicoPagadorConsistente) {
    score += 10;
  }

  // Perfil de risco do pagador
  if (pagador.perfilRisco === 'ALTO') {
    score += 5;
  }

  return Math.min(score, 100); // Limitar a 100
}

function gerarRecomendacoes(score: number, relato: any): string[] {
  const recomendacoes: string[] = [];

  if (score > 70) {
    recomendacoes.push('Bloquear imediatamente a conta do recebedor');
    recomendacoes.push('Iniciar processo de MED (Mecanismo Especial de Devolução)');
    recomendacoes.push('Notificar autoridades competentes');
  } else if (score > 40) {
    recomendacoes.push('Monitorar transações da conta do recebedor');
    recomendacoes.push('Solicitar documentação adicional');
    recomendacoes.push('Aguardar mais evidências antes de tomar ação');
  } else {
    recomendacoes.push('Manter relato em observação');
    recomendacoes.push('Verificar consistência com outros relatos');
  }

  if (relato.metadadosAnalise.relatosAnterioresRecebedor > 3) {
    recomendacoes.push('Conta do recebedor apresenta histórico suspeito');
  }

  return recomendacoes;
}
