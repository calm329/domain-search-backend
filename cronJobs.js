const cron = require('node-cron');
const cacheHelper = require('./helpers/cacheHelper');
const domainController = require('./controllers/domainController');

const refreshPopularKeywords = async () => {
    const popularKeywords = ['example', 'test', 'sample'];
    for (const keyword of popularKeywords) {
        const suggestions = domainController.searchSuggestions({ query: { keyword } });
        await cacheHelper.set(keyword, JSON.stringify(suggestions), 86400);
    }
    console.log('Cron job: Refreshed cache for popular keywords');
};

cron.schedule('0 0 * * *', refreshPopularKeywords);

console.log('Cron jobs scheduled.');