import { RelatoPayload } from './api';

// Dados de exemplo para BAIXO RISCO
export const baixoRiscoData: RelatoPayload = {
  dataHoraRelato: new Date().toISOString(),
  transacao: {
    endToEndId: "E12345678202401010000000000000001",
    txid: "TXN12345678901234567890123456789012",
    valor: 150.00,
    dataHoraTransacao: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    tipoIniciacao: "QR_CODE"
  },
  pagador: {
    cpf: "12345678901",
    nome: "João Silva Santos",
    agencia: "1234",
    conta: "567890",
    instituicao: "Banco do Brasil",
    perfilRisco: "BAIXO"
  },
  recebedor: {
    cpfCnpj: "98765432100",
    nome: "Maria Oliveira Costa",
    chavePix: "maria.oliveira@email.com",
    instituicao: "Nubank",
    conta: {
      agencia: "0001",
      numero: "12345678",
      dataAbertura: "2020-01-15T00:00:00.000Z",
      scoreRiscoConta: 85
    }
  },
  avaliacaoFraude: {
    motivoRelato: "Transação não autorizada",
    subtipoGolpe: "Clonagem de cartão",
    descricaoUsuario: "Recebi uma notificação de PIX que não realizei. Valor de R$ 150,00 para uma pessoa que não conheço.",
    evidenciasAnexadas: [
      {
        tipo: "print_tela",
        url: "https://exemplo.com/evidencia1.jpg"
      }
    ]
  },
  metadadosAnalise: {
    relatosAnterioresRecebedor: 0,
    valorMedioTransacoesRecebedor: 200.00,
    historicoPagadorConsistente: true,
    dispositivoTransacao: {
      idDispositivo: "DEV123456789",
      localizacaoIp: "192.168.1.100",
      novoDispositivo: false
    }
  }
};

// Dados de exemplo para MÉDIO RISCO
export const medioRiscoData: RelatoPayload = {
  dataHoraRelato: new Date().toISOString(),
  transacao: {
    endToEndId: "E12345678202401010000000000000002",
    txid: "TXN12345678901234567890123456789013",
    valor: 2500.00,
    dataHoraTransacao: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutos atrás
    tipoIniciacao: "CHAVE_PIX"
  },
  pagador: {
    cpf: "11122233344",
    nome: "Carlos Eduardo Ferreira",
    agencia: "5678",
    conta: "901234",
    instituicao: "Itaú",
    perfilRisco: "MEDIO"
  },
  recebedor: {
    cpfCnpj: "44455566677",
    nome: "Ana Paula Rodrigues",
    chavePix: "+5511999888777",
    instituicao: "Bradesco",
    conta: {
      agencia: "1234",
      numero: "87654321",
      dataAbertura: "2023-06-20T00:00:00.000Z",
      scoreRiscoConta: 45
    }
  },
  avaliacaoFraude: {
    motivoRelato: "Golpe do PIX",
    subtipoGolpe: "Falsa identidade",
    descricaoUsuario: "Recebi uma mensagem no WhatsApp de alguém se passando por funcionário do banco pedindo para fazer um PIX de R$ 2.500,00 para 'liberar' minha conta. Realizei o PIX e depois descobri que era golpe.",
    evidenciasAnexadas: [
      {
        tipo: "print_conversa",
        url: "https://exemplo.com/evidencia2.jpg"
      },
      {
        tipo: "comprovante_pix",
        url: "https://exemplo.com/evidencia3.jpg"
      }
    ]
  },
  metadadosAnalise: {
    relatosAnterioresRecebedor: 2,
    valorMedioTransacoesRecebedor: 1800.00,
    historicoPagadorConsistente: false,
    dispositivoTransacao: {
      idDispositivo: "DEV987654321",
      localizacaoIp: "201.45.123.45",
      novoDispositivo: true
    }
  }
};

// Dados de exemplo para CRÍTICO
export const criticoRiscoData: RelatoPayload = {
  dataHoraRelato: new Date().toISOString(),
  transacao: {
    endToEndId: "E12345678202401010000000000000003",
    txid: "TXN12345678901234567890123456789014",
    valor: 50000.00,
    dataHoraTransacao: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutos atrás
    tipoIniciacao: "CHAVE_PIX"
  },
  pagador: {
    cpf: "55566677788",
    nome: "Roberto Almeida Silva",
    agencia: "9999",
    conta: "111111",
    instituicao: "Santander",
    perfilRisco: "ALTO"
  },
  recebedor: {
    cpfCnpj: "99988877766",
    nome: "José da Silva Santos",
    chavePix: "jose.silva@email.com",
    instituicao: "Caixa Econômica",
    conta: {
      agencia: "0001",
      numero: "99999999",
      dataAbertura: "2024-01-01T00:00:00.000Z",
      scoreRiscoConta: 15
    }
  },
  avaliacaoFraude: {
    motivoRelato: "Golpe do PIX",
    subtipoGolpe: "Sequestro virtual",
    descricaoUsuario: "Recebi uma ligação de alguém se passando por funcionário do banco dizendo que minha conta estava comprometida e que eu precisava transferir todo meu dinheiro (R$ 50.000) para uma conta 'segura' para protegê-lo. Fiz o PIX e depois descobri que era golpe. Perdi todo meu dinheiro.",
    evidenciasAnexadas: [
      {
        tipo: "gravacao_audio",
        url: "https://exemplo.com/evidencia4.mp3"
      },
      {
        tipo: "print_conversa",
        url: "https://exemplo.com/evidencia5.jpg"
      },
      {
        tipo: "comprovante_pix",
        url: "https://exemplo.com/evidencia6.jpg"
      }
    ]
  },
  metadadosAnalise: {
    relatosAnterioresRecebedor: 8,
    valorMedioTransacoesRecebedor: 35000.00,
    historicoPagadorConsistente: false,
    dispositivoTransacao: {
      idDispositivo: "DEV555666777",
      localizacaoIp: "45.123.45.67",
      novoDispositivo: true
    }
  }
};

export const sampleDataByRisk = {
  BAIXO: baixoRiscoData,
  MEDIO: medioRiscoData,
  CRITICO: criticoRiscoData
};
