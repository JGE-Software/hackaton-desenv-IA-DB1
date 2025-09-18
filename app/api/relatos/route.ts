import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RelatoInfracao from '@/models/RelatoInfracao';
import { AgenteLLM } from '@/lib/agenteLLM';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validação básica dos campos obrigatórios
    if (!body.idRelato || !body.transacao || !body.pagador || !body.recebedor || !body.avaliacaoFraude) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Verificar se já existe um relato com o mesmo ID
    const relatoExistente = await RelatoInfracao.findOne({ idRelato: body.idRelato });
    if (relatoExistente) {
      return NextResponse.json(
        { error: 'Relato com este ID já existe' },
        { status: 409 }
      );
    }

    // Criar novo relato de infração
    const novoRelato = new RelatoInfracao({
      ...body,
      dataHoraRelato: new Date(body.dataHoraRelato),
      transacao: {
        ...body.transacao,
        dataHoraTransacao: new Date(body.transacao.dataHoraTransacao)
      },
      recebedor: {
        ...body.recebedor,
        conta: {
          ...body.recebedor.conta,
          dataAbertura: new Date(body.recebedor.conta.dataAbertura)
        }
      }
    });

    const relatoSalvo = await novoRelato.save();

    // Executar análise com agente LLM
    const agenteLLM = new AgenteLLM();
    const resultadoAnalise = await agenteLLM.analisarRelato(relatoSalvo);

    // Atualizar relato com o score e status baseado na análise
    const statusAtualizado = resultadoAnalise.nivelRisco === 'CRITICO' ? 'CRITICO' :
                            resultadoAnalise.nivelRisco === 'ALTO' ? 'ALTO_RISCO' :
                            resultadoAnalise.nivelRisco === 'MEDIO' ? 'MEDIO_RISCO' : 'BAIXO_RISCO';

    const relatoAtualizado = await RelatoInfracao.findByIdAndUpdate(
      relatoSalvo._id,
      {
        scoreAnalise: resultadoAnalise.score,
        statusRelato: statusAtualizado,
        dataAtualizacao: new Date()
      },
      { new: true }
    );

    return NextResponse.json(
      { 
        message: 'Relato de infração registrado e analisado com sucesso',
        id: relatoAtualizado?._id,
        idRelato: relatoAtualizado?.idRelato,
        status: relatoAtualizado?.statusRelato,
        analise: {
          score: resultadoAnalise.score,
          nivelRisco: resultadoAnalise.nivelRisco,
          bandeirasVermelhas: resultadoAnalise.bandeirasVermelhas,
          recomendacoes: resultadoAnalise.recomendacoes,
          justificativa: resultadoAnalise.justificativa,
          confianca: resultadoAnalise.confianca
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro ao processar relato de infração:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const query = status ? { statusRelato: status } : {};

    const relatos = await RelatoInfracao.find(query)
      .sort({ dataCriacao: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await RelatoInfracao.countDocuments(query);

    return NextResponse.json({
      relatos,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Erro ao buscar relatos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
