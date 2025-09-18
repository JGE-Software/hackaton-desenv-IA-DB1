Contexto 
    A aplicação será responsável por rebecer relatos de infrações e armazenar em um banco de dados. Após recebido, será criado um agente de inteligência artificial para realizar uma análise prévia do relato de infração e um score.

O que é um Relato de Infração no Contexto do Pix?
O Relato de Infração, também conhecido como Notificação de Infração, é um mecanismo de segurança oficial do sistema Pix, criado pelo Banco Central do Brasil. Ele permite que um usuário (pagador) ou uma instituição financeira comunique uma transação Pix como suspeita de fraude, golpe ou outra atividade ilícita.

Funciona como um "boletim de ocorrência" dentro do ecossistema financeiro. Ao registrar um relato, você sinaliza para o banco do recebedor que a conta que recebeu o dinheiro está potencialmente envolvida em uma fraude.

Principais Objetivos e Características:

Marcar a Chave e a Conta Suspeita: A principal função é "marcar" a chave Pix e/ou a conta bancária do recebedor como suspeita. Essas marcações são compartilhadas entre todas as instituições financeiras participantes do Pix.

Prevenir Futuros Golpes: Quando uma conta recebe múltiplas notificações de infração, os bancos podem tomar medidas preventivas, como bloquear a conta ou até mesmo encerrá-la, impedindo que o golpista continue usando-a para aplicar novos golpes.

Possibilitar o Bloqueio e Devolução (MED): O relato de infração é o primeiro passo para acionar o Mecanismo Especial de Devolução (MED). Ao receber a notificação, o banco do recebedor pode bloquear cautelarmente os fundos na conta (se ainda estiverem lá) para análise e uma eventual devolução ao pagador.

Não Garante a Devolução: É crucial entender que registrar o relato de infração não garante o estorno do dinheiro. A devolução depende da existência de saldo na conta do recebedor no momento do bloqueio.

Quando usar? O relato deve ser aberto em situações como:

Golpes: Falsa central de atendimento, golpe do parente no WhatsApp, falso leilão, etc.

Fraudes: A sua conta foi invadida e um terceiro realizou um Pix sem sua autorização.

Lojas Falsas: Compra em um e-commerce que não existe e nunca entregou o produto.

O registro é feito diretamente no aplicativo do banco do pagador, geralmente na seção do extrato ou detalhes da transação Pix realizada.

## Esse é um modelo de payload que a aplicação vai receber:

{
  "idRelato": "INF-20250918-a4b1c8e2-f5d3-4a0b-8c7e-1f9b0d6a2c3f",
  "dataHoraRelato": "2025-09-18T14:30:15Z",
  "statusRelato": "EM_ANALISE",
  "transacao": {
    "endToEndId": "E18236120202509181425s0a1b2c3d4e",
    "txid": "PAYLOADQRCODE123456789",
    "valor": 1250.75,
    "dataHoraTransacao": "2025-09-18T14:25:00Z",
    "tipoIniciacao": "CHAVE_ALEATORIA"
  },
  "pagador": {
    "cpf": "111.222.333-44",
    "nome": "João da Silva",
    "agencia": "0001",
    "conta": "12345-6",
    "instituicao": "MeuBanco S.A.",
    "perfilRisco": "BAIXO"
  },
  "recebedor": {
    "cpfCnpj": "999.888.777-66",
    "nome": "Maria Souza",
    "chavePix": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "instituicao": "Banco Digital XYZ",
    "conta": {
      "agencia": "0001",
      "numero": "98765-4",
      "dataAbertura": "2025-08-20",
      "scoreRiscoConta": 850
    }
  },
  "avaliacaoFraude": {
    "motivoRelato": "GOLPE",
    "subtipoGolpe": "FALSA_CENTRAL_TELEFONICA",
    "descricaoUsuario": "Recebi uma ligação de alguém se passando pelo banco, dizendo que minha conta foi invadida. Me instruíram a fazer um Pix para uma 'conta segura' para proteger meu dinheiro. Depois da transferência, a pessoa desligou e não consegui mais contato.",
    "evidenciasAnexadas": [
      {
        "tipo": "SCREENSHOT",
        "url": "/evidencias/screenshot_conversa_1.jpg"
      },
      {
        "tipo": "AUDIO",
        "url": "/evidencias/gravacao_chamada.mp3"
      }
    ]
  },
  "metadadosAnalise": {
    "relatosAnterioresRecebedor": 3,
    "valorMedioTransacoesRecebedor": 250.00,
    "historicoPagadorConsistente": false,
    "dispositivoTransacao": {
      "idDispositivo": "DEVICE_ID_XYZ123",
      "localizacaoIp": "177.104.1.XX",
      "novoDispositivo": true
    }
  }
}


## Informações para criação do agente de análise do relato
Vamos criar um sistema de pontuação. O agente atribui pontos para cada "bandeira vermelha" (red flag) encontrada no relato.

Exemplos de Regras e Pontuações:

Histórico do Recebedor:

Se metadadosAnalise.relatosAnterioresRecebedor > 0: +40 pontos (este é um forte indicador).

Se metadadosAnalise.relatosAnterioresRecebedor > 3: +60 pontos adicionais.

Idade da Conta do Recebedor:

Se recebedor.conta.dataAbertura for nos últimos 30 dias: +30 pontos.

Se recebedor.conta.dataAbertura for nos últimos 7 dias: +20 pontos adicionais.

Consistência da Transação:

Se metadadosAnalise.historicoPagadorConsistente == false: +15 pontos.

Se transacao.valor for 3x maior que metadadosAnalise.valorMedioTransacoesRecebedor: +25 pontos.

Contexto do Dispositivo:

Se metadadosAnalise.dispositivoTransacao.novoDispositivo == true: +20 pontos.

Palavras-chave na Descrição (Análise de Texto Simples):

Se avaliacaoFraude.descricaoUsuario contiver palavras como "urgente", "seguro", "central", "gerente", "invadida", "ajuda": +5 pontos por palavra-chave encontrada.

Definição dos Níveis de Risco:

0-30 Pontos: Risco Baixo

31-70 Pontos: Risco Médio

71-100 Pontos: Risco Alto

101+ Pontos: Risco Crítico / Fraude Provável