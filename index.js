var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var mongoose = require('mongoose');
mongoose.connect('mongodb://rubenabergel:qwertyuiop@dogen.mongohq.com:10047/whiteboardDB');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var Colors = ['black', 'red', 'green', 'pink', 'yellow', 'blue'];

var Rooms = mongoose.model('Rooms', { name: String, DrawingObj: [] });

var UserCounts = {};

app.get('/*', function (req, res) {
    res.sendfile('index.html');
});
var currentDrawing = [];

io.on('connect', function (socket) {
    socket.on('room', function (room) {
        if ( UserCounts[room] ){
           UserCounts[room]++;
        }else{
          UserCounts[room] = 1;
        }

        socket.color = Colors[UserCounts[room]-1];
        socket.emit('NewColor', {'color': socket.color});
        console.log('I am in a room', room);
        socket.join(room);

        // url
        socket.roomId = room;

        var currentUrl = room;
        var promise = Rooms.findOne({'name': currentUrl}).exec();
        promise.then(function (data) {
            if (data) {
                socket.room = data;
                socket.emit('PreviousDrawing', data.DrawingObj);
            } else {
                socket.room = createRoom(currentUrl);
            }
        });

        socket.on('mouseout', function (flag) {
            if (currentDrawing.length > 0) {
                 Rooms.update({_id: socket.room._id}, { $push: { DrawingObj: {'color': socket.color, 'lines': currentDrawing}  }}, function (err, els) {
                    console.log('err in saving new drawing', err, els);
                });
            }
            currentDrawing = [];
        })


        socket.on('drawing', function (drawObj) {
            currentDrawing.push(drawObj);
            socket.to(room).emit('drawing', {'color': socket.color, 'lines': currentDrawing});
        });
    });

    socket.on('disconnect', function() {
      console.log("Disconnected, leaving room", socket.roomId);
      socket.leave(socket.roomId);
    });
});


function createRoom(currentUrl) {
    var newRoom = new Rooms({ name: currentUrl, DrawingObj: [] });
    newRoom.save(function (err) {
        console.log('saved');
        if (err) // ...
            console.log('err', err);
    });
    return newRoom;
}


http.listen(3000, function (err) {
    console.log('listening on *:3000 with ruben');
});
