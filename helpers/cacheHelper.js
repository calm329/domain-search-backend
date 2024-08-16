const redis = require('redis');  
const client = redis.createClient();  

client.on('error', (err) => {  
    console.error('Redis error:', err);  
});  

exports.get = async (key) => {  
    return new Promise((resolve, reject) => {  
        client.get(key, (err, data) => {  
            if (err) reject(err);  
            resolve(data);  
        });  
    });  
};  

exports.set = async (key, value, expiration) => {  
    return new Promise((resolve, reject) => {  
        client.setex(key, expiration, value, (err) => {  
            if (err) reject(err);  
            resolve();  
        });  
    });  
};