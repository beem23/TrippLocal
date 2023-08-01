const fs = require('fs');

function getMemory() {
    return new Promise((resolve, reject) => {
        fs.readFile('./memory.json', 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading file from disk: ${err}`);
                reject(err)
            } else if (data == "") {
                resolve('Empty Memory')
            } else {
                //Parse file contents
                const jsonContent = JSON.parse(data);
                // console.log(jsonContent)
                resolve(jsonContent)
            }
        })
    })
}

module.exports = {
    getMemory
}