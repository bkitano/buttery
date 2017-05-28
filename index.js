// ------ CONSTANTS -------

var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = 8080;

// ------ MIDDLEWARE ------
app.use(express.static(__dirname + '/node_modules'));  

// ------ SITES -----------

app.get('/', function(req, res) {
    res.send('Hello, world');
});

// ------ FOOTERS ---------
server.listen(process.env.PORT || port, function() {
    console.log('listening on port ' + port + '...');
});