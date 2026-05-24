export async function sendChatMessage(messages, systemPrompt, language = 'en', model = 'openrouter/auto') {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('VITE_OPENROUTER_API_KEY is not configured in .env');
  }

  console.log(`[API] Calling OpenRouter with model: ${model}`);

  const payload = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    temperature: 0.7,
    max_tokens: 1000,
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.href,
      'X-Title': 'Iran Tour Advisor',
    },
    body: JSON.stringify(payload),
  });

  console.log(`[API] Response status: ${response.status}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[APIError] OpenRouter error:', errorData);
    throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('[API] Success response:', data);
  return data.choices[0].message.content;
}
