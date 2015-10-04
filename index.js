var express = require('express');
var http = require('http');
var https = require('https');
var wiki = require('./wiki');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use('/public', express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (request, response) {
  response.render('index');
});

app.get('/search/:term', function (request, response) {
  request.params.term = encodeURIComponent(request.params.term.trim());
  var options = {
    host: 'illuminaughty-background.herokuapp.com',
    path: '/?q=' + request.params.term,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  app.getJSON(options,
    function (statusCode, result) {
      // I could work with the result html/json here.  I could also just return it
      console.log("onResult: (" + statusCode + ")" + JSON.stringify(result));
      response.statusCode = statusCode;
      wiki.printJSON(result);
      response.send([{ name: result }]);
    });
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});

app.getJSON = function (options, onResult) {
  console.log("rest::getJSON");

  var prot = options.port == 443 ? https : http;
  var req = prot.request(options, function (res) {
    var output = '';
    console.log(options.host + ':' + res.statusCode);
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      output += chunk;
    });

    res.on('end', function () {
      var obj = JSON.parse(output);
      onResult(res.statusCode, obj);
    });
  });

  req.on('error', function (err) {
    //res.send('error: ' + err.message);
  });

  req.end();
};