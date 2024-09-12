// Import required dependencies and modules  
const { getSuggestions } = require('../helpers/getSuggestion.js'); // Corrected the typo in the file path  
const axios = require("axios");  

// Get WhoAPI credentials from environment variables  
const WHOAPI_KEY = process.env.WHOAPI_KEY;  

// Function to check the availability of domains using WhoAPI  
async function checkAvailability(domains) {  
    const url = 'https://api.whoapi.com/'; // WhoAPI endpoint  

    // Create an array of promises  
    const requests = domains.map(domainObj => {  
        return axios.get(url, {  
            params: {  
                domain: `${domainObj.domain}.com`, // Ensure it's a full domain name  
                r: 'taken',  
                apikey: WHOAPI_KEY  
            }  
        });  
    });  

    try {  
        // Wait for all requests to complete  
        const responses = await Promise.all(requests);  

        // Map the responses to desired output format  
        const results = responses.map(response => {  
            const data = response.data;  
            return { domain: data.domain || response.config.params.domain, available: !data.taken };  
        });  

        return results;  

    } catch (error) {  
        console.error('Error:');  
        throw new Error('Error communicating with WhoAPI');  
    }  
}  

// Controller function for API endpoint to check a single domain  
exports.checkDomain = async (req, res) => {  
    const { domainName } = req.params;  

    try {  
        const response = await checkAvailability([{ domain: domainName }]);  
        const isAvailable = response[0] && response[0].available;  

        res.send({  
            domain: domainName,  
            available: isAvailable,  
        });  
    } catch (error) {  
        console.error('Error in domain check:', error);  
        res.status(500).send('Internal Server Error');  
    }  
};  

// Controller function for API endpoint to search domain suggestions and check their availability  
exports.searchSuggestions = async (req, res) => {  
    const { keyword } = req.query;  

    const domainTerm = keyword.replace(/\s+/g, '');  
    try {  
        // Get domain name suggestions based on the keyword  
        const suggestions = await getSuggestions(domainTerm);  
        console.log('suggestions', suggestions)
        // Check the availability of the suggested domain names  
        const availabilityResponse = await checkAvailability(suggestions.map(s => ({ domain: s })));  
        console.log('availabilityResponse:', availabilityResponse)
        // Filter and get only the available domain names  
        const availableSuggestions = availabilityResponse  
            .filter(result => result.available)  
            .map(result => result.domain);  

        res.json({  
            suggestions: availableSuggestions,  
        });  
        console.log('availablesuggestions:', availableSuggestions)
    } catch (error) {  
        console.error('Error in domain search');  
        res.status(500).send('Internal Server Error');  
    }  
};  

// Controller function for API endpoint to register a domain  
exports.registerDomain = async (req, res) => {  
    const { domain, user } = req.body;  
    try {  
        const registrationResult = await namecheapService.registerDomain(domain, user);  
        res.json(registrationResult);  
    } catch (error) {  
        console.error('Error in domain registration:', error);  
        res.status(500).send('Internal Server Error');  
    }  
};