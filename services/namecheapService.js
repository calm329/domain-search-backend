const axios = require('axios');  
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