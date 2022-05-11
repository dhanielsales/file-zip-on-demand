# curso-node

## Create a DBs

```
docker run --name postgres-test -e "POSTGRES_USER=user" -e "POSTGRES_PASSWORD=password" -e "POSTGRES_DB=main" -d -p 5432:5432 postgres
docker run --name mongodb-test -e "MONGO_INITDB_ROOT_USERNAME=user" -e "MONGO_INITDB_ROOT_PASSWORD=password" -e "MONGO_INITDB_DATABASE=main" -d -p 27017:27017 mongo
docker run --name redis-test -d -p 6379:6379 redis:alpine --requirepass "password"

docker run --name redis -d -p 6379:6379 redis redis-server --requirepass "SUPER_SECRET_PASSWORD"


```

```
db-migrate create products --sql-file
```

## Schemas

```
├── api ## Controllers e Rotas da aplicação
│   ├── products/
│   └── api.ts
├── app ## Primeira camada de abstração dos controllers
│   ├── products/
│   └── app.ts
├── model ## Camada de models para cada repositório
│   └── products/
├── request ## Camada de requisições externas para cada repositório
│   └── products
├── store ## Camada de consumo de bancos de dados para cada repositório
│   ├── nosql
│   │   └── products
│   └── sql
│        └── products
└── shared ## Camada compartilhada
```

GET /v0/user
GET /v0/user/:id
GET /v0/product
GET /v0/product/:id
GET /v1/user
GET /v1/user/:id
GET /v1/product
GET /v1/product/:id

## Secrets

### - Email Google

- **Dev:**
- **Prod:**

#### TO DO

- [ ] Fazer uma classe de Config para inicializar as configurações externas (env, etc.) no inicio da aplicação.
