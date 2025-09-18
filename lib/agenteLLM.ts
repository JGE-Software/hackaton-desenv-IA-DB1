import { IRelatoInfracao } from '@/models/RelatoInfracao';

export interface ResultadoAnaliseLLM {
  score: number;
  nivelRisco: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  bandeirasVermelhas: string[];
  recomendacoes: string[];
  justificativa: string;
  confianca: number;
}

export class AgenteLLM {
  private apiKey: string;
  private baseUrl: string;
  private provider: 'openai' | 'gemini';

  constructor() {
    this.provider = (process.env.LLM_PROVIDER as 'openai' | 'gemini') || 'gemini';
    
    if (this.provider === 'gemini') {
      this.apiKey = process.env.GEMINI_API_KEY || '';
      this.baseUrl = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
    } else {
      this.apiKey = process.env.OPENAI_API_KEY || '';
      this.baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    }
  }

  public async analisarRelato(relato: IRelatoInfracao): Promise<ResultadoAnaliseLLM> {
    const prompt = this.gerarPrompt(relato);
    
    try {
      const response = await this.chamarLLM(prompt);
      return this.processarResposta(response);
    } catch (error) {
      console.error('Erro ao chamar LLM:', error);
      // Fallback para análise básica em caso de erro
      return this.analiseFallback(relato);
    }
  }

  private gerarPrompt(relato: IRelatoInfracao): string {
    const dataAbertura = new Date(relato.recebedor.conta.dataAbertura);
    const hoje = new Date();
    const diasDesdeAbertura = Math.floor((hoje.getTime() - dataAbertura.getTime()) / (1000 * 60 * 60 * 24));
    const multiplicador = relato.transacao.valor / relato.metadadosAnalise.valorMedioTransacoesRecebedor;

    return `Você é um agente especializado em análise de fraudes PIX. Analise o seguinte relato de infração e forneça uma pontuação de risco baseada nas regras específicas.

REGRAS DE PONTUAÇÃO:
1. Histórico do Recebedor:
   - Se relatosAnterioresRecebedor > 0: +40 pontos
   - Se relatosAnterioresRecebedor > 3: +60 pontos adicionais

2. Idade da Conta do Recebedor:
   - Se conta aberta nos últimos 30 dias: +30 pontos
   - Se conta aberta nos últimos 7 dias: +20 pontos adicionais

3. Consistência da Transação:
   - Se historicoPagadorConsistente == false: +15 pontos
   - Se valor for 3x maior que valorMedioTransacoesRecebedor: +25 pontos

4. Contexto do Dispositivo:
   - Se novoDispositivo == true: +20 pontos

5. Análise de Texto (descricaoUsuario):
   - Palavras-chave suspeitas: +5 pontos por palavra encontrada
   - Palavras: "urgente", "seguro", "central", "gerente", "invadida", "ajuda", "proteção", "bloqueio", "emergência", "suspensão", "verificação", "confirmar", "dados", "senha", "token", "código", "autenticação"

6. Score de Risco da Conta:
   - Se scoreRiscoConta < 300: +20 pontos
   - Se scoreRiscoConta < 600: +10 pontos

7. Perfil do Pagador:
   - Se perfilRisco == "ALTO": +15 pontos

CLASSIFICAÇÃO DE RISCO:
- 0-30 pontos: BAIXO
- 31-70 pontos: MEDIO  
- 71-100 pontos: ALTO
- 101+ pontos: CRITICO

DADOS DO RELATO:
- ID: ${relato.idRelato}
- Valor da transação: R$ ${relato.transacao.valor.toFixed(2)}
- Relatos anteriores do recebedor: ${relato.metadadosAnalise.relatosAnterioresRecebedor}
- Conta aberta há: ${diasDesdeAbertura} dias
- Score da conta do recebedor: ${relato.recebedor.conta.scoreRiscoConta}
- Histórico pagador consistente: ${relato.metadadosAnalise.historicoPagadorConsistente}
- Novo dispositivo: ${relato.metadadosAnalise.dispositivoTransacao.novoDispositivo}
- Valor vs média: ${multiplicador.toFixed(1)}x maior
- Perfil risco pagador: ${relato.pagador.perfilRisco}
- Descrição do usuário: "${relato.avaliacaoFraude.descricaoUsuario}"

Analise este relato e retorne APENAS um JSON no seguinte formato:
{
  "score": <número total de pontos>,
  "nivelRisco": "<BAIXO|MEDIO|ALTO|CRITICO>",
  "bandeirasVermelhas": ["<lista de bandeiras identificadas>"],
  "recomendacoes": ["<lista de recomendações específicas>"],
  "justificativa": "<explicação detalhada da análise>",
  "confianca": <número de 0 a 100 representando confiança na análise>
}`;
  }

  private async chamarLLM(prompt: string): Promise<string> {
    // Se não houver API key configurada, usar mock para desenvolvimento
    if (!this.apiKey) {
      console.log(`⚠️ ${this.provider.toUpperCase()}_API_KEY não configurada, usando análise mock`);
      return this.gerarRespostaMock();
    }

    if (this.provider === 'gemini') {
      return this.chamarGemini(prompt);
    } else {
      return this.chamarOpenAI(prompt);
    }
  }

  private async chamarGemini(prompt: string): Promise<string> {
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    
    const response = await fetch(`${this.baseUrl}/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key':   this.apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Você é um especialista em análise de fraudes financeiras. Responda sempre em formato JSON válido.

${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000,
          topP: 0.8,
          topK: 10
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API Gemini: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Resposta inválida do Gemini');
    }

    return data.candidates[0].content.parts[0].text;
  }

  private async chamarOpenAI(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em análise de fraudes financeiras. Responda sempre em formato JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API OpenAI: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private processarResposta(response: string): ResultadoAnaliseLLM {
    try {
      // Extrair JSON da resposta (pode conter texto adicional)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Resposta não contém JSON válido');
      }

      const resultado = JSON.parse(jsonMatch[0]);
      
      // Validar estrutura da resposta
      if (!resultado.score || !resultado.nivelRisco) {
        throw new Error('Resposta inválida do LLM');
      }

      return {
        score: resultado.score,
        nivelRisco: resultado.nivelRisco,
        bandeirasVermelhas: resultado.bandeirasVermelhas || [],
        recomendacoes: resultado.recomendacoes || [],
        justificativa: resultado.justificativa || '',
        confianca: resultado.confianca || 0
      };
    } catch (error) {
      console.error('Erro ao processar resposta do LLM:', error);
      throw new Error('Falha ao processar análise do LLM');
    }
  }

  private gerarRespostaMock(): string {
    return JSON.stringify({
      score: 85,
      nivelRisco: "ALTO",
      bandeirasVermelhas: [
        "Recebedor com histórico de relatos anteriores",
        "Conta aberta recentemente",
        "Valor significativamente maior que a média",
        "Palavras-chave suspeitas na descrição"
      ],
      recomendacoes: [
        "Bloquear cautelarmente a conta do recebedor",
        "Iniciar processo de MED",
        "Monitoramento intensivo das transações",
        "Solicitar documentação adicional"
      ],
      justificativa: "Análise baseada em múltiplos indicadores de risco: histórico do recebedor, idade da conta, valor da transação e análise textual. O score elevado indica necessidade de ação preventiva.",
      confianca: 85
    });
  }

  private analiseFallback(relato: IRelatoInfracao): ResultadoAnaliseLLM {
    // Análise básica de fallback
    let score = 0;
    const bandeiras: string[] = [];

    if (relato.metadadosAnalise.relatosAnterioresRecebedor > 0) {
      score += 40;
      bandeiras.push('Recebedor com relatos anteriores');
    }

    if (relato.recebedor.conta.scoreRiscoConta < 300) {
      score += 20;
      bandeiras.push('Score de risco baixo da conta');
    }

    const nivelRisco = score <= 30 ? 'BAIXO' : 
                      score <= 70 ? 'MEDIO' : 
                      score <= 100 ? 'ALTO' : 'CRITICO';

    return {
      score,
      nivelRisco,
      bandeirasVermelhas: bandeiras,
      recomendacoes: ['Análise manual necessária'],
      justificativa: 'Análise de fallback devido a erro no LLM',
      confianca: 50
    };
  }
}
