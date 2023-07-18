const memory = require('./retrieveMemory')
const grabToken = require('./grabTrippToken')
const getLoads = require('./getTrippLoads')
const { TrippAccessToken, TrippRefreshToken, setTrippAccessToken, setTrippRefreshToken, clearTrippToken } = require('./grabTrippToken')
const TokenRefresh = require('./TokenRefresh');

async function IsLooking(mac, id, device) {
    console.log('made it here')
    console.log(mac)
    //get TrippLite states every 3s and send to Proxy to MongoDB
    return memory.getMemory()
        .then(jsonContent => {
            const result = jsonContent;
            const trippLites = result.TrippLites;

            for (const key of Object.keys(trippLites)) {
                const trippLite = trippLites[key];
                if (trippLite.mac === mac.mac) {
                    const endpoint = trippLite.endpoint;
                    console.log('Endpoint:', endpoint);
                    if (TrippAccessToken[mac.mac] == '' || TrippAccessToken[mac.mac] == null) {
                        return grabToken.getTrippToken(endpoint, mac.mac)
                            .then(response => {
                                if (response != TrippAccessToken[mac.mac] && response) {
                                    grabToken.setTrippAccessToken(mac.mac, response);
                                }
                                return handleGetLoads(endpoint, mac.mac, id)
                            })
                            .catch(err => {
                                console.log('Error in getTrippToken Function', err)
                            })
                    } else {
                        return handleGetLoads(endpoint, mac.mac, id);
                    }
                    return; // Exit the function since we found a match
                }
            }
        })
        .catch(err => {
            console.log('Error in getMemory Function', err)
        })
}

function handleGetLoads(endpoint, mac, id) {
    console.log('called handlegetloads')
    return getLoads.getLoads(endpoint, mac)
        .then(loadStates => {
            console.log(typeof loadStates)
            return loadStates;
        })
        .catch(err => {
            console.log('error in get loads', err)
            TokenRefresh.refreshToken(endpoint, mac)
                .then(() => {
                    console.log('token refreshed successfully')
                    return handleGetLoads(endpoint, mac, id)
                })
                .catch(err => {
                    console.log('Error in refresh token function', err)
                    clearTrippToken();
                    // setTrippAccessToken(mac, {})
                    // setTrippRefreshToken(mac, {})
                    console.log('TrippToken', TrippAccessToken)
                })
        })
}

module.exports = {
    IsLooking
}