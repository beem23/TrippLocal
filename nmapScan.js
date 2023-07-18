const getSubnet = require('./getSubnet')

function scanDevicesByMacAddress(macAddressPrefix) {
    return new Promise((resolve, reject) => {
        getSubnet.getNetworkAdapterInfo(macAddressPrefix)
            .then(data => {
                console.log('Difference in scan', data.difference);
                console.log('Difference in scan', data);
                resolve(data)
            }).catch(error => {
                console.error('An error occurred:', error);
                return scanDevicesByMacAddress(macAddressPrefix)
            })
    });
}


module.exports = {
    scanDevicesByMacAddress
}