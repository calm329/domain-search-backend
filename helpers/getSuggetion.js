const nlp = require('compromise');

// const domain_extensions = {
//     name: require("./domain_extensions/unknown.json"),
//     product: require("./domain_extensions/unknown.json"),
//     place: require("./domain_extensions/unknown.json"),
//     organization: require("./domain_extensions/unknown.json"),
//     date: require("./domain_extensions/unknown.json"),
//     money: require("./domain_extensions/unknown.json"),
//     percentage: require("./domain_extensions/unknown.json"),
//     ordinal: require("./domain_extensions/unknown.json"),
//     verb: require("./domain_extensions/unknown.json"),
//     noun: require("./domain_extensions/unknown.json"),
//     adjective: require("./domain_extensions/unknown.json"),
//     adverb: require("./domain_extensions/unknown.json"),
//     animal: require("./domain_extensions/unknown.json"),
//     food: require("./domain_extensions/unknown.json"),
//     unknown: require("./domain_extensions/unknown.json")
// };

const getSuggetion = (word) => {
    const doc = nlp(word);

    console.log('Analyzed Document:', doc.out('json'));

    if (doc.people().length > 0) return require("./domain_extensions/people.json");
    if (doc.places().length > 0) return require("./domain_extensions/place.json");
    if (doc.organizations().length > 0) return require("./domain_extensions/organizations.json");

    return require("./domain_extensions/unknown.json");
};

module.exports = { getSuggetion };