var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var currentRoom;

var mongoose = require('mongoose');
mongoose.connect('mongodb://rubenabergel:qwertyuiop@dogen.mongohq.com:10047/whiteboardDB');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


var Rooms = mongoose.model('Rooms', { name: String , DrawingObj : [] });


app.get('/*', function(req, res){
  res.sendfile('index.html');
});
var curentNsp;
// var userCount = 0;

io.on('connect', function(socket) {
    curentNsp = socket.handshake.headers.referer;
    socket.join(curentNsp);
    socket.on('drawing', function(drawObj){
      console.log('I am drwa');
      socket.to(curentNsp).emit('drawing', drawObj);
    });



 });

// io.on('connection', function(socket){
//     socket.on('drawing', function(drawObj){
//       //saving all new drawing
//           console.log('curent room update',currentRoom);

//         Rooms.update({_id: currentRoom},{ $push : { DrawingObj : drawObj  }},  function(err, els){
//           console.log('err',err, els);
//         });
//       // emiting new live drawing
//         io.emit('drawing', drawObj);
//     });

//     socket.on('getUrl', function(url){
//         var promise = Rooms.findOne({'name':url.currentUrl}).exec();
//         promise.then(function(data){
//           if ( data ) {
//             currentRoom = data._id;
//             io.emit('PreviousDrawing', data.DrawingObj);
//           }else{
//             var currentUrl = new Rooms({ name: url.currentUrl, DrawingObj:[], ip:'ok' });
//                                     currentUrl.save(function (err) {
//                                     console.log('saved');
//                                     if (err) // ...
//                                     console.log('err', err);
//                                   });
//             currentRoom = currentUrl._id;
//           }
//         })
//     });

// });


http.listen(3000, function(){
  console.log('listening on *:3000 with ruben');
});