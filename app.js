const express = require('express');  
const bodyParser = require('body-parser');  
const cors = require('cors');  
const rateLimiter = require('./helpers/rateLimiter');  
const domainRoutes = require('./routes/domainRoutes');  
require('dotenv').config();  
require('./cronJobs'); // Ensure cron jobs are scheduled  

const app = express();  
const PORT = process.env.PORT || 3000;  

app.use(cors());  
app.use(bodyParser.json());  
app.use(rateLimiter);  

app.use('/domains', domainRoutes);  

// Fallback route for content management from WordPress  
app.get('*', async (req, res) => {  
  try {  
    const content = await wordpressService.getContentByPath(req.originalUrl);  
    res.send(content);  
  } catch (error) {  
    res.status(500).send('Content not found');  
  }  
});  

app.listen(PORT, () => {  
  console.log(`Server is running on http://localhost:${PORT}`);  
});