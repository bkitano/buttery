// ------ CONSTANTS -------

var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = 8080;
var count = 0;
var MongoClient = require("mongodb").MongoClient;
var assert = require("assert");

// ------ MIDDLEWARE ------
app.use(express.static(__dirname + '/node_modules')); 

// mongo middleware
var url = 'mongodb://brian:buttery@ds123182.mlab.com:23182/buttery';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to database");
  db.close();
});

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
    
    client.on('order-from-client', function(data) {
        count++;
        var d = new Date();
        
        var order = {
            'date' : d.toJSON(),
            'number' : count,
            'name' : data.name,
            'order' : data.order
        };
        console.log(order);
        // add to mongo database
        
        MongoClient.connect(url, function(err, db) {
            if(err) {
                console.log(err);
            } else {
                var collection = db.collection("orders");
                collection.insertOne(order, function(err, result) {
                    if(err){
                        console.log(err);
                    }
                });
            }
            db.close();
        });

       io.sockets.emit('order-to-client', order); 
    });
    
});

// ------ NOTES ------
/*
- script tags go in the body tags
*/