const nmap = require('node-nmap');
const os = require('os');
const checkIfTripExist = require('./checkIfTripExist')

let filteredMacs;

nmap.nmapLocation = 'nmap';

function extractMacs(array) {
    return array.map(item => item.mac)
}

function subnetMaskToCIDR(subnetMask) {
    const binaryString = subnetMask.split('.').map(part => parseInt(part).toString(2)).join('');
    const cidr = binaryString.split('1').length - 1;
    return `/${cidr}`;
}

function calculateSubnet(ipAddress, subnetMask) {
    const ipOctets = ipAddress.split('.').map(part => parseInt(part));
    const maskOctets = subnetMask.split('.').map(part => parseInt(part));

    const subnetOctets = ipOctets.map((ipOctet, index) => ipOctet & maskOctets[index]);

    return subnetOctets.join('.');
}



function getNetworkAdapterInfo(macAddressPrefix) {
    return new Promise((resolve, reject) => {
        const networkInterfaces = os.networkInterfaces();

        const ethernetInterface = networkInterfaces['Ethernet'];

        if (ethernetInterface) {
            ethernetInterface.forEach(details => {
                if (details.family === 'IPv4') { // If you want IPv6, change this to 'IPv6'
                    console.log(`IP Address: ${details.address}`);
                    console.log(`Subnet Mask: ${details.netmask}`);
                    // Subnet calculation logic would go here
                    const ip = details.address;
                    const subnetMask = details.netmask;

                    const subnet = calculateSubnet(ip, subnetMask);
                    console.log(`Subnet ${subnet}`); // Output: 192.168.1.0

                    const cidr = subnetMaskToCIDR(subnetMask);
                    console.log(`CIDR ${cidr}`); // Output: /22

                    let quickscan = new nmap.QuickScan(`${subnet}${cidr}`)
                    let filteredDevices = [];

                    quickscan.on('complete', function (data) {
                        console.log('Success in scan')

                        filteredDevices = data.filter(device => device.mac && device.mac.startsWith(macAddressPrefix))
                        filteredMacs = filteredDevices;
                        console.log(filteredDevices)
                        const justMacs = extractMacs(filteredDevices);

                        //Check if TrippLite exists in the .txt file
                        checkIfTripExist.readFile(justMacs)
                            .then((difference) => {
                                console.log('difference', difference)
                                const data = { difference, filteredDevices }
                                resolve(data)
                            })
                            .catch((err) => {
                                console.error('Error in readFile:', err)
                            })


                    })

                    quickscan.on('error', function (error) {
                        console.log(error)

                        reject(error)
                    })

                    quickscan.startScan();
                }
            });
        } else {
            console.log('No Ethernet interface found.');
        }
    });
}



module.exports = {
    getNetworkAdapterInfo
}