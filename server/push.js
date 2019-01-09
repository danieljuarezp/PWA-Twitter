const fs = require('fs');
const urlsafeBase64 = require('urlsafe-base64');
const vapid = require('./vapid.json');

const subscriptions = require('./subs-db.json');

module.exports.GetKey = () =>{
    return urlsafeBase64.decode(vapid.publicKey);
};

module.exports.AddSubscription = (subscription) =>{
    subscriptions.push(subscription);
    fs.writeFileSync(`${__dirname}/subs-db.json`,JSON.stringify(subscriptions));
};