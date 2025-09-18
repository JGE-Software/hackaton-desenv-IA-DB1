# PIX Infrações API

Sistema para recebimento e análise de relatos de infrações PIX, desenvolvido com Next.js e MongoDB.

## 📋 Sobre o Projeto

Esta aplicação é responsável por receber relatos de infrações do sistema PIX e armazenar em um banco de dados MongoDB. Após o recebimento, um agente de inteligência artificial realiza uma análise prévia do relato e gera um score de risco.

### Contexto do PIX

O Relato de Infração é um mecanismo de segurança oficial do sistema PIX, criado pelo Banco Central do Brasil. Permite que usuários ou instituições financeiras comuniquem transações PIX suspeitas de fraude, golpe ou outras atividades ilícitas.

## 🚀 Tecnologias Utilizadas

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **Docker** - Containerização do banco de dados
- **Tailwind CSS** - Estilização

## 📦 Instalação e Configuração

### Pré-requisitos

- Node.js 18+ 
- Docker e Docker Compose
- npm ou yarn

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd pix-infracoes-api
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
MONGODB_URI=mongodb://pix-user:pix-password@localhost:27017/pix-infracoes
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Inicie o banco de dados

```bash
docker-compose up -d
```

### 5. Execute a aplicação

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 🗄️ Banco de Dados

O MongoDB será executado na porta `27017` com as seguintes credenciais:

- **Usuário admin**: `admin`
- **Senha admin**: `password123`
- **Usuário da aplicação**: `pix-user`
- **Senha da aplicação**: `pix-password`
- **Database**: `pix-infracoes`

### Interface Web do MongoDB

Acesse o Mongo Express em `http://localhost:8081` para gerenciar o banco:

- **Usuário**: `admin`
- **Senha**: `admin123`

## 📡 Endpoints da API

### POST /api/relatos

Registra um novo relato de infração PIX e executa análise automática com agente LLM.

**Resposta inclui:**
- Dados do relato salvo
- Score de análise (0-100+)
- Nível de risco (BAIXO/MEDIO/ALTO/CRITICO)
- Bandeiras vermelhas identificadas
- Recomendações específicas
- Justificativa detalhada da análise
- Nível de confiança do LLM

**Payload de exemplo:**
```json
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
    "descricaoUsuario": "Recebi uma ligação de alguém se passando pelo banco...",
    "evidenciasAnexadas": [
      {
        "tipo": "SCREENSHOT",
        "url": "/evidencias/screenshot_conversa_1.jpg"
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
```

### GET /api/relatos

Lista relatos com paginação e filtros.

**Parâmetros de query:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `status` (opcional): Filtrar por status

### GET /api/relatos/[id]

Busca um relato específico por ID.

### PUT /api/relatos/[id]

Atualiza status e score de um relato.

**Payload:**
```json
{
  "statusRelato": "ALTO_RISCO",
  "scoreAnalise": 85
}
```

### POST /api/analise

Executa análise de IA em um relato.

**Payload:**
```json
{
  "idRelato": "INF-20250918-a4b1c8e2-f5d3-4a0b-8c7e-1f9b0d6a2c3f"
}
```

## 🤖 Agente LLM para Análise de IA

O sistema utiliza um agente LLM (Large Language Model) que analisa relatos baseado em regras específicas do AGENTS.MD. Suporta tanto **Gemini (Google)** quanto **OpenAI**, gerando um prompt estruturado com todos os dados relevantes.

### Regras de Pontuação Implementadas

**Histórico do Recebedor:**
- Relatos anteriores > 0: +40 pontos
- Relatos anteriores > 3: +60 pontos adicionais

**Idade da Conta do Recebedor:**
- Conta aberta nos últimos 30 dias: +30 pontos
- Conta aberta nos últimos 7 dias: +20 pontos adicionais

**Consistência da Transação:**
- Histórico pagador inconsistente: +15 pontos
- Valor 3x maior que média: +25 pontos

**Contexto do Dispositivo:**
- Novo dispositivo: +20 pontos

**Análise de Texto:**
- Palavras-chave suspeitas: +5 pontos por palavra encontrada
- Palavras: "urgente", "seguro", "central", "gerente", "invadida", "ajuda", etc.

**Score de Risco da Conta:**
- Score < 300: +20 pontos
- Score < 600: +10 pontos

**Perfil do Pagador:**
- Perfil alto risco: +15 pontos

### Classificação de Risco

- **BAIXO** (0-30 pontos): Observação
- **MEDIO** (31-70 pontos): Monitoramento intensivo
- **ALTO** (71-100 pontos): Bloqueio cautelar recomendado
- **CRITICO** (101+ pontos): Bloqueio imediato obrigatório

### Configuração do LLM

O sistema suporta tanto **Gemini (Google)** quanto **OpenAI**. Configure as variáveis de ambiente:

#### Opção 1: Gemini (Recomendado)
```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-1.5-flash  # gemini-1.5-flash, gemini-1.5-pro, gemini-1.0-pro
```

**Obter API Key:** https://makersuite.google.com/app/apikey

#### Opção 2: OpenAI
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
```

**Fallback:** Se nenhuma API key estiver configurada, o sistema usa análise mock para desenvolvimento.

## 🏗️ Estrutura do Projeto

```
pix-infracoes-api/
├── app/
│   ├── api/
│   │   ├── relatos/
│   │   │   ├── route.ts          # CRUD de relatos
│   │   │   └── [id]/
│   │   │       └── route.ts      # Operações específicas
│   │   └── analise/
│   │       └── route.ts          # Análise de IA
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Página inicial
├── lib/
│   ├── mongodb.ts                # Conexão com MongoDB
│   └── agenteLLM.ts              # Agente LLM para análise
├── models/
│   └── RelatoInfracao.ts         # Modelo de dados
├── docker-compose.yml            # Configuração do MongoDB
├── mongo-init.js                 # Script de inicialização
└── package.json
```

## 🧪 Testando a API

### Exemplo com cURL

```bash
# Registrar um relato (análise automática com LLM)
curl -X POST http://localhost:3000/api/relatos \
  -H "Content-Type: application/json" \
  -d @exemplo-relato.json

# Listar relatos
curl http://localhost:3000/api/relatos

# Executar análise manual
curl -X POST http://localhost:3000/api/analise \
  -H "Content-Type: application/json" \
  -d '{"idRelato": "INF-20250918-a4b1c8e2-f5d3-4a0b-8c7e-1f9b0d6a2c3f"}'

# Testar agente LLM
node teste-gemini.js
```

## 📊 Monitoramento

- **Mongo Express**: Interface web para o banco de dados
- **Logs da aplicação**: Console do Next.js
- **Métricas**: Score de análise e status dos relatos

## 🔒 Segurança

- Validação de dados de entrada
- Índices únicos para evitar duplicatas
- Sanitização de dados sensíveis
- Conexão segura com MongoDB

## 🚀 Deploy

Para produção, configure:

1. Variáveis de ambiente adequadas
2. MongoDB com autenticação
3. HTTPS/SSL
4. Monitoramento e logs
5. Backup do banco de dados

## 📝 Licença

Este projeto foi desenvolvido para fins educacionais e de demonstração.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.