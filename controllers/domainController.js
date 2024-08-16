const namecheapService = require('../services/namecheapService');  
const wordServices = require('../services/wordServices');  
const cacheHelper = require('../helpers/cacheHelper');  
const xml2js = require('xml2js');  

const generateDomainSuggestions = (keyword) => {  
    const prefixes = ['my', 'the', 'best'];  
    const suffixes = ['hq', 'online', 'site'];  
    const suggestions = [];  

    for (const prefix of prefixes) {  
        suggestions.push(`${prefix}${keyword}.com`);  
    }  

    for (const suffix of suffixes) {  
        suggestions.push(`${keyword}${suffix}.com`);  
    }  

    return suggestions;  
};  

exports.checkDomain = async (req, res) => {  
    const { domainName } = req.params;  
    try {  
        const response = await namecheapService.checkDomain(domainName);  

        xml2js.parseString(response, (err, result) => {  
            if (err) {  
                console.error('Error parsing XML:', err);  
                return res.status(500).send('Error parsing response');  
            }  

            const apiResponse = result.ApiResponse;  
            if (apiResponse &&  
                apiResponse.CommandResponse &&  
                apiResponse.CommandResponse[0] &&  
                apiResponse.CommandResponse[0].DomainCheckResult) {  

                const domainCheckResult = apiResponse.CommandResponse[0].DomainCheckResult[0];  
                const isAvailable = domainCheckResult.$.Available === 'true';  

                res.send({  
                    domain: domainName,  
                    available: isAvailable,  
                });  
            } else {  
                res.status(500).send('Domain check result not found in response');  
            }  
        });  
    } catch (error) {  
        console.error('Error details:', error.response ? error.response.data : error.message);  
        res.status(500).send('Error communicating with Namecheap API');  
    }  
};  

exports.searchSuggestions = async (req, res) => {  
    const { keyword } = req.query;  
    try {  
        const cachedResponse = await cacheHelper.get(keyword);  
        if (cachedResponse) {  
            return res.json(JSON.parse(cachedResponse));  
        }  

        const suggestions = generateDomainSuggestions(keyword);  
        for (const synonym of await wordServices.getSynonyms(keyword)) {  
            suggestions.push(`${synonym}.com`);  
        }  

        await cacheHelper.set(keyword, JSON.stringify(suggestions), 86400);  
        res.json(suggestions);  
    } catch (error) {  
        console.error('Error in domain search:', error);  
        res.status(500).send('Internal Server Error');  
    }  
};  

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