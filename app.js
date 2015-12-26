var express = require('express');
var app = express();
var util = require('util');

var http = require("http");
var fs = require("fs");
var dbname = __dirname + '/public/' + 'mydb.db';

app.get('/', function(req, res, next) {

    var options = {
        root: __dirname + '/public/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    var fileName = 'index.html';
    res.sendFile(fileName, options, function(err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        } else {
            var sqlite3 = require('sqlite3').verbose();
            var db = new sqlite3.Database(__dirname + '/public/' + 'mydb.db');
            db.serialize(function() {

                db.run("CREATE TABLE if not exists request_info (id integer PRIMARY KEY autoincrement, ip TEXT, headers TEXT, remoteAddress TEXT)");
                var stmt = db.prepare("INSERT INTO request_info (ip,headers,remoteAddress) VALUES (?,?,?)");
                stmt.run(util.inspect(getClientAddress(req)), util.inspect(req.headers), util.inspect(req.connection.remoteAddress));
                stmt.finalize();
                console.log('insert');
            });
            db.close();
        }
    });
    var getClientAddress = function (req) {
        return (req.headers['x-forwarded-for'] || '').split(',')[0] 
            || req.connection.remoteAddress;
    };
});

app.get('/db', function(req, res, next) {
    var stat = fs.statSync(dbname);
    res.writeHeader(200,{"Content-Length":stat.size,'Content-disposition':'attachment; filename=' + 'mydb.db'});
    var fReadStream = fs.createReadStream(dbname);
    fReadStream.pipe(res);
});

app.get('/ip', function(req, res, next) {
    var ipPac = [];
    var index = 0;
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database(__dirname + '/public/' + 'mydb.db');
    db.serialize(function() {
        db.each("SELECT * FROM request_info", function(err, row) {
            // console.log(row);
            ipPac[index] = {};
            ipPac[index]['ip'] = row.ip;
            ipPac[index]['headers'] = row.headers;
            ipPac[index]['remoteAddress'] = row.remoteAddress;
            index++;
            res.write(util.inspect(ipPac));
        },function (){
          res.end();
        });
    });
    db.close();
});

app.use(express.static('public'));

var server = app.listen(80, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});
