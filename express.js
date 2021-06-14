// Dependencies
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const request = require('request')

//  req url till systembolaget https://api-extern.systembolaget.se/product/v1/product/search?SubCategory=Öl
const app = express();

// Certificate
//const privateKey = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem', 'utf8');
//const certificate = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/cert.pem', 'utf8');
//const ca = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/chain.pem', 'utf8');
//
//const credentials = {
//	key: privateKey,
//	cert: certificate,
//	ca: ca
//};

// default config
let rawdata = fs.readFileSync('beers.json');
let temp_beers = [];
let beers = JSON.parse(rawdata);
let pageNr = 0;
let maxPrice = 20;
let store = "0504";

const options = {
  url: `https://api-extern.systembolaget.se/product/v1/product/search?Page=${pageNr}&SubCategory=Öl`,
  headers: {
    'Ocp-Apim-Subscription-Key': 'acbfd4e32e2b441792e537699cc0efc9'
  }
};
// sleep time expects milliseconds
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function callback(error, response, body) {

    if (!error && response.statusCode == 200) {
      const info = JSON.parse(body);
      console.log(info["Metadata"]);
      if(info["Metadata"]["NextPage"] != -1){
        // set new page
        pageNr = info["Metadata"]["NextPage"];
        // updates req url
        options.url = `https://api-extern.systembolaget.se/product/v1/product/search?Page=${pageNr}&SubCategory=Öl&PriceMax=${maxPrice}`;
        request(options, callback);
        // fulfix då systembolaget är noobs och man inte kan välja butik i sin search
        // jag kan ha fel checka detta senare men for now så funkar det.
        info["Hits"].forEach(function(beer) {
          if(beer["IsInStoreSearchAssortment"].includes(store)){
            temp_beers.push(beer);
          }
        });
        //beers = beers.concat(info["Hits"]);
        console.log(temp_beers.length);
      } else {
        beers = temp_beers;
        temp_beers = [];
        

        console.log("Got all beers that met the requirement!");
      }
    }
    if(!error && response.statusCode == 429){
      const info = JSON.parse(body);
      // matchar siffran/siffrorna i responsen från bolaget
      let num = info["message"].match(/\d+/)[0]
      console.log(info["message"]);
      // sover och testar hämta ny info
      // * 1000 för att funktionen tar milliseconds
      sleep(num * 1000).then(() => {
        console.log("Sleep done! Gathering more Beer :)");
        request(options, callback);
      });
    }
}


function get_random_beer() {
    return beers[Math.floor(Math.random() * (beers.length - 1))];
}

app.get('/api/random', function (req, res) {
    res.send(get_random_beer())
})

app.get('/api/all', function (req, res) {
  res.send(beers)
})

// app.get('/something', (req, res) => {
//     if (req.query.maxPrice != null) {
  //       maxPrice = req.query.maxPrice;
  //     }
  // })
/*
app.get("/update", async (req, res) => {
  await request(options, callback)
  res.send("updating")
});

app.get("/savedb", async (req, res) => {
  let data = JSON.stringify(beers);
  await fs.writeFileSync('beers.json', data)
  res.send("saving done")
});

app.get("/cleardb", async (req, res) => {
  await fs.writeFileSync('beers.json', "")
  res.send("clear done")
});

app.get("/update", (req, res) => {
  request(options, callback)
});
*/
app.get('/', function (req, res) {
  beer = get_random_beer();
  if(beer == undefined) {
    res.send("Något gick fel kunde inte hitta din öl :(");
  }
  res.render('index', { title: 'Vilken öl idag?', beerNameBold: beer["ProductNameBold"], beerNameThin : beer["ProductNameThin"], prodId: beer["ProductNumber"], price: beer["Price"], taste: beer["BeverageDescriptionShort"], alcohol: beer["AlcoholPercentage"], beerIndex: beers.indexOf(beer) + 1, numOfBeers: beers.length})
})


// Starting both http & https servers
//const httpServer = http.createServer(app);
//const httpsServer = https.createServer(credentials, app);
// set view engine to use pug

app.set('view engine', 'pug')
app.set('views', './views')
app.listen(3000, () => {
	console.log('HTTP Server running on port 80');
  // hämta info från systembolaget
  //request(options, callback)
});



//httpsServer.listen(443, () => {
//	console.log('HTTPS Server running on port 443');
//});
