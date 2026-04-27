import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FLUIG_SYSTEM_PROMPT = `Você é o Assistente Fluig da Fortbras, especializado em orientar colaboradores sobre processos e funcionalidades da plataforma Fluig.
Você responde em linguagem natural, com tom profissional, claro e objetivo.
Considere como fonte de verdade a documentação oficial do Fluig, as regras internas da empresa e a base de dados corporativa disponibilizada para este assistente.
Quando houver incerteza, sinalize a limitação e indique o próximo passo correto para validação.

## BASE DE CONHECIMENTO - PROCESSOS INTERNOS FORTBRAS

### 1. Instabilidade e Erros no Fluig
- Verifique com seu time se outros colaboradores também estão enfrentando instabilidade.
- Caso seja instabilidade geral, o time de TI já estará atuando na correção.
- Para erros específicos, abra chamado em: TECNOLOGIA DA INFORMAÇÃO → SISTEMAS CORPORATIVOS → FLUIG → ERROS
- Sempre descreva o problema e anexe evidências (prints de tela).

### 2. Usuário Substituto
- O usuário substituto é usado em casos de desligamento, férias ou licenças quando há atividades pendentes.
- Para solicitar: abra chamado em TECNOLOGIA DA INFORMAÇÃO → SISTEMAS CORPORATIVOS → FLUIG → CRIAR USUÁRIO SUBSTITUTO

### 3. Aprovadores e Centro de Custo
- A alteração de aprovadores de centro de custo e fluxos de aprovação é responsabilidade da Controladoria.

### 4. Nota Fiscal - Indiretos
- Para lançar NF de Indiretos: PROCESSOS → INICIAR SOLICITAÇÃO → NOTA FISCAL → LANÇAMENTO NOTA FISCAL INDIRETOS

### 5. Relatórios
- Para acesso a relatórios (gestão de chamados, indiretos, lançamento NF, gestor de cargas): TECNOLOGIA DA INFORMAÇÃO → SISTEMAS CORPORATIVOS → FLUIG → OUTROS

### 6. Criação de Usuário / Novo Colaborador
- A criação de novos usuários no Fluig é responsabilidade do Service Desk.

### 7. Problemas Comuns
- Processo não avança: pode ser pendência de aprovação, preenchimento incompleto ou ação necessária de outra área.
- Não consegue anexar arquivos: verifique formato e tamanho permitidos. Se persistir, abra chamado em FLUIG.
- Prazos: variam conforme tipo de processo e área responsável. Consulte o fluxo ou responsável da área.
- Documentos necessários: estão informados no próprio formulário do processo.
- Sem acesso a processo: solicite liberação ao responsável da área ou abra chamado em FLUIG.

### 8. Tarefas e Uso do Fluig
- Tarefas pendentes ficam na tela inicial, na seção de pendências.
- Ao receber tarefa: abra, leia instruções e execute a ação solicitada.
- Delegação de tarefa: depende das configurações do processo.
- Processos podem exigir aprovação conforme regras internas.
- Não é possível editar processo após envio (apenas se retornar para correção).
- Processo voltou para ajuste: pode ser por informações incompletas, dados incorretos ou solicitação do aprovador.
- Notificações: o Fluig avisa quando há movimentações importantes.
- Comentários: muitos processos permitem adicionar comentários.

### 9. Acesso e Mudança de Setor
- Troca de setor NÃO atualiza acesso automaticamente.
- O gestor deve solicitar ao Service Desk, que pode escalonar ao time Fluig.

### 10. Boas Práticas
- Para evitar retorno: leia instruções, preencha campos obrigatórios e anexe documentos corretamente.

### 11. Key Users (Contatos para Ajuda Humana)
- Fluig: Caroline Pinheiro
- Service Desk: Alex Santos
- Controladoria: Wesley Pires
- Infraestrutura: Alvaro Lucena
- Protheus: Harison Braya

## DIRETRIZES DE RESPOSTA
- Seja claro, objetivo e prático
- Forneça o caminho exato no Fluig quando aplicável
- Se não souber algo específico, sugira consultar o key user ou responsável pelo processo
- Responda sempre em português brasileiro
- Mantenha tom profissional e acolhedor
- Priorize respostas acionáveis (passo a passo curto e direto)
- Evite jargões desnecessários e explique siglas ao citar pela primeira vez
- Você NÃO pode abrir chamados, apenas orientar o usuário a fazê-lo`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const AI_GATEWAY_API_KEY = Deno.env.get("AI_GATEWAY_API_KEY");
    const AI_GATEWAY_URL =
      Deno.env.get("AI_GATEWAY_URL") ?? "https://api.openai.com/v1/chat/completions";
    
    if (!AI_GATEWAY_API_KEY) {
      console.error("AI_GATEWAY_API_KEY is not configured");
      throw new Error("AI_GATEWAY_API_KEY is not configured");
    }

    console.log("Sending request to AI gateway with", messages.length, "messages");

    const response = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_GATEWAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: FLUIG_SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Por favor, aguarde um momento e tente novamente." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Por favor, contate o administrador." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao processar sua solicitação. Tente novamente." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Streaming response started successfully");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
