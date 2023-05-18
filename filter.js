const https = require('https');
const fs = require('fs');

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Number of stations to filter: ', (maxNumOfStations) => {
  console.log(`Getting ${maxNumOfStations} random stations`);

  // get random n entries from stations array to avoid too much load in raspberry
    getRandomStations(maxNumOfStations)

    // get random n entries from stations array to avoid too much load in raspberry
    function getRandomStations(n){

        // read stations file
        fs.readFile('stations.json', (err, data) => {
            if (err) throw err;
            let stations = JSON.parse(data);

            let randomStations = {}
            let index = 0
            // get N random stations
            while(index < n) {
                const keys = Object.keys(stations);
                const randomKey = keys[Math.floor(Math.random() * keys.length)];
                const randomValue = stations[randomKey];

                randomStations[randomKey]= randomValue

                index++
            }

            // write final file
            fs.writeFile('stations_filtered.json', JSON.stringify(randomStations), (err) => {
                if (err) {
                console.error(err);
                } else {
                console.log('Data written to file: stations_filtered.json');
                }
            });
        });
    }


  rl.close();
});


