const axios = require('axios');
const TripAuth = require('./TrippLiteAuth');
const https = require('https');
const { TrippAccessToken, TrippRefreshToken, setTrippAccessToken, setTrippRefreshToken } = require('./grabTrippToken')


async function refreshToken(endpoint, mac) {
    console.log('refreshToken is called')
    const options = {
        url: `https://${endpoint}/api/oauth/refresh`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TrippRefreshToken[mac]}`,
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
            setTrippAccessToken(mac, result.acces_token);
        })
        .catch(error => {
            console.log('Cannot connect to Tripp', error.message)
            throw error;
        })
}

module.exports = {
    refreshToken
}