const axios = require('axios');  
const nlp = require('compromise');  
const predefinedData = require('./domain_extensions/unknown.json'); // Fallback data  
const peopleData = require('./domain_extensions/people.json');  
const placeData = require('./domain_extensions/place.json');  
const organizationData = require('./domain_extensions/organizations.json');  

const apiKey = [  
    process.env.AIML_API_KEY,  
];  
const baseURL = "https://api.aimlapi.com/v1";  

// Function to rotate API keys if needed  
const rotateApiKey = () => {  
    // Implement if you have multiple keys   
    return apiKey;  // for now, return the same key  
};  

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
        data = predefinedData;  
    }  

    const suggestions = data.map(s => s.replace(/\$/g, word));  

    return suggestions;  
};  

async function getAiGeneratedSuggestions(term) {  
    const prompt = `You are a helpful assistant that generates creative and meaningful website domain names. Given a keyword, generate exactly 100 available domain names that are not taken yet by adding related keywords both in front of and behind the provided keyword, no space between and without the TLD. Ensure that the domains reflect the essence of the keyword and are creatively relevant. Mix the placement of related keywords in both positions (before and after) for variety. Domain Name should not include words like 'for', 'and', 'to', 'of', 'or'. Sort the domains by popularity, with the most popular ones listed first. Generate only jason file, I don't need any explanation sentences. The response should be in the following structure:   
      
    """  
    {  
    "suggestions": ["domain1", "domain2", "domain3", ...]  
    }  
    """  
      
    Ensure the output is strictly a valid JSON. The keyword is '${term}'.`;  

    try {  
        const response = await axios.post(`${baseURL}/chat/completions`, {  
            messages: [  
                { role: 'user', content: prompt },  
            ],  
            model: 'claude-3-5-sonnet-20240620',  
            temperature: 0.7,  
            max_tokens: 4096,  
        }, {  
            headers: { Authorization: `Bearer ${rotateApiKey()}` }  
        });  

        const data = response.data.choices[0].message.content;  

        // Log the raw response for debugging  
        console.log('AI Response:', data);  

        // Parse and return suggestions  
        const parsedData = JSON.parse(data);  
        return parsedData.suggestions;  

    } catch (error) {  
        if (error.response && error.response.status === 429) {  
            console.log('Rate limit reached, handling logic needed.');  
            // Add logic if rotating through multiple keys, etc.  
        } else {  
            console.error('Error fetching AI suggestions:', error.message);  
        }  
        throw error;  
    }  
}  

const getSuggestions = async (word) => {  
    try {  
        const predefinedSuggestions = getPredefinedSuggestions(word);  
        const aiSuggestions = await getAiGeneratedSuggestions(word);  
        return [...aiSuggestions, ...predefinedSuggestions];  
    } catch (error) {  
        console.error('Error getting suggestions:', error);  
        return getPredefinedSuggestions(word); // Fallback to predefined suggestions  
    }  
};  

module.exports = { getSuggestions };  

// Usage example  
// getSuggestions('animal').then(suggestions => console.log(suggestions));