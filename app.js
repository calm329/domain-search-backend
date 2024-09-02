const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require("mongoose");
require('dotenv').config();

const rateLimiter = require('./helpers/rateLimiter');
const domainRoutes = require('./routes/domainRoutes');

const app = express();
const PORT = process.env.PORT || 5001;  // Update to match your backend port  

mongoose.connect(process.env.DB)
    .then(() => console.log("MongoDB connected successfully!"))
    .catch((error) => console.error("MongoDB connection error:", error));

// Updated CORS configuration   
const allowedOrigins = [
    'http://62.146.225.35:5000',
    'http://domaininhand.s3-website.us-east-2.amazonaws.com',
    "http://localhost:5000"
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin, like mobile apps or curl requests  
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    optionsSuccessStatus: 200
}));

app.use(bodyParser.json());
app.use(rateLimiter);

app.use('/domains', domainRoutes);

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