var express = require('express');
var app = express();
var mongoose = require('mongoose');
var base58 = require('./base58.js');

var Url = require('./url');

var url = process.env.MONGOLAB_URI;
mongoose.Promise = global.Promise;
mongoose.connect(url);
mongoose.connection.collection('counter').insert({ _id: 'url_count', seq: 1 });

app.get('/', function (req, res) {
  res.send('Hello World!')
});

app.get('/new/*', function(req, res){
  var longUrl = req.params[0];
  console.log(longUrl);
  var shortUrl = '';
  Url.findOne({long_url: longUrl}, function (err, doc){
    if (err){ console.log(err); };  
    if (doc){
      shortUrl = req.headers.host  + "/" + base58.encode(doc._id);
      res.send({'shortUrl': shortUrl});
    } else {
      var newUrl = Url({
        long_url: longUrl
      });
      newUrl.save(function(err) {
        if (err){
          console.log(err);
        }
        shortUrl = req.headers.host + "/" + base58.encode(newUrl._id);
        res.send({'shortUrl': shortUrl});
      });
    }
  });
});

app.get('/:encoded_id', function(req, res){
  var base58Id = req.params.encoded_id;
  var id = base58.decode(base58Id);
  Url.findOne({_id: id}, function (err, doc){
    if (err){};    
    if (doc) {
      res.redirect(doc.long_url);
    } else {
      res.redirect(req.headers.host);
    }
  });
});

app.listen(process.env.PORT || 8080, function () {
  console.log('Example app listening on port 8080!')
});
