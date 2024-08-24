const namecheapService = require('../services/namecheapService');
const xml2js = require('xml2js');
const { getSuggestions } = require('../helpers/getSuggetion.js');
const axios = require("axios");
const domainModel = require("../models/domain.model.js");

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
        const response = await axios.get('https://api.namecheap.com/xml.response', {
            params: {
                ApiUser: process.env.API_USERNAME,
                ApiKey: process.env.API_KEY,
                UserName: process.env.API_USERNAME,
                Command: 'namecheap.domains.check',
                ClientIp: "62.146.225.35",
                DomainList: `${domainName}.com`,
            },
        });

        xml2js.parseString(response.data, (err, result) => {
            if (err) {
                console.error('Error parsing XML:', err);
                return res.status(500).send('Error parsing response');
            };

            const apiResponse = result.ApiResponse;
            if (apiResponse?.CommandResponse?.[0]?.DomainCheckResult) {
                const domainCheckResult = apiResponse.CommandResponse[0].DomainCheckResult[0];
                const isAvailable = domainCheckResult.$.Available === 'true';

                return res.send({
                    domain: domainName,
                    available: isAvailable,
                });
            } else {
                return res.status(500).send('Domain check result not found in response');
            }
        });
    } catch (error) {
        console.error('Error details:', error.response ? error.response.data : error.message);
        return res.status(500).send('Error communicating with Namecheap API');
    }
};

exports.searchSuggestions = async (req, res) => {
    const { keyword } = req.query;
    let suggestions;

    const domainTerm = keyword.replace(/\s+/g, '');
    try {
        const db_suggetions = await domainModel.findOne({ keyword: domainTerm });
        
        if (db_suggetions) {
            suggestions = db_suggetions?.response;
        } else {
            suggestions = await getSuggestions(domainTerm);

            if (suggestions) {
                await domainModel.create({
                    keyword: domainTerm,
                    response: suggestions,
                });
            };

        };

        const avaiblity = await namecheapService.checkAvailability(domainTerm);

        return res.json({
            extentions: suggestions,
            avaiblity: avaiblity
        });
    } catch (error) {
        console.error('Error in domain search:', error);
        res.status(500).send('Internal Server Error');
    };
};

// exports.searchSuggestions = async (req, res) => {
//     const { keyword } = req.query;
//     console.log(keyword)
//     const domainTerm = keyword.replace(/\s+/g, '');
//     try {
//         const suggestions = getSuggetion(domainTerm);
//         const avaiblity = await namecheapService.checkAvailability(domainTerm);

//         res.json({
//             extentions: suggestions,
//             avaiblity: avaiblity
//         });
//     } catch (error) {
//         console.error('Error in domain search:', error);
//         res.status(500).send('Internal Server Error');
//     };
// };

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