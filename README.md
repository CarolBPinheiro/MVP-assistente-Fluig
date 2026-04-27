# Assistente de IA para Fluig

MVP de um assistente inteligente para a plataforma Fluig, projetado para atendimento em linguagem natural e suporte operacional no dia a dia da empresa.

## Objetivo do MVP

Oferecer um canal rápido e confiável para orientar colaboradores sobre:

- processos internos;
- fluxos de aprovação;
- uso funcional do Fluig;
- caminhos corretos para abertura de chamados.

## Proposta de valor

O assistente combina:

- documentação oficial do Fluig;
- regras e conteúdos internos da empresa;
- referências corporativas estruturadas (base de dados da operação).

Com isso, as respostas são mais contextualizadas e acionáveis para o cenário real da organização.

## Funcionalidades principais

- **Atendimento conversacional**: interpreta perguntas em linguagem natural.
- **Orientação prática**: responde com passo a passo e caminho exato no Fluig.
- **Suporte a dúvidas recorrentes**: reduz volume de chamados simples.
- **Escalonamento consciente**: quando necessário, orienta o usuário a procurar o key user ou área responsável.
- **Interface de chat moderna**: experiência direta para uso em ambiente corporativo.

## Arquitetura (visão geral)

- **Frontend**: React + TypeScript + Vite + Tailwind.
- **Backend conversacional**: Supabase Edge Function para orquestrar chamadas ao modelo de IA.
- **Autenticação**: Supabase Auth.
- **Integração de IA**: endpoint configurável via variáveis de ambiente.

## Configuração rápida

1. Instale dependências:

```bash
npm install
```

2. Configure variáveis no ambiente:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `AI_GATEWAY_API_KEY`
- `AI_GATEWAY_URL` (opcional; padrão: endpoint de Chat Completions compatível)

3. Execute localmente:

```bash
npm run dev
```

## Posicionamento para apresentação

Este MVP demonstra como IA aplicada ao Fluig pode:

- acelerar a curva de aprendizado dos usuários;
- padronizar orientações de processo;
- aumentar produtividade do suporte;
- melhorar a experiência digital interna com respostas claras e naturais.
