var app = require('express')();
var http = require('http').Server(app);

if(process.env.PORT === "" || process.env.PORT === undefined){
  process.env.PORT = 3000;
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/test', function(req, res){
  res.sendFile(__dirname + '/test.html');
});

app.get('/lib/qunit-1.12.0.css', function(req, res){
  res.sendFile(__dirname + '/lib/qunit-1.12.0.css');
});

app.get('/lib/qunit-1.12.0.js', function(req, res){
  res.sendFile(__dirname + '/lib/qunit-1.12.0.js');
});

app.get('/lib/pivalidator.js', function(req, res){
  res.sendFile(__dirname + '/lib/pivalidator.js');
});

http.listen(process.env.PORT, function(){
  console.log('listening on *:'+process.env.PORT);
});