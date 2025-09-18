// Tipos para a API
export interface RelatoPayload {
  dataHoraRelato: string;
  transacao: {
    endToEndId: string;
    txid: string;
    valor: number;
    dataHoraTransacao: string;
    tipoIniciacao: string;
  };
  pagador: {
    cpf: string;
    nome: string;
    agencia: string;
    conta: string;
    instituicao: string;
    perfilRisco: string;
  };
  recebedor: {
    cpfCnpj: string;
    nome: string;
    chavePix: string;
    instituicao: string;
    conta: {
      agencia: string;
      numero: string;
      dataAbertura: string;
      scoreRiscoConta: number;
    };
  };
  avaliacaoFraude: {
    motivoRelato: string;
    subtipoGolpe: string;
    descricaoUsuario: string;
    evidenciasAnexadas: Array<{
      tipo: string;
      url: string;
    }>;
  };
  metadadosAnalise: {
    relatosAnterioresRecebedor: number;
    valorMedioTransacoesRecebedor: number;
    historicoPagadorConsistente: boolean;
    dispositivoTransacao: {
      idDispositivo: string;
      localizacaoIp: string;
      novoDispositivo: boolean;
    };
  };
}

export interface RelatoResponse {
  message: string;
  id: string;
  status: string;
  analise: {
    score: number;
    nivelRisco: string;
    bandeirasVermelhas: string[];
    recomendacoes: string[];
    justificativa: string;
    confianca: number;
  };
}

export interface AnaliseResponse {
  relato: {
    id: string;
    status: string;
    dataCriacao: string;
    dataAtualizacao: string;
  };
  analise: {
    id: string;
    score: number;
    nivelRisco: string;
    bandeirasVermelhas: string[];
    recomendacoes: string[];
    justificativa: string;
    confianca: number;
    provider: string;
    modelo: string;
    dataAnalise: string;
    dataCriacao: string;
  };
}

export interface RelatosListResponse {
  relatos: Array<{
    _id: string;
    statusRelato: string;
    scoreAnalise?: number;
    dataCriacao: string;
    dataAtualizacao: string;
    dataHoraRelato: string;
    transacao: {
      valor: number;
      dataHoraTransacao: string;
      endToEndId: string;
      txid: string;
      tipoIniciacao: string;
    };
    pagador: {
      nome: string;
      cpf: string;
      agencia: string;
      conta: string;
      instituicao: string;
      perfilRisco: string;
    };
    recebedor: {
      nome: string;
      cpfCnpj: string;
      chavePix: string;
      instituicao: string;
    };
    avaliacaoFraude: {
      motivoRelato: string;
      subtipoGolpe: string;
      descricaoUsuario: string;
    };
  }>;
  totalPages: number;
  currentPage: number;
  total: number;
}

// Funções da API
export async function submitRelato(payload: RelatoPayload): Promise<RelatoResponse> {
  const response = await fetch('/api/relatos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao enviar relato');
  }

  return response.json();
}

export async function getRelatos(page: number = 1, limit: number = 10, status?: string): Promise<RelatosListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(status && { status }),
  });

  const response = await fetch(`/api/relatos?${params}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao buscar relatos');
  }

  return response.json();
}

export async function getAnalise(relatoId: string): Promise<AnaliseResponse> {
  const response = await fetch(`/api/analise/${relatoId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao buscar análise');
  }

  return response.json();
}
