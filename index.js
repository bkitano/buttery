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
        res.sendFile(__dirname + '/order.html');
});

// ------ FOOTERS ---------
server.listen(process.env.PORT || port, function() {
    console.log('listening on port ' + port + '...');
});


// ------ socket functions ------
io.on('connection', function(client) {
    console.log('client connected');
    
    client.on('join', function(data) {
        console.log(data);
        client.emit('messages', 'Hello from server');
    });
    
});