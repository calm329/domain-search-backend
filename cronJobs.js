const express = require('express');  
const mongoose = require('mongoose');  
const cron = require('node-cron');  

const app = express();  

// Connect to MongoDB  
mongoose.connect(process.env.DB, {  
    useNewUrlParser: true,  
    useUnifiedTopology: true,  
});  

// Define a simple schema and model (customize based on your requirements)  
const DataSchema = new mongoose.Schema({  
    // Define your schema  
    timestamp: { type: Date, default: Date.now },  
});  
const DataModel = mongoose.model('Data', DataSchema);  

// Clean up old data (customize as needed)  
async function cleanDatabase() {  
    try {  
        const result = await DataModel.deleteMany({  
            timestamp: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // For example, older than 30 days  
        });  
        console.log(`Deleted ${result.deletedCount} old records`);  
    } catch (err) {  
        console.error('Error cleaning database:', err);  
    }  
}  

// Schedule the job to run at midnight every day  
cron.schedule('0 0 * * *', () => {  
    console.log('Running database cleanup');  
    cleanDatabase();  
});  

app.listen(3000, () => {  
    console.log('Server is running on port 3000');  
});