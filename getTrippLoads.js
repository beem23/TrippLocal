const axios = require('axios');
const TripAuth = require('./TrippLiteAuth');
const https = require('https')
const { TrippAccessToken, TrippRefreshToken } = require('./grabTrippToken')

async function getLoads(endpoint, mac) {
    return axios.get(`https://${endpoint}/api/loads`, {
        headers: {
            'Authorization': `Bearer ${TrippAccessToken[mac]}`,
            'Content-Type': 'application/vnd.api+json',
            'Accept-Version': '1.0.0'
        },
        httpsAgent: new https.Agent({
            rejectUnauthorized: false,
        })
    })
        .then(response => {
            const loads = response.data.data.reduce((acc, load) => {
                acc[load.attributes.load_number] = load.attributes.state;
                return acc;
            }, {});
            console.log('LOADS', loads)
            return loads;  // You may want to return the transformed data here
        })
        .catch(err => {
            console.log('Error in getLoads function', err)
            throw err;
        })
}

module.exports = {
    getLoads
}