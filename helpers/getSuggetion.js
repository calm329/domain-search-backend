const Groq = require("groq-sdk");

const apiKeys = [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
];

let currentApiKeyIndex = 0;

function rotateApiKey() {
    currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;
    return apiKeys[currentApiKeyIndex];
};

async function getSuggestions(term) {
    return new Promise(async (resolve, reject) => {
        let apiKey = apiKeys[currentApiKeyIndex];
        const groq = new Groq({ apiKey });

        const prompt = `You are a helpful assistant that generates creative and meaningful website domain names. Given a keyword, generate exact 100 domain names by adding related keywords both in front of and behind the provided keyword, without the TLD. Ensure that the domains reflect the essence of the keyword and are creatively relevant. Mix the placement of related keywords in both positions (before and after) for variety. Sort the domains by popularity, with the most popular ones listed first.The response should be in the following structure: 
        
        """
        {
        suggestions : ["domain1", "domain2", "domain3", ..., "domain100"]
        } 
        """

        Ensure the output is a valid JSON`;

        const params = {
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: term },
            ],
            model: 'llama3-8b-8192',
            response_format: { type: "json_object" },
        };

        try {
            const chatCompletion = await groq.chat.completions.create(params);
            const allDomains = chatCompletion.choices[0].message.content;

            resolve(JSON.parse(allDomains).suggestions);
        } catch (err) {
            if (err.status === 429) {
                apiKey = rotateApiKey();
                console.log(`API key rate limit reached. Switched to a new API key: ${apiKey}`);
                resolve(getSuggestions(term));
            } else {
                reject(err);
            };
        };
    });
}

module.exports = { getSuggestions };
