exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { persona, topic } = JSON.parse(event.body);
        
        // You can use OpenAI, OpenRouter, or Gemini here. 
        // Ensure you add AI_API_KEY to your Netlify Environment Variables.
        const apiKey = process.env.AI_API_KEY; 

        // The exact personas to seed the problems your guide and SaaS solve
        const prompts = {
            frustrated_seller: `Act as a stressed Etsy seller. Write a short, casual Reddit post complaining about how Etsy ads are eating your profit margins. Ask if anyone has had success with organic traffic or Pinterest. Use lowercase for the title. Do not use hashtags. Use words like 'CPC', 'margins', and 'ROAS'. Topic context: ${topic}`,
            
            pinterest_beginner: `Act as an Etsy seller who just realized they need to use Pinterest. Write a short Reddit post asking how people manage to post so many pins without burning out. Ask if there is a system or workflow. Casual tone, no hashtags. Topic context: ${topic}`,
            
            hybrid_convert: `Act as a seller who just made their first POD (print on demand) sale after starting with digital downloads. Share it as a small win. Keep it humble and short. No hashtags. Topic context: ${topic}`,
            
            organic_skeptic: `Act as a cynical Reddit user. Write a short post asking if it's actually possible to get sales on Etsy in 2026 without paying for ads. Ask for real proof or strategies. No hashtags. Topic context: ${topic}`
        };

        const systemPrompt = prompts[persona] || prompts.frustrated_seller;

        // Example using OpenAI API format (swap URL/model if using a different provider)
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Fast, cheap model perfect for this
                messages: [
                    { role: "system", content: "You are an average, slightly cynical Reddit user posting in an e-commerce subreddit. Never use corporate speak, hashtags, or emojis." },
                    { role: "user", content: systemPrompt }
                ],
                temperature: 0.8
            })
        });

        const data = await response.json();
        const generatedText = data.choices[0].message.content;

        return {
            statusCode: 200,
            body: JSON.stringify({ post: generatedText })
        };

    } catch (error) {
        console.error('Generation Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to generate post' }) };
    }
};