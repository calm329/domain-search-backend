const axios = require('axios');
const xml2js = require('xml2js');
require('dotenv').config();

const apiUrl = process.env.API_URL;
const clientIp = process.env.CLIENT_IP;

exports.checkDomain = async (domainName) => {
  const response = await axios.get(apiUrl, {
    params: {
      ApiUser: process.env.API_USERNAME,
      ApiKey: process.env.API_KEY,
      UserName: process.env.API_USERNAME,
      Command: 'namecheap.domains.check',
      ClientIp: clientIp,
      DomainList: domainName,
    },
  });
  return response.data;
};

exports.checkAvailability = (domainName) => {
  return new Promise(async (resolve, reject) => {
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
          reject('Error parsing response');
        };

        const apiResponse = result.ApiResponse;
        if (apiResponse?.CommandResponse?.[0]?.DomainCheckResult) {
          const domainCheckResult = apiResponse.CommandResponse[0].DomainCheckResult;

          const availabilityResult = domainCheckResult.map((domain) => ({ "domain": domain.$.Domain, "available": domain.$.Available === 'true' }));

          resolve(availabilityResult);
        } else {
          reject('Domain check result not found in response');
        }
      });
    } catch (error) {
      console.error('Error details:', error.response ? error.response.data : error.message);
      reject('Error communicating with Namecheap API');
    };
  });
};

exports.registerDomain = async (domain, user) => {
  const response = await axios.post(apiUrl, {
    ApiUser: process.env.API_USERNAME,
    ApiKey: process.env.API_KEY,
    UserName: process.env.API_USERNAME,
    Command: 'namecheap.domains.create',
    ClientIp: clientIp,
    DomainName: domain,
    RegistrantEmailAddress: user.email,
    RegistrantFirstName: user.firstName,
    RegistrantLastName: user.lastName,
    RegistrantPhone: user.phone,
    RegistrantAddress1: user.address1,
    RegistrantCity: user.city,
    RegistrantStateProvince: user.state,
    RegistrantPostalCode: user.postalCode,
    RegistrantCountry: user.country,
  });
  return response.data;
};