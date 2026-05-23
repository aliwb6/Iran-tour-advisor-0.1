export async function sendChatMessage(messages, systemPrompt, language = 'en') {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is not configured in .env');
    }

    console.log('[API] Calling Google AI Studio (Gemini)');

    // Gemini requires alternating user/model turns and cannot start with model.
    // Drop any leading assistant messages (e.g. the initial greeting) so the
    // first content entry is always role: 'user'.
    const trimmed = [...messages];
    while (trimmed.length > 0 && trimmed[0].role === 'assistant') trimmed.shift();

    const contents = trimmed.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[API] Gemini error:', errorData);
      throw new Error(errorData.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error('[API] Error:', err);
    throw err;
  }
}
