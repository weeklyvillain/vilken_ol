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
let beers = [];
let pageNr = 0;

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
        options.url = `https://api-extern.systembolaget.se/product/v1/product/search?Page=${pageNr}&SubCategory=Öl&PriceMax=20`;
        request(options, callback);
        // fulfix då systembolaget är noobs och man inte kan välja butik i sin search
        // jag kan ha fel checka detta senare men for now så funkar det.
        info["Hits"].forEach(function(beer) {
          if(beer["IsInStoreSearchAssortment"].includes("0504")){
            beers.push(beer);
          }
        });
        //beers = beers.concat(info["Hits"]);
        console.log(beers.length);
      } else {
        console.log("Got all beers that met the requirement!");
      }
    }
    if(!error && response.statusCode == 429){
      const info = JSON.parse(body);
      // matchar siffran/siffrorna i responsen från bolaget
      let num = info["message"].match(/\d+/)[0]
      console.log(info["message"]);
      // sover och testar hämta ny info
      sleep(num * 1000).then(() => {
        console.log("Sleep done! Gathering more Beer :)");
        request(options, callback);
      });
    }
}

app.get('/sys', function (req, res) {
    res.send(beers[Math.floor(Math.random() * (beers.length + 1))])
})

app.get('/', (req, res) => res.send('Hello World!'))

// Starting both http & https servers
//const httpServer = http.createServer(app);
//const httpsServer = https.createServer(credentials, app);

app.listen(80, () => {
	console.log('HTTP Server running on port 80');
  // hämta info från systembolaget
  request(options, callback)
});



//httpsServer.listen(443, () => {
//	console.log('HTTPS Server running on port 443');
//});
