import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FLUIG_SYSTEM_PROMPT = `Você é o Assistente Fluig da Fortbras, especialista em orientar colaboradores sobre processos e funcionalidades da plataforma Fluig. Seu objetivo é ajudar os usuários de forma clara, objetiva e profissional.

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
- Você NÃO pode abrir chamados, apenas orientar o usuário a fazê-lo

## CONTEXTO DO BANCO DE DADOS
Quando dados do banco estiverem disponíveis, utilize-os para fornecer respostas mais precisas sobre:
- Status de processos específicos do usuário
- Histórico de solicitações
- Informações de documentos e workflows`;

// Interface para dados do banco de dados
interface DatabaseContext {
  userProcesses?: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
  }>;
  pendingTasks?: Array<{
    id: string;
    description: string;
    dueDate: string;
  }>;
  recentDocuments?: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

// Função para buscar contexto do banco de dados (preparada para integração)
async function fetchDatabaseContext(userId?: string): Promise<DatabaseContext | null> {
  const FLUIG_DATABASE_URL = Deno.env.get("FLUIG_DATABASE_URL");
  
  if (!FLUIG_DATABASE_URL) {
    console.log("FLUIG_DATABASE_URL não configurada - usando apenas base de conhecimento estática");
    return null;
  }

  try {
    // Importação dinâmica do driver PostgreSQL
    const { Client } = await import("https://deno.land/x/postgres@v0.17.0/mod.ts");
    
    const client = new Client(FLUIG_DATABASE_URL);
    await client.connect();
    
    // Exemplo de queries - ajustar conforme schema real do Fluig
    const processesResult = await client.queryObject<{
      id: string;
      title: string;
      status: string;
      created_at: string;
    }>(`
      SELECT id, title, status, created_at 
      FROM processes 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [userId]);

    const tasksResult = await client.queryObject<{
      id: string;
      description: string;
      due_date: string;
    }>(`
      SELECT id, description, due_date 
      FROM tasks 
      WHERE assignee_id = $1 AND status = 'pending'
      ORDER BY due_date ASC 
      LIMIT 5
    `, [userId]);

    await client.end();

    return {
      userProcesses: processesResult.rows.map(r => ({
        id: r.id,
        title: r.title,
        status: r.status,
        createdAt: r.created_at
      })),
      pendingTasks: tasksResult.rows.map(r => ({
        id: r.id,
        description: r.description,
        dueDate: r.due_date
      }))
    };
  } catch (error) {
    console.error("Erro ao buscar contexto do banco:", error);
    return null;
  }
}

// Função para enriquecer o prompt com dados do banco
function enrichPromptWithContext(basePrompt: string, context: DatabaseContext | null): string {
  if (!context) return basePrompt;

  let enrichedPrompt = basePrompt;

  if (context.userProcesses && context.userProcesses.length > 0) {
    enrichedPrompt += `\n\n## PROCESSOS DO USUÁRIO (dados em tempo real):\n`;
    context.userProcesses.forEach(p => {
      enrichedPrompt += `- ${p.title} (ID: ${p.id}) - Status: ${p.status} - Criado em: ${p.createdAt}\n`;
    });
  }

  if (context.pendingTasks && context.pendingTasks.length > 0) {
    enrichedPrompt += `\n\n## TAREFAS PENDENTES DO USUÁRIO:\n`;
    context.pendingTasks.forEach(t => {
      enrichedPrompt += `- ${t.description} (ID: ${t.id}) - Prazo: ${t.dueDate}\n`;
    });
  }

  return enrichedPrompt;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Mensagens inválidas" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY não está configurada");
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar contexto do banco de dados (se disponível)
    const dbContext = await fetchDatabaseContext(userId);
    const enrichedPrompt = enrichPromptWithContext(FLUIG_SYSTEM_PROMPT, dbContext);

    console.log(`Processando ${messages.length} mensagens. Contexto DB: ${dbContext ? 'disponível' : 'não disponível'}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: enrichedPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro no AI gateway:", response.status, errorText);
      
      const errorResponses: Record<number, { error: string }> = {
        429: { error: "Limite de requisições excedido. Aguarde um momento e tente novamente." },
        402: { error: "Créditos insuficientes. Contate o administrador." },
      };
      
      const errorResponse = errorResponses[response.status] || { error: "Erro ao processar sua solicitação. Tente novamente." };
      
      return new Response(
        JSON.stringify(errorResponse),
        { status: response.status >= 400 && response.status < 500 ? response.status : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming iniciado com sucesso");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Erro no chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});