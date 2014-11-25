var app = require('express')();
var http = require('http').Server(app);

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

http.listen(3000, function(){
  console.log('listening on *:3000');
});