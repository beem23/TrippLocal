require('dotenv').config();
const WebSocket = require('ws');
//NMAP function for scanning for TrippLite MAC Addresses 00:06:67...
const netScan = require('./nmapScan');
const memory = require('./retrieveMemory')
const IsLooking = require('./IsLooking')
const loadControl = require('./loadControl')

let ws = null;
let pcLocation = "";
function send(data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
    } else {
        console.log('Cannot send message, Websocket is not open')
    }
}

async function connectWebSocket() {
    try {
        const url = process.env.PROXY_URL;

        ws = new WebSocket(url);

        pcLocation = await memory.getMemory();
        console.log(pcLocation.Info.location, "PC Location")

        ws.on('open', function open() {
            ws.send(JSON.stringify({
                type: 'register',
                id: `${pcLocation.Info.location}`
            }));

            const interval = setInterval(() => {
                console.log('Sending keepAlive')
                ws.send(JSON.stringify({
                    type: 'keepAlive',
                    id: pcLocation.Info.location,
                }))
            }, 30000)

            // netScan.scanDevicesByMacAddress('00:06:67')
            //     .then(data => {
            //         console.log('Found difference', data.difference)
            //         // For each new MAC detected, send its info to the server
            //         data.difference.forEach(mac => {
            //             let deviceInfo = data.filteredDevices.find(device => device.mac === mac);
            //             // Make sure we found a matching device
            //             if (deviceInfo) {
            //                 let message = JSON.stringify({
            //                     type: 'newTrippDetected',
            //                     id: pcLocation.Info.location,
            //                     mac: deviceInfo.mac,
            //                     endpoint: deviceInfo.ip  // Assuming the 'ip' property is the endpoint
            //                 });
            //                 console.log(message)
            //                 //send the message here
            //                 ws.send(message)
            //             } else {
            //                 console.log(`No matching device found for MAC ${mac}`);
            //             }
            //         });
            //     }).catch(error => {
            //         console.error('An error occurred:', error)
            //     }).finally(() => {
            //         console.log('Promise has settled')
            //     })

        });

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);

                if (data.type == 'isLooking') {
                    console.log('received isLooking');
                    // Get the mac address from the data object
                    const { device, mac, id } = data;
                    //call function to start check on tripps every 3s to send to proxy to mongodb
                    IsLooking.IsLooking({ mac, id, device })
                        .then(loads => {
                            ws.send(JSON.stringify({
                                type: 'toWebpage',
                                id: id,
                                states: loads
                            }))
                        }).catch(err => {
                            console.log(err)
                        })
                } else if (data.type == 'controlLoad') {
                    console.log('************************************************received control', data);
                    const { mac, load, control, id, device } = data;
                    //Using this info make the load action
                    loadControl.loadControl(mac, load, control)
                        .then(response => {
                            console.log('look here', typeof response)
                            setTimeout(() => {
                                IsLooking.IsLooking({ mac, id, device })
                                    .then(loads => {
                                        ws.send(JSON.stringify({
                                            type: 'toWebpage',
                                            id: id,
                                            states: loads
                                        }))
                                    }).catch(err => {
                                        console.log(err)
                                    })
                            }, 5000)
                        }
                        )
                } else {
                    console.log(data.message)
                }

            }
            catch (err) {
                console.error('Error handling message:', err)
            }
        });

        ws.on('error', function error(err) {
            console.error('WebSocket error observed:', err)
        })

    }
    catch (err) {
        console.error('Error in connectWebSocket Function:', err)
    }
}

module.exports = {
    connectWebSocket,
    send,
    pcLocation
}