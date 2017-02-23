var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var crypto = require('crypto');
var filename;


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    filename = file.name;
    fs.rename(file.path, path.join(form.uploadDir, file.name));
    var fd = fs.createReadStream(path.join(__dirname, '/uploads/'+filename));
    var hash = crypto.createHash('md5');
    hash.setEncoding('hex');

    fd.on('end', function() {
      hash.end();
      var hashValueGenerated = hash.read();
      fs.writeFileSync(path.join(__dirname, '/hashfiles/'+hashValueGenerated+'.json'), hashValueGenerated  , 'utf-8'); 
      console.log(hashValueGenerated );
    });

    // read all file and pipe it (write it) to the hash object
    fd.pipe(hash);

  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);


});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});


