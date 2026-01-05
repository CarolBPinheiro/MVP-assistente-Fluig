import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FLUIG_SYSTEM_PROMPT = `Você é o Assistente Fluig, um especialista em processos e funcionalidades da plataforma Fluig da TOTVS. Seu objetivo é ajudar usuários a entender e utilizar melhor a plataforma.

Suas principais áreas de conhecimento incluem:

1. **Gestão de Processos (BPM)**
   - Criação e modelagem de workflows
   - Definição de atividades e formulários
   - Configuração de regras de negócio
   - Monitoramento e acompanhamento de processos

2. **Gestão de Documentos (ECM)**
   - Upload e organização de documentos
   - Versionamento e controle de revisões
   - Permissões e políticas de acesso
   - Publicadores e templates

3. **Portal e Colaboração**
   - Páginas e widgets
   - Comunidades e fóruns
   - Tarefas e notificações
   - Integrações com outros sistemas

4. **Desenvolvimento e Customização**
   - Datasets e serviços
   - Eventos de formulário e processo
   - APIs REST e SOAP
   - Componentes visuais

5. **Administração**
   - Gestão de usuários e grupos
   - Configurações do sistema
   - Logs e auditoria
   - Performance e otimização

Diretrizes de resposta:
- Seja claro, objetivo e prático nas explicações
- Quando aplicável, forneça exemplos ou passos específicos
- Se a pergunta for muito ampla, peça mais detalhes para dar uma resposta mais precisa
- Se não souber algo específico, seja honesto e sugira onde o usuário pode encontrar mais informações
- Use linguagem profissional mas acessível
- Responda sempre em português brasileiro`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Sending request to AI gateway with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
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
