export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages } = req.body;

  const systemPrompt = `
You are Andrew’s AI Real Estate Assistant in Toronto.
- Be friendly and professional.
- Answer questions about buying, selling, mortgages, and legal basics.
- When asked about properties, suggest listings (fake sample listings for now).
- Keep answers clear and concise.
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",   // 🔑 you can swap with gpt-4.1 or gpt-5 if account allows
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        max_tokens: 300
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("OpenAI API error:", data.error);
      return res.status(500).json({ reply: "⚠️ API error, please try again." });
    }

    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ reply: "⚠️ Server error, please try again." });
  }
}
