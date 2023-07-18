const memory = require('./retrieveMemory')
const axios = require('axios');
const https = require('https')
const { TrippAccessToken } = require('./grabTrippToken')

async function loadControl(mac, load, control) {
    console.log('loadControl function is called')
    console.log('mac', mac)
    console.log('load', load)
    console.log('control', control)
    let action;
    if (control == 'OFF') {
        action = 'LOAD_ACTION_OFF'
    } else if (control == 'ON') {
        action = 'LOAD_ACTION_ON'
    } else {
        action = 'LOAD_ACTION_CYCLE'
    }
    return memory.getMemory()
        .then(jsonContent => {
            const result = jsonContent;
            const trippLites = result.TrippLites;
            for (const key of Object.keys(trippLites)) {
                const trippLite = trippLites[key];
                if (trippLite.mac === mac) {
                    const endpoint = trippLite.endpoint;
                    console.log('Endpoint:', endpoint);
                    return axios({
                        method: 'patch',
                        url: `https://${endpoint}/api/loads_execute/${load}`,
                        headers: {
                            'Authorization': `Bearer ${TrippAccessToken[mac]}`,
                            'Content-Type': 'application/vnd.api+json',
                            'Accept-Version': '1.0.0'
                        },
                        httpsAgent: new https.Agent({
                            rejectUnauthorized: false,
                        }),
                        data: {
                            data: {
                                'type': 'loads_execute',
                                'attributes': {
                                    'device_id': 1,
                                    'load_action': action
                                }
                            }
                        }
                    })
                        .then(response => {
                            console.log(response.data)
                            return response.data;
                        })
                        .catch(err => {
                            console.log('Error in tripp control', err)
                            throw err;
                        })
                }
            }
        })
        .catch(err => {
            console.log('Error in getMemory Function', err)
        })
}

module.exports = {
    loadControl
}