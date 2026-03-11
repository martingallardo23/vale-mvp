import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "PERPLEXITY_API_KEY not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const systemPrompt = `Eres un asistente financiero experto que ayuda a asesores de inversión a analizar mercados, portafolios y tomar decisiones. Tienes acceso a información financiera en tiempo real. Responde siempre en español, de forma concisa y precisa. Cuando cites datos de mercado o precios, indica la fuente. Enfócate en análisis accionable para el asesor.`;

  const body = {
    model: "sonar-pro",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    stream: true,
    search_mode: "web",
    temperature: 0.2,
    max_tokens: 1024,
  };

  const upstream = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!upstream.ok) {
    const err = await upstream.text();
    return new Response(JSON.stringify({ error: err }), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Stream the SSE response directly to the client
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
