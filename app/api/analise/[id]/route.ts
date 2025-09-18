import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AnaliseRelato from '@/models/AnaliseRelato';
import RelatoInfracao from '@/models/RelatoInfracao';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const relatoId = params.id;

    // Buscar relato primeiro para validar se existe
    const relato = await RelatoInfracao.findById(relatoId);
    if (!relato) {
      return NextResponse.json(
        { error: 'Relato não encontrado' },
        { status: 404 }
      );
    }

    // Buscar a análise mais recente do relato
    const analise = await AnaliseRelato.findOne({ relatoId })
      .sort({ dataAnalise: -1 })
      .exec();

    if (!analise) {
      return NextResponse.json(
        { 
          error: 'Análise não encontrada para este relato',
          relato: {
            id: relato._id,
            status: relato.statusRelato,
            dataCriacao: relato.dataCriacao
          }
        },
        { status: 404 }
      );
    }

    // Retornar análise completa
    return NextResponse.json({
      relato: {
        id: relato._id,
        status: relato.statusRelato,
        dataCriacao: relato.dataCriacao,
        dataAtualizacao: relato.dataAtualizacao
      },
      analise: {
        id: analise._id,
        score: analise.score,
        nivelRisco: analise.nivelRisco,
        bandeirasVermelhas: analise.bandeirasVermelhas,
        recomendacoes: analise.recomendacoes,
        justificativa: analise.justificativa,
        confianca: analise.confianca,
        provider: analise.provider,
        modelo: analise.modelo,
        dataAnalise: analise.dataAnalise,
        dataCriacao: analise.dataCriacao
      }
    });

  } catch (error) {
    console.error('Erro ao buscar análise:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const relatoId = params.id;

    // Verificar se o relato existe
    const relato = await RelatoInfracao.findById(relatoId);
    if (!relato) {
      return NextResponse.json(
        { error: 'Relato não encontrado' },
        { status: 404 }
      );
    }

    // Deletar todas as análises do relato
    const resultado = await AnaliseRelato.deleteMany({ relatoId });

    return NextResponse.json({
      message: 'Análises removidas com sucesso',
      relatoId,
      analisesRemovidas: resultado.deletedCount
    });

  } catch (error) {
    console.error('Erro ao remover análises:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
