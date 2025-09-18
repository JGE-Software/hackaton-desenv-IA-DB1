import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PIX Infrações API',
  description: 'API para recebimento e análise de relatos de infrações PIX',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PIX Infrações API
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sistema para recebimento e análise de relatos de infrações PIX
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Endpoints Disponíveis
          </h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-medium text-gray-800">POST /api/relatos</h3>
              <p className="text-gray-600">Registrar novo relato de infração PIX</p>
              <code className="text-sm bg-gray-100 p-2 block mt-2 rounded">
                Content-Type: application/json
              </code>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-lg font-medium text-gray-800">GET /api/relatos</h3>
              <p className="text-gray-600">Listar relatos com paginação e filtros</p>
              <code className="text-sm bg-gray-100 p-2 block mt-2 rounded">
                ?page=1&limit=10&status=EM_ANALISE
              </code>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="text-lg font-medium text-gray-800">GET /api/relatos/[id]</h3>
              <p className="text-gray-600">Buscar relato específico por ID</p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-lg font-medium text-gray-800">PUT /api/relatos/[id]</h3>
              <p className="text-gray-600">Atualizar status e score de um relato</p>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="text-lg font-medium text-gray-800">POST /api/analise</h3>
              <p className="text-gray-600">Executar análise de IA em um relato</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 mb-2">
              Como usar:
            </h3>
            <ol className="list-decimal list-inside text-blue-700 space-y-1">
              <li>Inicie o MongoDB com: <code className="bg-blue-100 px-2 py-1 rounded">docker-compose up -d</code></li>
              <li>Instale as dependências: <code className="bg-blue-100 px-2 py-1 rounded">npm install</code></li>
              <li>Execute a aplicação: <code className="bg-blue-100 px-2 py-1 rounded">npm run dev</code></li>
              <li>Envie relatos via POST para /api/relatos</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
