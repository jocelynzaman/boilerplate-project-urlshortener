require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let bodyParser = require('body-parser');
const dns = require('node:dns');

var websites = [];

app.use(bodyParser.urlencoded({ extended: false }), function (req, res, next) {
  console.log(req.method + ' ' + req.path + ' - ' + req.ip);
  next();
});

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.route('/api/shorturl')
  .get(function (req, res) {
    let url = req.query.url;
    //let short = req.query.short_url;
    res.json({ original_url: url })
  })
  .post(function (req, res) {
    let hostname = req.body.url;
    var shortURL = websites.indexOf(hostname);
    dns.lookup(hostname.substring((hostname.indexOf('.') + 1), hostname.indexOf('/', hostname.length - 1)), (err, address, family) => {
      if (err) {
        console.error(err.message);
        res.json({ error: 'invalid url' });
      }
      else {
        console.log('address: %j', address);

        //hostname doesn't exist in database
        if (shortURL == -1) {
          shortURL = websites.length;
          websites.push(hostname);
        }

        res.json({ original_url: req.body.url, short_url: shortURL });
      }
    });
  })

app.use('/api/shorturl/:url', function (req, res) {
  res.redirect(websites[req.params.url]);
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
