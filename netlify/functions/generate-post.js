exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const apiKey = process.env.AI_API_KEY; 

        // Internal Randomization Engine
        const topics = ['digital planners', 'POD hoodies', 'SVG files', 'wedding templates', 'budget trackers', 'custom mugs', 'nursery wall art', 'notion templates', 'resume templates'];
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];

        const personas = [
            `Act as a stressed Etsy seller selling ${randomTopic}. Complain about how Etsy ads are eating your profit margins and CPC is too high. Ask if anyone has had success with free organic traffic.`,
            `Act as an Etsy seller making ${randomTopic} who just realized they need to use Pinterest. Ask how people manage to post so many pins without burning out. Ask if there is a system.`,
            `Act as a seller who just made their first POD sale (a ${randomTopic}) after starting with digital downloads. Share it as a small win. Keep it humble and short.`,
            `Act as a cynical Reddit user trying to sell ${randomTopic}. Ask if it's actually possible to get sales on Etsy in 2026 without paying for ads. Ask for real proof.`
        ];
        const randomPersona = personas[Math.floor(Math.random() * personas.length)];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { 
                        role: "system", 
                        content: "You are an average, slightly frustrated Reddit user in an Etsy seller subreddit. No hashtags, no emojis, no corporate speak. Keep titles lowercase. YOU MUST format your response exactly like this:\nTITLE: [your title here]\nBODY: [your body text here]" 
                    },
                    { role: "user", content: randomPersona }
                ],
                temperature: 0.9
            })
        });

        const data = await response.json();
        const rawText = data.choices[0].message.content;

        // Extract Title and Body from the AI response
        const titleMatch = rawText.match(/TITLE:\s*(.*)/i);
        const bodyMatch = rawText.match(/BODY:\s*([\s\S]*)/i);

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                title: titleMatch ? titleMatch[1].trim() : "question about etsy traffic", 
                body: bodyMatch ? bodyMatch[1].trim() : rawText 
            })
        };

    } catch (error) {
        console.error('Generation Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to generate post' }) };
    }
};