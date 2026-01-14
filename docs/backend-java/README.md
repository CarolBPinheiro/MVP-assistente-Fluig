# Backend Java - Fluig Assistente API

Este diretório contém o código Java completo para ser importado no Eclipse IDE, configurado para conexão com o servidor de homologação PostgreSQL da Fortbras.

## Estrutura do Projeto

```
fluig-assistente-api/
├── pom.xml                              # Configuração Maven
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── fortbras/
│       │           └── fluig/
│       │               ├── FluigAssistenteApplication.java
│       │               ├── config/
│       │               │   ├── DatabaseConfig.java
│       │               │   ├── CorsConfig.java
│       │               │   └── SecurityConfig.java
│       │               ├── controller/
│       │               │   ├── ChatController.java
│       │               │   └── HealthController.java
│       │               ├── service/
│       │               │   ├── ChatService.java
│       │               │   ├── DatabaseContextService.java
│       │               │   └── AIGatewayService.java
│       │               ├── model/
│       │               │   ├── ChatMessage.java
│       │               │   ├── ChatRequest.java
│       │               │   ├── ChatResponse.java
│       │               │   ├── DatabaseContext.java
│       │               │   ├── UserProcess.java
│       │               │   └── PendingTask.java
│       │               ├── repository/
│       │               │   ├── ProcessRepository.java
│       │               │   └── TaskRepository.java
│       │               └── exception/
│       │                   ├── GlobalExceptionHandler.java
│       │                   └── AIGatewayException.java
│       └── resources/
│           ├── application.yml
│           ├── application-dev.yml
│           └── application-homolog.yml
└── Dockerfile
```

## Requisitos

- Java 17+
- Maven 3.8+
- Eclipse IDE 2023+
- PostgreSQL 14+

## Importação no Eclipse

1. **Clone/Copie** os arquivos para seu workspace
2. **File → Import → Maven → Existing Maven Projects**
3. Selecione o diretório `fluig-assistente-api`
4. Aguarde o download das dependências

## Configuração do Servidor de Homologação

Edite o arquivo `application-homolog.yml` com as credenciais do banco:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://SERVIDOR_HOMOLOG:5432/fluig_db
    username: seu_usuario
    password: sua_senha
```

## Execução

```bash
# Desenvolvimento
mvn spring-boot:run -Dspring.profiles.active=dev

# Homologação
mvn spring-boot:run -Dspring.profiles.active=homolog
```

## Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/chat` | Enviar mensagem ao assistente |
| GET | `/api/health` | Health check |
| GET | `/api/context/{userId}` | Contexto do usuário |
