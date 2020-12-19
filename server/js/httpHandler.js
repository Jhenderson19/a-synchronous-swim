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
  console.log('Serving request type ' + req.method + ' for url ' + req.url);

  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
    next(); // invoke next() at the end of a request to help with testing!
  };

  if (req.method === 'GET') {
    //some function that gets our type from url
    var trimURL = function(url) {
      return url.slice(url.indexOf('=') + 1);
    }
    var type = trimURL(req.url);

    if(type === 'direction') {
      res.writeHead(200, headers);
      var directionToSend = messageQueue.dequeue(); //get data to send
      if(directionToSend !== undefined) { //if data is not undefined
        res.write(directionToSend); // send it
      } else {                  //else
        res.write('nothing');  //do default thing
      }
      res.end();
      next(); // invoke next() at the end of a request to help with testing!


    } else if (type === 'bgImage') {
      //get data to send - use FS to grab image
      fs.readFile(module.exports.backgroundImageFile, function(err, data) {
        //if data is undefined
        if(err) {
          //do default thing (404 ERROR: FILE NOT FOUND)
          res.writeHead(404, headers);
          console.log(err)
        //else
        } else {
          // send it
          res.writeHead(200, {'Content-Type': 'image/jpg'});
          res.write(data);
        }
        res.end();
        next(); // invoke next() at the end of a request to help with testing!
      });
    }
  }

  if (req.method === 'POST') {
    // push user image to server and replace current image
    //fs.writeFile(module.exports.backgroundImageFile, )
    console.log("RECIEVED POST REQUEST");
    let imageBase64 = Buffer.alloc(0);
    // let imageBase =
    req.on('data', (chunk) => {
      imageBase64 = Buffer.concat([imageBase64, chunk]);
    }).on('end', () => {
      var image = multipart.getFile(imageBase64);
      //console.log(image)
      fs.writeFile(module.exports.backgroundImageFile, image.data, function(error) {
        res.writeHead(error ? 400 : 201, headers);
        res.end();
        next();
      });
    })
  }
};
