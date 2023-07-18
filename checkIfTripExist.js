//get all mac's from the txt document in the TrippLites object
const fs = require('fs');

function difference(filteredDevicesMacs, macs) {
    const notHere = filteredDevicesMacs.map(device => device.trim().toUpperCase()).filter(device => {
        const isInMacs = macs.map(mac => mac.trim().toUpperCase()).includes(device);
        console.log(`Comparing ${device} to macs: ${isInMacs ? "found" : "not found"}`);
        return !isInMacs;
    }); console.log('filteredDevices', filteredDevicesMacs)
    console.log('macs', macs)
    console.log('notHere', notHere)

    if (notHere.length === 0) {
        return 'No new TrippLite detected';
    } else {
        // For each new device not in memory, send its info to the server
        return notHere;
    }
}

function readFile(filteredDevicesMacs) {
    // Return a promise
    return new Promise((resolve, reject) => {
        // Read the file and parse its content
        fs.readFile('memory.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                // Reject the promise if there's an error
                reject(err);
                return;
            }

            const obj = JSON.parse(data);
            const macs = [];

            // Loop over the TrippLites section of the object
            for (let key in obj.TrippLites) {
                let trippLite = obj.TrippLites[key];
                macs.push(trippLite.mac);
            }

            console.log('MAC Addresses from memory', macs);
            console.log('MAC Addresses from scan', filteredDevicesMacs)

            console.log(difference(filteredDevicesMacs, macs))


            // Resolve the promise with the difference result
            resolve(difference(filteredDevicesMacs, macs));
        });
    });
}

module.exports = {
    readFile
}