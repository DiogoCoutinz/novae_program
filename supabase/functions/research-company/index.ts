import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface CompanyResearchRequest {
  companyName: string;
  companyWebsite?: string;
}

interface CompanyResearchResult {
  nome: string;
  empresa: string;
  setor: string;
  tamanho_equipa: number;
  objetivo: string;
  orcamento_est: string;
  urgencia: string;
  experiencia_ia: string;
  insights: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { companyName, companyWebsite }: CompanyResearchRequest = await req.json();

    if (!companyName) {
      return new Response(
        JSON.stringify({ error: 'Company name is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    console.log(`🔍 Researching company: ${companyName}`);

    // Use OpenAI with web search to research the company
    const searchQuery = companyWebsite 
      ? `Research the company "${companyName}" (website: ${companyWebsite}). Find information about their business sector, team size, recent news, and challenges.`
      : `Research the Portuguese company "${companyName}". Find information about their business sector, team size, revenue, recent news, and business challenges.`;

    const prompt = `You are a sales intelligence assistant. Use web search to research "${companyName}" and extract structured information for a sales preparation.

Search for and analyze information about this company, then return a JSON object with the following fields:
{
  "nome": "Primary contact name if found, otherwise 'Decision Maker'",
  "empresa": "${companyName}",
  "setor": "Industry/sector in Portuguese (e.g., tecnologia, saúde, finanças, indústria, consultoria, retalho)",
  "tamanho_equipa": estimated number of employees as integer (be realistic based on company info),
  "objetivo": "Likely business objective or challenge they might have - be specific and realistic in Portuguese",
  "orcamento_est": "Estimated budget range for AI consulting (e.g., '5k-10k', '10k-20k', '20k-50k', '50k+')",
  "urgencia": "Urgency level: 'baixa', 'média', or 'alta'",
  "experiencia_ia": "AI experience level: 'nenhuma', 'básica', 'intermédia', or 'avançada'",
  "insights": "3-4 bullet points of key insights for sales preparation in Portuguese (challenges, opportunities, recent news)"
}

IMPORTANT:
- All text fields should be in Portuguese
- Be realistic and base your estimates on the company size and sector
- If information is missing, make educated guesses based on industry standards
- Keep objetivo and insights practical and specific`;

    const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        tools: [{ type: 'web_search' }],
        tool_choice: 'auto',
        text: {
          format: 'json_object'
        },
        input: prompt,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${openaiResponse.statusText} - ${errorText}`);
    }

    const openaiResult = await openaiResponse.json();
    
    // Extract the output text from Responses API
    const outputText = openaiResult.output_text || openaiResult.output?.[0]?.content?.[0]?.text;
    
    if (!outputText) {
      throw new Error('No output from OpenAI');
    }
    
    const companyData: CompanyResearchResult = JSON.parse(outputText);

    console.log(`✅ Company research completed for ${companyName}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: companyData,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('❌ Error in company research:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to research company',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

