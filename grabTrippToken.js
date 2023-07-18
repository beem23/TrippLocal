const axios = require('axios');
const TripAuth = require('./TrippLiteAuth');
const https = require('https');

let TrippAccessToken = {};
let TrippRefreshToken = {};

async function getTrippToken(endpoint, mac) {
    console.log('getTrippToken is called')
    const options = {
        url: `https://${endpoint}/api/oauth/token`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/vnd.api+json',
            'Accept-Version': '1.0.0'
        },
        data: JSON.stringify(TripAuth.authData),
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    };
    return axios(options)
        .then(response => {
            const result = response.data;
            TrippAccessToken[mac] = result.access_token;
            TrippRefreshToken[mac] = result.refresh_token;
        })
        .catch(error => {
            console.log('Cannot connect to Tripp', error.message)
            throw error;
        })
}

function setTrippAccessToken(mac, token) {
    TrippAccessToken[mac] = token;
}
function setTrippRefreshToken(mac, token) {
    TrippRefreshToken[mac] = token;
}
function clearTrippToken() {
    console.log('Clear called')
    for (let prop in TrippAccessToken) {
        if (TrippAccessToken.hasOwnProperty(prop)) {
            delete TrippAccessToken[prop];
        }
    }
}

module.exports = {
    getTrippToken,
    get TrippAccessToken() { return TrippAccessToken; },
    setTrippAccessToken,
    get TrippRefreshToken() { return TrippRefreshToken; },
    setTrippRefreshToken,
    clearTrippToken
}