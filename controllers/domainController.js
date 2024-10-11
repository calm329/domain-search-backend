const axios = require("axios");  
const http = require("http");  
const https = require("https");  
const { getSuggestions } = require('../helpers/getSuggestions.js');  

// Ensure WHOAPI_KEY is set in your environment  
const WHOAPI_KEY = process.env.WHOAPI_KEY;  
const WHOAPI_URL = 'https://api.whoapi.com/';  

// Create a custom Axios instance with keepAlive and timeout settings  
const axiosInstance = axios.create({  
  timeout: 0, // No timeout  
  httpAgent: new http.Agent({ keepAlive: true }),  
  httpsAgent: new https.Agent({ keepAlive: true }),  
});  

// Function to check availability of domains using WhoAPI  
async function checkAvailability(domains) {  
  // Create an array of promises  
  const requests = domains.map(domainObj =>  
    axiosInstance.get(WHOAPI_URL, {  
      params: {  
        domain: `${domainObj.domain}.com`, // Ensure it's a full domain name  
        r: 'taken',  
        apikey: WHOAPI_KEY,  
      },  
    })  
  );  

  // Debugging: Log total requests  
  console.log(`Total promises: ${requests.length}`);  
  requests.forEach((promise, index) => {  
    promise  
      .then(response => console.log(`Promise ${index} resolved`, response.data))  
      .catch(err =>  
        console.log(`Promise ${index} rejected`, err.response ? err.response.data : err)  
      );  
  });  

  try {  
    // Wait for all requests to complete  
    const responses = await Promise.all(requests);  
    // Log responses for debugging  
    console.log('responses:', responses.map(res => res.data));  

    // Map the responses to the desired output format  
    const results = responses.map(response => {  
      const data = response.data;  
      return { domain: data.domain ?? response.config.params.domain, available: !data.taken };  
    });  

    return results;  
  } catch (error) {  
    console.error('Error:', error);  
    throw new Error('Error communicating with WhoAPI');  
  }  
}  

// Function to handle API fetch errors  
const handleFetchError = error => {  
  if (error.response && error.response.data && error.response.data.error) {  
    const message = error.response.data.error.message;  
    const failedGeneration = error.response.data.error.failed_generation;  
    console.error(`Error: ${message}\nDetails: ${failedGeneration}`);  
  } else {  
    console.error('Error:', error.message);  
  }  
};  

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
    handleFetchError(error);  
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
    console.log('suggestions', suggestions);  

    // Check the availability of the suggested domain names  
    const availabilityResponse = await checkAvailability(suggestions.map(domain => ({ domain })));  
    console.log('availabilityResponse:', availabilityResponse);  

    // Filter and get only the available domain names  
    const availableSuggestions = availabilityResponse.filter(result => result.available).map(result => result.domain);  

    res.json({ suggestions: availableSuggestions });  
    console.log('availableSuggestions:', availableSuggestions);  
  } catch (error) {  
    handleFetchError(error);  
    res.status(500).send('Internal Server Error');  
  }  
};  

// Controller function for API endpoint to register a domain (example placeholder for demonstration purposes)  
exports.registerDomain = async (req, res) => {  
  const { domain, user } = req.body;  

  try {  
    const registrationResult = await namecheapService.registerDomain(domain, user);  
    res.json(registrationResult);  
  } catch (error) {  
    handleFetchError(error);  
    res.status(500).send('Internal Server Error');  
  }  
};