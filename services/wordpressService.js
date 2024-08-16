const wordpressService = require('../services/wordpressService');  

exports.getContentByPath = async (req, res) => {  
  try {  
    const content = await wordpressService.getContentByPath(req.originalUrl);  
    res.send(content);  
  } catch (error) {  
    res.status(500).send('Content not found');  
  }  
};