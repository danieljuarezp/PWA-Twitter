const urlsafeBase64 = require('urlsafe-base64');
const vapid = require('./vapid.json');

module.exports.GetKey = () =>{
    return urlsafeBase64.decode(vapid.publicKey);
};