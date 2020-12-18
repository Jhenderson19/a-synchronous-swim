const fs = require('fs');
const path = require('path');
const headers = require('./cors');
const multipart = require('./multipartUtils');

// Path for the background image ///////////////////////
module.exports.backgroundImageFile = path.join('.', 'background.jpg');
////////////////////////////////////////////////////////

let messageQueue = require('./messageQueue');

module.exports.initialize = (queue) => {
  messageQueue = queue;
};

module.exports.router = (req, res, next = ()=>{}) => {
  //console.log('Serving request type ' + req.method + ' for url ' + req.url);
  res.writeHead(200, headers);

  if (req.method === 'GET') {
    //some function that gets our type from url
    var trimURL = function(url) {
      return url.slice(url.indexOf('='));
    }
    var type = trimURL(req.url);

    if(type === 'direction') {
      var directionToSend = messageQueue.dequeue(); //get data to send
      if(directionToSend !== undefined) { //if data is not undefined
        res.write(directionToSend); // send it
      } else {                  //else
        res.write('nothing');  //do default thing
      }
    } else if (type === 'bgImage') {
      //get data to send - use FS to grab image
      fs.readFile(module.exports.backgroundImageFile, function(err, data) {
        //if data is undefined
        if(err) {
          //do default thing (404 ERROR: FILE NOT FOUND)
          res.writeHead(404);
        //else
        } else {
          // send it
          res.writeHead(200, {'Content-Type': 'image/jpeg'});
          res.write(data);
        }
      });
    }
  }

  res.end();
  next(); // invoke next() at the end of a request to help with testing!
};
