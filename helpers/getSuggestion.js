const Groq = require("groq-sdk");  
const nlp = require('compromise');  
const axios = require("axios");  
const xml2js = require('xml2js');  
const predefinedData = require('./domain_extensions/unknown.json'); // Fallback data  

// Load other JSON data dynamically as needed  
const peopleData = require('./domain_extensions/people.json');  
const placeData = require('./domain_extensions/place.json');  
const organizationData = require('./domain_extensions/organizations.json');  

const apiKeys = [  
    process.env.GROQ_API_KEY_1,  
    process.env.GROQ_API_KEY_2,  
];  

let currentApiKeyIndex = 0;  

function rotateApiKey() {  
    currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;  
    return apiKeys[currentApiKeyIndex];  
}  

const getPredefinedSuggestions = (word) => {  
    const doc = nlp(word);  

    let data;  
    if (doc.people().length > 0) {  
        data = peopleData;  
    } else if (doc.places().length > 0) {  
        data = placeData;  
    } else if (doc.organizations().length > 0) {  
        data = organizationData;  
    } else {  
        data = predefinedData; // Default fallback  
    }  

    // Replace the placeholder "$" with the actual word  
    const suggestions = data.map(s => s.replace(/\$/g, word));  

    return suggestions;  
};  

async function getAiGeneratedSuggestions(term) {  
    return new Promise(async (resolve, reject) => {  
        let apiKey = apiKeys[currentApiKeyIndex];  
        const groq = new Groq({ apiKey });  

        const prompt = `You are a helpful assistant that generates creative and meaningful website domain names. Given a keyword, generate exact 100 domain names by adding related keywords both in front of and behind the provided keyword, no space between and without the TLD. Ensure that the domains reflect the essence of the keyword and are creatively relevant. Mix the placement of related keywords in both positions (before and after) for variety. Sort the domains by popularity, with the most popular ones listed first. The response should be in the following structure:  
        
        """  
        {  
        suggestions : ["domain1", "domain2", "domain3", ...]  
        }  
        """  
        
        Ensure the output is a valid JSON`;  

        const params = {  
            messages: [  
                { role: 'system', content: prompt },  
                { role: 'user', content: term },  
            ],  
            model: 'llama-3.1-70b-versatile',  
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
                resolve(getAiGeneratedSuggestions(term));  
            } else {  
                reject(err);  
            };  
        }  
    });  
}  

const getSuggestions = async (word) => {  
    const predefinedSuggestions = getPredefinedSuggestions(word);  
    const aiSuggestions = await getAiGeneratedSuggestions(word);  
    // AI suggestions on top and predefined ones below  
    return [...aiSuggestions, ...predefinedSuggestions];  
};  

module.exports = { getSuggestions };