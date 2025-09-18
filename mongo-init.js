// Script de inicialização do MongoDB
db = db.getSiblingDB('pix-infracoes');

// Criar usuário específico para a aplicação
db.createUser({
  user: 'pix-user',
  pwd: 'pix-password',
  roles: [
    {
      role: 'readWrite',
      db: 'pix-infracoes'
    }
  ]
});

// Criar coleção de relatos de infração
db.createCollection('relatoinfracoes');

// Criar índices para melhor performance
db.relatoinfracoes.createIndex({ "idRelato": 1 }, { unique: true });
db.relatoinfracoes.createIndex({ "statusRelato": 1 });
db.relatoinfracoes.createIndex({ "dataCriacao": -1 });
db.relatoinfracoes.createIndex({ "recebedor.cpfCnpj": 1 });
db.relatoinfracoes.createIndex({ "recebedor.chavePix": 1 });
db.relatoinfracoes.createIndex({ "transacao.endToEndId": 1 });

print('Banco de dados pix-infracoes inicializado com sucesso!');
