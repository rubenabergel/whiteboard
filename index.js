var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var mongoose = require('mongoose');
mongoose.connect('mongodb://rubenabergel:qwertyuiop@dogen.mongohq.com:10047/whiteboardDB');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var Room = mongoose.model('Room', { name: String, drawingPoints : [] });

var kitty = new Cat({ name: 'Zildjian' });
kitty.save(function (err) {
    console.log('saved');
  if (err)
  console.log('meow');
});


app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
    socket.on('drawing', function(drawObj){
        console.log('drawObj', drawObj);
        io.emit('drawing', drawObj);
    });
});


http.listen(3000, function(){
  console.log('listening on *:3000 with ruben');
});