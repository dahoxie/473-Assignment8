var express = require("express"),
	app = express(),
    server = require('http').Server(app),
    mongoose = require("mongoose"),
    io = require("socket.io")(server);

app.use(express.static(__dirname + "/client"));
app.use(express.bodyParser());

// connect to the amazeriffic data store in mongo
mongoose.connect('mongodb://localhost/amazeriffic');

// This is our mongoose model for todos
var ToDoSchema = mongoose.Schema({
    description: String,
    tags: [String]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);

server.listen(3000);

var connectionList = [];
io.on('connection', function(socket) {
    connectionList.push(socket);
    socket.on('itemUpdate', function(data) {
        console.log(data);
        var newToDo = new ToDo({
            "description": data.description,
            "tags": data.tags
        });
        newToDo.save(function(err, result) {

            ToDo.find({}, function(err, result) {
                connectionList.forEach(function(nextSocket) {
                    nextSocket.emit('itemUpdate', result);

                });

            });

        });
    });

    socket.on('getToDos', function(data) {
        console.log(data);

        ToDo.find({}, function(err, toDos) {
            socket.emit('getToDos', toDos);
        });
    });
});
