'use client';

import { useState } from 'react';
import { submitRelato, RelatoPayload } from '@/lib/api';
import { sampleDataByRisk } from '@/lib/sampleData';

export default function SubmitPage() {
  const [selectedRisk, setSelectedRisk] = useState<'BAIXO' | 'MEDIO' | 'CRITICO' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (riskLevel: 'BAIXO' | 'MEDIO' | 'CRITICO') => {
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const payload = sampleDataByRisk[riskLevel];
      const response = await submitRelato(payload);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'BAIXO': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIO': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CRITICO': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskDescription = (risk: string) => {
    switch (risk) {
      case 'BAIXO': return 'Transação de baixo valor, histórico limpo, baixo risco de fraude';
      case 'MEDIO': return 'Transação de valor médio, alguns indicadores suspeitos, risco moderado';
      case 'CRITICO': return 'Transação de alto valor, múltiplos indicadores suspeitos, alto risco';
      default: return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Enviar Relato de Infração PIX</h1>
        <p className="mt-2 text-lg text-gray-600">
          Selecione um nível de risco para enviar um relato de exemplo
        </p>
      </div>

      {/* Seleção de Nível de Risco */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {(['BAIXO', 'MEDIO', 'CRITICO'] as const).map((risk) => (
          <div
            key={risk}
            className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedRisk === risk
                ? 'ring-2 ring-blue-500 border-blue-500'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedRisk(risk)}
          >
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(risk)}`}>
                {risk}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {risk === 'BAIXO' && 'Baixo Risco'}
                {risk === 'MEDIO' && 'Médio Risco'}
                {risk === 'CRITICO' && 'Crítico'}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {getRiskDescription(risk)}
              </p>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900">
                  {risk === 'BAIXO' && 'R$ 150,00'}
                  {risk === 'MEDIO' && 'R$ 2.500,00'}
                  {risk === 'CRITICO' && 'R$ 50.000,00'}
                </div>
                <div className="text-sm text-gray-500">Valor da transação</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botão de Envio */}
      {selectedRisk && (
        <div className="text-center mb-8">
          <button
            onClick={() => handleSubmit(selectedRisk)}
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              `Enviar Relato - ${selectedRisk}`
            )}
          </button>
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <svg className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-green-800">Relato Enviado com Sucesso!</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Informações do Relato</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">ID:</span> {result.id}</div>
                <div><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getRiskColor(result.status)}`}>
                    {result.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Análise da IA</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Score:</span> {result.analise.score}/100</div>
                <div><span className="font-medium">Nível de Risco:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getRiskColor(result.analise.nivelRisco)}`}>
                    {result.analise.nivelRisco}
                  </span>
                </div>
                <div><span className="font-medium">Confiança:</span> {result.analise.confianca}%</div>
              </div>
            </div>
          </div>

          {result.analise.bandeirasVermelhas.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Bandeiras Vermelhas</h4>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {result.analise.bandeirasVermelhas.map((flag: string, index: number) => (
                  <li key={index}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {result.analise.recomendacoes.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Recomendações</h4>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {result.analise.recomendacoes.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Justificativa</h4>
            <p className="text-sm text-gray-700">{result.analise.justificativa}</p>
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800">Erro ao Enviar Relato</h3>
          </div>
          <p className="mt-2 text-red-700">{error}</p>
        </div>
      )}

      {/* Informações sobre os Dados de Exemplo */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Sobre os Dados de Exemplo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Baixo Risco</h4>
            <ul className="text-blue-700 space-y-1">
              <li>• Valor: R$ 150,00</li>
              <li>• Histórico limpo</li>
              <li>• Dispositivo conhecido</li>
              <li>• 0 relatos anteriores</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Médio Risco</h4>
            <ul className="text-blue-700 space-y-1">
              <li>• Valor: R$ 2.500,00</li>
              <li>• 2 relatos anteriores</li>
              <li>• Novo dispositivo</li>
              <li>• Score de risco: 45</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Crítico</h4>
            <ul className="text-blue-700 space-y-1">
              <li>• Valor: R$ 50.000,00</li>
              <li>• 8 relatos anteriores</li>
              <li>• Score de risco: 15</li>
              <li>• Múltiplas evidências</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
