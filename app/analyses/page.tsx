'use client';

import { useState, useEffect } from 'react';
import { getRelatos, getAnalise, RelatosListResponse, AnaliseResponse } from '@/lib/api';

export default function AnalysesPage() {
  const [relatos, setRelatos] = useState<RelatosListResponse | null>(null);
  const [selectedRelato, setSelectedRelato] = useState<string | null>(null);
  const [analise, setAnalise] = useState<AnaliseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const loadRelatos = async (page: number = 1, status: string = '') => {
    try {
      setLoading(true);
      const data = await getRelatos(page, 10, status || undefined);
      setRelatos(data);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatos');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalise = async (relatoId: string) => {
    try {
      const data = await getAnalise(relatoId);
      setAnalise(data);
      setSelectedRelato(relatoId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar análise');
    }
  };

  useEffect(() => {
    loadRelatos();
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'BAIXO_RISCO': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIO_RISCO': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ALTO_RISCO': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CRITICO': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading && !relatos) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Análises de Relatos PIX</h1>
        <p className="mt-2 text-lg text-gray-600">
          Visualize e analise os relatos de infrações PIX processados pelo sistema
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                loadRelatos(1, e.target.value);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os status</option>
              <option value="EM_ANALISE">Em Análise</option>
              <option value="BAIXO_RISCO">Baixo Risco</option>
              <option value="MEDIO_RISCO">Médio Risco</option>
              <option value="ALTO_RISCO">Alto Risco</option>
              <option value="CRITICO">Crítico</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => loadRelatos(1, statusFilter)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lista de Relatos */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Relatos ({relatos?.total || 0})
          </h2>
          
          {relatos?.relatos.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Nenhum relato encontrado</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Comece enviando um relato na página de envio.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {relatos?.relatos.map((relato) => (
                <div
                  key={relato._id}
                  className={`bg-white dark:bg-gray-800 border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedRelato === relato._id ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
                  onClick={() => loadAnalise(relato._id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 text-lg">
                        {relato.pagador.nome}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        CPF: {relato.pagador.cpf}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {relato.pagador.instituicao} • {relato.pagador.perfilRisco}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(relato.statusRelato)}`}>
                      {relato.statusRelato}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Valor:</span>
                      <span className="ml-1 font-medium text-lg text-gray-900 dark:text-gray-100">
                        {formatCurrency(relato.transacao.valor)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Data:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(relato.transacao.dataHoraTransacao)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Recebedor:</span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{relato.recebedor.nome}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Chave PIX:</span>
                      <span className="ml-1 font-medium text-xs text-gray-900 dark:text-gray-100">{relato.recebedor.chavePix}</span>
                    </div>
                  </div>

                  <div className="text-sm mb-3">
                    <span className="text-gray-600 dark:text-gray-300">Motivo:</span>
                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100" title={relato.avaliacaoFraude.motivoRelato}>
                      {truncateText(relato.avaliacaoFraude.motivoRelato, 40)}
                    </span>
                  </div>

                  <div className="text-sm mb-3">
                    <span className="text-gray-600 dark:text-gray-300">Tipo de Golpe:</span>
                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{relato.avaliacaoFraude.subtipoGolpe}</span>
                  </div>
                  
                  {relato.scoreAnalise && (
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Score:</span>
                        <span className="ml-1 font-medium text-lg text-gray-900 dark:text-gray-100">{relato.scoreAnalise}/100</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {relato.transacao.txid.substring(0, 8)}...
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

          {/* Paginação */}
          {relatos && relatos.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex space-x-2">
                <button
                  onClick={() => loadRelatos(currentPage - 1, statusFilter)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                {Array.from({ length: relatos.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => loadRelatos(page, statusFilter)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => loadRelatos(currentPage + 1, statusFilter)}
                  disabled={currentPage === relatos.totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* Detalhes da Análise */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Detalhes da Análise
          </h2>
          
          {!selectedRelato ? (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Selecione um relato</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Clique em um relato para ver os detalhes da análise.</p>
            </div>
          ) : analise ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Score da Análise</h4>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {analise.analise.score}/100
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Nível de Risco</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(analise.analise.nivelRisco)}`}>
                    {analise.analise.nivelRisco}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Confiança da Análise</h4>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${analise.analise.confianca}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">{analise.analise.confianca}%</span>
              </div>

              {analise.analise.bandeirasVermelhas.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Bandeiras Vermelhas</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {analise.analise.bandeirasVermelhas.map((flag, index) => (
                      <li key={index}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analise.analise.recomendacoes.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Recomendações</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {analise.analise.recomendacoes.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Justificativa</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{analise.analise.justificativa}</p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Informações Técnicas</h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    <span className="font-medium">Provider:</span> {analise.analise.provider}
                  </div>
                  <div>
                    <span className="font-medium">Modelo:</span> {analise.analise.modelo}
                  </div>
                  <div>
                    <span className="font-medium">Data da Análise:</span> {formatDate(analise.analise.dataAnalise)}
                  </div>
                  <div>
                    <span className="font-medium">Status do Relato:</span> 
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${getRiskColor(analise.relato.status)}`}>
                      {analise.relato.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Carregando análise...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
