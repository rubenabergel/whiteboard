var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//needed to save drawings in the DB
var currentRoom;

var mongoose = require('mongoose');
mongoose.connect('mongodb://rubenabergel:qwertyuiop@dogen.mongohq.com:10047/whiteboardDB');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


var Rooms = mongoose.model('Rooms', { name: String , DrawingObj : [] });


app.get('/*', function(req, res){
  res.sendfile('index.html');
});


io.on('connect', function(socket) {
   var currentUrl = socket.handshake.headers.referer;


    socket.on('room', function(room){
      console.log('onnnn room');
      socket.join(room);
      var promise = Rooms.findOne({'name':currentUrl}).exec();
        promise.then(function(data){
          if ( data ) {
            currentRoom = data;
            console.log('currentRoom1', data.DrawingObj[0]);
            socket.to(room).emit('PreviousDrawing', data.DrawingObj);
          }else{
            createRoom(currentUrl);
          }
        });
        socket.on('mousedown', function(mousedown){
          var socketCount = 0;
          if( mousedown === true ){
            var drawToBeSaved = [];

            socket.on('drawing', function(drawObj){

              drawToBeSaved.push(drawObj);
              socket.to(room).emit('drawing', drawObj);

              socket.on('mouseout', function(mouseup){
                if (mouseup === true && socketCount === 0){
                  socketCount++;
                  console.log('muoseut currentroom',currentRoom._id);
                  // drawToBeSaved.forEach(function(point){
                    Rooms.update({_id: currentRoom._id},{ $push : { DrawingObj : drawToBeSaved  }},  function(err, els){
                      // console.log('err',err, els);
                      console.log('err',err);
                    });
                  // })

                }
              })



      });
          }
        })

    });




 });

// function sendPreviousDrawing(){
//   // this.count;
//   return {
//     count : 0;,
//     getPrevious : function(){
//       if (this.count < 1 ){
//           console.log('firefire');
//           this.count++;
//       }else{
//         console.log('t cho');
//       }
//     }
//   }
// }

function createRoom(currentUrl){
  var newRoom = new Rooms({ name: currentUrl, DrawingObj:[] });
                                  newRoom.save(function (err) {
                                  console.log('saved');
                                  if (err) // ...
                                  console.log('err', err);
                                });
  return newRoom;
}

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

http.listen(3000, function(err){
  console.log('listening on *:3000 with ruben');
});