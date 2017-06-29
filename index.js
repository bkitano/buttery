// ------ CONSTANTS -------

var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = 8080;
var MongoClient = require("mongodb").MongoClient;
var assert = require("assert");
var exphbs = require("express-handlebars");

// ------ MIDDLEWARE ------
app.use(express.static(__dirname + '/node_modules'));

// handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// mongo middleware
var url = 'mongodb://brian:buttery@ds123182.mlab.com:23182/buttery';

// check to make sure the database is connected at the start
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to database");
  db.close();
});

// ------ SITES -----------

app.get('/', function(req, res) {
    
    MongoClient.connect(url, function(err, db) {
        
        // TODO
        // needs to separate received orders from completed orders
        
        if(err) {
            console.log(err);
        } else {
            var collection = db.collection("orders");
            collection.find().toArray(function(err, results) {
                if(err) {
                    console.log(err);
                } else {
                    //console.log(results);
                    
                    var received_orders = [];
                    var completed_orders = [];
                    
                    // sort the results by completed and ready
                    for(var i = 0; i < results.length; i++) {
                        switch(results[i].status) {
                            case 'received':
                                received_orders.push(results[i]);
                                break;
                            case 'completed':
                                completed_orders.push(results[i]);
                                break;
                        }
                    }
                    
                    res.render('home', {received_orders: received_orders, completed_orders: completed_orders});
                }
            });
        }
        db.close();
        
        // IP tracking
        console.log("new IP visiting: " + req.headers["x-forwarded-for"]);
    });
    //res.sendFile(__dirname + '/order.html');
});

// ------ FOOTERS ---------
server.listen(process.env.PORT || port, function() {
    console.log('listening on port ' + port + '...');
});


// ------ socket functions ------
io.on('connection', function(client) {
    console.log('client connected');
    
    client.on('disconnect', function(data) {
        console.log("client disconnected");
    });
    
    // when the client comes onto the server
    client.on('join', function(data) {
        console.log(data);
        client.emit('messages', 'Hello from server');
    });
    
    // when the server receives an order from the client
    client.on('order-from-client', function(data) {
        
        var d = new Date();
        var order = {
            'id' : Math.round(Math.random()*9e15).toString(36),
            'date' : d.toJSON(),
            'name' : data.name,
            'order' : data.order,
            'status' : 'received'
        };
        //console.log(order);

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
    
    // when the client marks the order complete
    client.on('order-marked-complete', function(data) {
        //console.log(data);
        
        // socket data
        var id = data.id;

        // change database entry status to completed if marked complete
        MongoClient.connect(url, function(err, db) {
            if(err) {
                console.log(err);
            } else {
                var collection = db.collection('orders');
                collection.findOneAndUpdate({'id': id}, {$set: {'status':'completed'}});
            }
            db.close();
        });
    }); // end of client.on('order-marked-complete')
    
    // when the client marks an order as picked-up
    client.on('order-picked-up', function(data) {
       var id = data.id;
       
       console.log(data);
       
       MongoClient.connect(url, function(err, db) {
           if(err) {
               console.log(err);
           } else {
               var collection = db.collection('orders');
               collection.findOneAndUpdate({'id':id}, {$set: {'status':'picked-up'}});
           }
           db.close();
       });
    });
    
}); // end of io.on

// ------ NOTES ------
/*
- script tags go in the body tags
- make sure to be on the correct versions of CLIs and things
-- npm v 6 (update using nvm)
-- mongodb v 3.2 (update instructions on google)
- make sure you are following instructions
-- putting handlebars material where it is supposed to go, not where it's easy
- things in html shouldn't have the same id, but it's okay to have the same class
- important to note the distinctions between form groups and form lists
*/