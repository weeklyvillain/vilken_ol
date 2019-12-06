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
let beers = {}

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    const info = JSON.parse(body);
    console.log(info.length);
    beers = info["Hits"];
  }
}



const options = {
  url: 'https://api-extern.systembolaget.se/product/v1/product/search?SubCategory=Öl',
  headers: {
    'Ocp-Apim-Subscription-Key': 'acbfd4e32e2b441792e537699cc0efc9'
  }
};



app.get('/sys', function (req, res) {
    res.send(beers[Math.floor(Math.random() * (beers.length + 1))])
})

app.get('/', (req, res) => res.send('Hello World!'))

// Starting both http & https servers
//const httpServer = http.createServer(app);
//const httpsServer = https.createServer(credentials, app);

app.listen(80, () => {
	console.log('HTTP Server running on port 80');
  request(options, callback)
});



//httpsServer.listen(443, () => {
//	console.log('HTTPS Server running on port 443');
//});
