const https = require('https');
const fs = require('fs');

// extract stations
extractStationsFromRadioGarden()

// get every place from radio.garden
function extractStationsFromRadioGarden(){
    let stations = {}
   
    https.get('https://radio.garden/api/ara/content/secure/places', (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', async () => {

        console.log(`${JSON.parse(data).data.list.length} locations found!`)

        let index = 1
        for (const place of JSON.parse(data).data.list) {
            const result = await getStationsForPlace(place)
            console.log(`${index}/${JSON.parse(data).data.list.length} -> Extracting ${result.data.urls.length} stations for location: ${result.name}`)
            stations[result.name]= result.data
            index++
        }

        // save stations to file
        writeStationsToFile(stations)

    });
    }).on('error', (err) => {
        console.error(err);
    });
}

// get stations for each place
function getStationsForPlace(place){
    return new Promise((resolve, reject) => {

        https.get('https://radio.garden/api/ara/content/secure/page/'+place.id, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', async () => {
            let stations = []
            for (const item of JSON.parse(data).data.content[0].items) {
                if(item.href){

                    let url = item.href.split('/')
                    let id = url[url.length - 1];

                    // get the real url behind the 302
                    let realUrl = await getRealUrl(`https://radio.garden/api/ara/content/listen/${id}/channel.mp3`)

                    stations.push(
                        {
                            name: item.title,
                            url: realUrl
                        }
                    )
                    
                }
            };

            let name = place.title + ' - ' + place.country
            let urls = stations

            let station = {
                name: name,
                data:{
                     "coords":{
                         "n":place.geo[1],
                         "e":place.geo[0]
                     },
                     "urls":urls       
                 }
             }

            resolve(station)
        });
        }).on('error', (err) => {
            console.error(err);
        });
    });
}

// get real url behind 302 redirect
function getRealUrl(url){
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let real = response.headers.location.split('?listening-from-radio-garden')
            resolve(real[0])
          }).on('error', (e) => {
            console.error(`Got error: ${e.message}`);
          });
    })
}

// write stations to file
function writeStationsToFile(data){
    fs.writeFile('stations.json', JSON.stringify(data), (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Data written to file');
      }
    });
}