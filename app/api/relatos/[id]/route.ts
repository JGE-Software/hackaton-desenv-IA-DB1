import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RelatoInfracao from '@/models/RelatoInfracao';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const relato = await RelatoInfracao.findById(params.id);

    if (!relato) {
      return NextResponse.json(
        { error: 'Relato não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(relato);

  } catch (error) {
    console.error('Erro ao buscar relato:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { statusRelato, scoreAnalise } = body;

    const relato = await RelatoInfracao.findByIdAndUpdate(
      params.id,
      { 
        statusRelato,
        scoreAnalise,
        dataAtualizacao: new Date()
      },
      { new: true }
    );

    if (!relato) {
      return NextResponse.json(
        { error: 'Relato não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Relato atualizado com sucesso',
      relato
    });

  } catch (error) {
    console.error('Erro ao atualizar relato:', error);
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

    const relato = await RelatoInfracao.findByIdAndDelete(params.id);

    if (!relato) {
      return NextResponse.json(
        { error: 'Relato não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Relato excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir relato:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
