const WordPOS = require('wordpos');  
const wordpos = new WordPOS();  

exports.getSynonyms = async (word) => {  
  return new Promise((resolve, reject) => {  
    wordpos.lookupSynonyms(word, (results) => {  
      if (!results || results.length === 0) {  
        resolve([word]);  
      } else {  
        resolve(results.flatMap(result => result.words));  
      }  
    });  
  });  
};