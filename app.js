var express = require('express');
var app = express();
var util = require('util');

var http = require("http");
var fs = require("fs");
var dbname = __dirname + '/public/' + 'mydb.db';

app.use(express.static('public'));

var port = process.argv[2]?process.argv[2]:8080;

var server = app.listen(port, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('App listening at http://%s:%s', host, port);
});

app.get('/', function(req, res, next) {
    console.log('sendFile');
    var options = {
        root: __dirname + '/public/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    var fileName = 'main.html';
    res.sendFile(fileName, options, function(err) {
        if (err) {
            console.log("sendIle err! it is ",err);
            console.log("err.code ", err.code);
            console.log("res.statusCode ", res.statusCode);
            if (err.code === "ECONNABORTED" && (res.statusCode === 304 || res.statusCode == 200)) {
                // No problem, 304 means client cache hit, so no data sent.
                console.log('304 cache hit for ' + fileName);
                return;
            }
            // res.status(err.status).end();
        } else {
            console.log('start insert');
            var sqlite3 = require('sqlite3').verbose();
            var db = new sqlite3.Database(__dirname + '/public/' + 'mydb.db');            
            var now = getTime();
            try {
                db.serialize(function() {
                    db.run("CREATE TABLE if not exists request_headers (id integer PRIMARY KEY autoincrement, time TEXT , ip TEXT, remoteAddress TEXT,host TEXT , headers TEXT)");
                    var stmt = db.prepare("INSERT INTO request_headers (time, ip, remoteAddress, host, headers)VALUES (?,?,?,?,?)");
                    stmt.run(util.inspect(now), util.inspect(getClientAddress(req)), util.inspect(req.connection.remoteAddress), util.inspect(req.headers.host), util.inspect(req.headers));
                    stmt.finalize();
                    console.log('insert \t' + util.inspect(Date()));
                });
            }
            catch (err){
                console.log('db insert err, the err is  ' + err);
            }
            db.close();
        }
    });
    var getClientAddress = function(req) {
        return (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
    };
});

app.get('/db', function(req, res, next) {
    var stat = fs.statSync(dbname);
    res.writeHeader(200, {
        "Content-Length": stat.size,
        'Content-disposition': 'attachment; filename=' + 'mydb.db'
    });
    var fReadStream = fs.createReadStream(dbname);
    fReadStream.pipe(res);
});

app.get('/ipData', function(req, res, next) {
    var ipPac = {
        'rows': []
    };
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database(__dirname + '/public/' + 'mydb.db');
    var query = require('url').parse(req.url,true).query;
    // res.setHeader('Content-Type', 'application/json');
    try {
        db.serialize(function() {
            // console.log("query.limit ", query.limit);
            // console.log("query.page ", query.page);
            db.each("SELECT * FROM request_headers order by id desc limit "+ query.limit + " offset " + query.page, function(err, row) {
                // console.log("row ", row);
                ipPac.rows.unshift(row);
            }, function() {
                // console.log(ipPac);
                res.write(JSON.stringify(ipPac));
                res.end();
            });
            console.log('select \t' + util.inspect(Date()));
        });
    }
    catch (err){
        console.log('db select err, the err is  ' + err);
    }
    db.close();
});

function getTime() {
    var d = new Date();
    return formatZero(d.getHours()) + ':' + formatZero(d.getMinutes()) + ':' + formatZero(d.getSeconds()) + ' '
             + formatZero(d.getFullYear()) + '/' + formatZero(d.getMonth() + 1) + '/' + formatZero(d.getDate());

    function formatZero(number){
        return number < 10 ? '0' + number : number;
    }
}
