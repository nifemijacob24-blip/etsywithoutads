exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const apiKey = process.env.AI_API_KEY; 

        // 1. Multi-Variable Matrix
        const products = [
            'digital planners', 'POD hoodies', 'SVG cut files', 'wedding invitations', 
            'budget spreadsheets', 'custom mugs', 'nursery wall art', 'notion dashboards', 
            'resume templates', 'sticker packs', 'printable wall art', 'custom pet portraits', 
            'POD tote bags', 'social media templates', 'lightroom presets'
        ];
        
        const experiences = [
            'started 2 weeks ago', 'been grinding for 3 months', 'just hit my 6 month mark', 
            'opened my shop yesterday', 'been selling for a year but traffic died', 'just switched to POD'
        ];

        const angles = [
            'Ranting that Etsy ads are a total scam and CPC is eating 100% of the profit margin. Ask what else to do.',
            'Asking how the hell people actually use Pinterest for Etsy without spending 40 hours a week on it.',
            'Skeptical about whether you can even survive on Etsy in 2026 without paying for ads. Asking for proof.',
            'Made exactly ONE sale from organic traffic/Pinterest instead of Etsy ads and sharing it as a tiny win.',
            'Frustrated with updating Etsy SEO and tags for zero views. Asking if external traffic is the only way out.',
            'Tired of getting "favorites" but zero actual buyers. Asking how to get high-intent traffic.',
            'Asking if anyone has actually managed to automate their marketing because doing it manually is causing burnout.',
            'Complaining about competing with cheap mass-produced garbage and asking how to drive targeted traffic to stand out.'
        ];

        const tones = ['frustrated', 'exhausted but hopeful', 'highly cynical', 'casual and brief', 'confused and asking for help'];

        // 2. Random Selection Engine
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const randomExperience = experiences[Math.floor(Math.random() * experiences.length)];
        const randomAngle = angles[Math.floor(Math.random() * angles.length)];
        const randomTone = tones[Math.floor(Math.random() * tones.length)];
        
        // 3. The Chaos Token (Forces the LLM to treat every request as a completely isolated, unique task)
        const chaosToken = Date.now().toString() + Math.random().toString(36).substring(7);

        const constructedPrompt = `
        You are a Reddit user posting in an Etsy seller community. 
        Your profile: You ${randomExperience} selling ${randomProduct}.
        Your goal today: ${randomAngle}
        Your tone: ${randomTone}
        `;

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
                        content: `You are an average, everyday Reddit user. 
                        CRITICAL RULES:
                        1. NO hashtags, NO emojis, NO corporate marketing speak.
                        2. Keep titles lowercase or casual sentence case.
                        3. Use extremely natural internet slang occasionally (e.g., tbh, idk, rn, legit).
                        4. Keep it relatively short (under 3 paragraphs).
                        5. Seed context: ${chaosToken} (Ensure vocabulary and sentence structure are 100% unique from any previous output).
                        6. YOU MUST format your response exactly like this:
                        TITLE: [your title here]
                        BODY: [your body text here]` 
                    },
                    { role: "user", content: constructedPrompt }
                ],
                temperature: 0.95 // High temperature forces maximum variation
            })
        });

        const data = await response.json();
        
        if (!data.choices || !data.choices[0]) {
            throw new Error("Invalid response from AI provider");
        }

        const rawText = data.choices[0].message.content;

        // Extract Title and Body safely
        const titleMatch = rawText.match(/TITLE:\s*(.*)/i);
        const bodyMatch = rawText.match(/BODY:\s*([\s\S]*)/i);

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                title: titleMatch ? titleMatch[1].trim() : "quick question about etsy traffic", 
                body: bodyMatch ? bodyMatch[1].trim() : rawText 
            })
        };

    } catch (error) {
        console.error('Generation Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to generate post' }) };
    }
};