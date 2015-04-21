var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);



var mongoose = require('mongoose');
mongoose.connect('mongodb://rubenabergel:qwertyuiop@dogen.mongohq.com:10047/whiteboardDB');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


var Rooms = mongoose.model('Rooms', { name: String , DrawingObj : [] });
var userCount = -1;

var ColorPerRooms = {};
var currentRoomName;


app.get('/*', function(req, res){
  res.sendfile('index.html');
});
var roomUrl;
//checking new connectio for color assignment
io.on('connect', function(user) {
  userCount ++;
  roomUrl = user.handshake.headers.referer;
  if (!ColorPerRooms[roomUrl] ){
      ColorPerRooms[roomUrl] = { userCount : 0 };
  }else{
      ColorPerRooms[roomUrl].userCount++;
  }
  // io.emit('colorPerRoom', ColorPerRooms);
  io.emit('color', userCount);
});


io.on('connection', function(socket){

  // checking disconnection
  socket.on('disconnect', function (user) {
        userCount--;
  });

  // getting room history
  socket.on('getUrl', function(url){
      currentRoomName = url.currentUrl;
      var promise = Rooms.findOne({'name':url.currentUrl}).exec();
      promise.then(function(data){
        if ( data ) {
          console.log(data);
          currentRoom = data._id;
          io.emit('PreviousDrawing', data.DrawingObj);
        }else{
          var currentUrl = new Rooms({ name: url.currentUrl, DrawingObj:[], ip:'ok' });
                                  currentUrl.save(function (err) {
                                  console.log('saved');
                                  if (err) // ...
                                  console.log('err', err);
                                });
          currentRoom = currentUrl._id;
        }
      });
  });

    // sending live drawing
  socket.on('drawing', function(drawObj){
    console.log(drawObj);
      //saving all new drawing
      Rooms.update({_id: currentRoom},{ $push : { DrawingObj : drawObj  }},  function(err, els){
          console.log('err',err, els);
      });
      // emiting new live drawing
      if ( currentRoomName === roomUrl){
        // console.log(currentRoomName ,receivedUrl)
        io.emit('drawing', drawObj);
      }

  });

});


http.listen(3000, function(){
  console.log('listening on *:3000 with ruben');
});