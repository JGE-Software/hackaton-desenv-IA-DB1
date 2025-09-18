# Instruções para Docker

## Como construir e executar a aplicação com Docker

### 1. Construir a imagem Docker

```bash
docker build -t pix-infracoes-api .
```

### 2. Executar o container

```bash
docker run -p 3000:3000 pix-infracoes-api
```

### 3. Executar em modo de desenvolvimento (com hot reload)

Para desenvolvimento, você pode usar o docker-compose.yml existente ou executar:

```bash
docker run -p 3000:3000 -v $(pwd):/app -w /app node:18-alpine sh -c "yarn install && yarn dev"
```

### 4. Variáveis de ambiente

Se sua aplicação precisar de variáveis de ambiente, crie um arquivo `.env` e execute:

```bash
docker run -p 3000:3000 --env-file .env pix-infracoes-api
```

### 5. Comandos úteis

- **Ver logs do container:**
  ```bash
  docker logs <container_id>
  ```

- **Entrar no container:**
  ```bash
  docker exec -it <container_id> sh
  ```

- **Parar o container:**
  ```bash
  docker stop <container_id>
  ```

- **Remover a imagem:**
  ```bash
  docker rmi pix-infracoes-api
  ```

## Características do Dockerfile

- **Multi-stage build**: Otimiza o tamanho da imagem final
- **Node.js 18 Alpine**: Imagem leve e segura
- **Usuário não-root**: Executa como usuário `nextjs` por segurança
- **Cache otimizado**: Aproveita o cache do Docker para builds mais rápidos
- **Output standalone**: Gera uma aplicação autocontida

## Estrutura do Dockerfile

1. **deps**: Instala apenas as dependências necessárias
2. **builder**: Constrói a aplicação Next.js
3. **runner**: Imagem final otimizada para produção

## Otimizações incluídas

- Uso de `.dockerignore` para excluir arquivos desnecessários
- Multi-stage build para reduzir tamanho da imagem
- Usuário não-root para segurança
- Cache de dependências otimizado
- Output standalone do Next.js para melhor performance
