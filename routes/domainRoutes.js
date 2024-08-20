const express = require('express');
const router = express.Router();
const domainController = require('../controllers/domainController');

router.get('/check-domain/:domainName', domainController.checkDomain);
router.get('/search-suggestions', domainController.searchSuggestions);
router.post('/register-domain', domainController.registerDomain);

module.exports = router;