const axios = require('axios');

const PROXY_URL = 'http://localhost:8080';

function sendUnassigned(unassignedArray) {
    axios.post(`${PROXY_URL}/unassigned`, unassignedArray)
        .then(response => {
            console.log('Sent over Unassigned Macs', unassignedArray)
        })
        .catch(error => {
            console.error('Error', error)
        })
}