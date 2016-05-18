//password and username are stored in the server which is not recommended. Store the user info in the database if possible
//the format of storing user and passwords as arrays are problematic too. if one user or passowrd was deleted accidently, the whole system will be ruined.
//store in fhe object format {users:{name:  , password:  }} seems better.
//recommend using passport.js to salt all the password that even the admin cannot view or edit user's passwords which
//helps tremendously with the security problem.

//the code is messy, everything is contained inside of app.get:action/user/password
//If I got enough time,I'd like to separate the functions as modules.

var users = [
	'Ashley',
	'Dave',
	'Jim',
	'Ralph',
	'Jessica',
	'Mary'
];

var passwords = [
	'1234',
	'password',
	'12345',
	'12345678',
	'test',
	'admin'
];

var express = require('express')
	,stylus = require('stylus')
	,nib = require('nib')
	,http = require('http');

var app = express();

function compile(str, path) {
	return stylus(str)
		.set('filename', path)
		.use(nib());
}

//setup db
var fs = require("fs");
var file = "test.db";
var exists = fs.existsSync(file);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);

//prevent concurenct users conflicts
db.serialize (function(){
	//the old db was creating new table everytime when server restarted
	if(!exists) {
	db.run("CREATE TABLE hours (user TEXT, monday INT default 0, tuesday INT default 0, wednesday INT default 0, thursday INT default 0, friday INT default 0, saturday INT default 0, sunday INT default 0)");
}
});

var server = http.createServer(app).listen(8080);

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(stylus.middleware({
	src: __dirname + '/public',
	compile: compile
}));
app.use(express.static(__dirname + '/public'));

var bodyParser = require('body-parser');
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: true }) );

app.get('/', function (req, res) {
	res.render('index');
});

GLOBAL.myHours = null;
app.get('/:action/:user/:password', function (req, res) {

	var passOk = false;
	users.forEach(function(user, index) {
		if(user == req.params.user && req.params.password == passwords[index]) {
			passOk = true;

		}
	});

	if(!passOk) {
		res.end('access denied');
		return;
	}

	switch(req.params.action) {
		case 'gethours':
			console.log('setting myHours to null');
			GLOBAL.myHours = null;

			db.get('select * from hours where user="' + req.params.user + '"', undefined, function(err, row) {
				console.log('query returned');

				if(row) {
					console.log('found record');
					GLOBAL.myHours = row;
				} else {
					console.log('inserting');
					db.run('insert into hours(user) values("' + req.params.user + '")');
					GLOBAL.myHours = {
						monday: 0,
						tuesday: 0,
						wednesday: 0,
						thursday: 0,
						friday: 0,
						saturday: 0,
						sunday: 0
					};
				}
			});

			var checkResult = function() {
				if(null == GLOBAL.myHours) {
					//2000 cause delay
					setTimeout(checkResult, 2000);
				} else {
					res.writeHead(200);
					res.end('<html><body><form action="/savehours/' + req.params.user + '/' + req.params.password + '" method="get">\
						Sunday: <input type="number" name="Sunday" max= 10 value="' + GLOBAL.myHours.sunday + '">\
						Monday: <input type="number" name="Monday" max=10 value="' + GLOBAL.myHours.monday + '">\
						Tuesday: <input type="number" name="Tuesday" max=10 value="' + GLOBAL.myHours.tuesday + '">\
						Wednesday: <input type="number" name="Wednesday" max=10 value="' + GLOBAL.myHours.wednesday + '">\
						Thursday: <input type="number" name="Thursday" max=10 value="' + GLOBAL.myHours.thursday + '">\
						Friday: <input type="number" name="Friday" max=10 value="' + GLOBAL.myHours.friday + '">\
						Saturday: <input type="number" name="Saturday" max=10 value="' + GLOBAL.myHours.saturday + '">\
						<input id="submit" type="submit">\
						</form></body></html>'
					);
				}
			}

			checkResult();

			break;
		case 'savehours':
		//query the url first to find the user and then update the db which caused the delay

	
			var url = require('url');
			var qs = url.parse(req.url, true).query;

			db.run('update hours set sunday=' + qs.Sunday + ', monday=' + qs.Monday + ', tuesday=' + qs.Tuesday + ', wednesday=' + qs.Wednesday + ', thursday=' + qs.Thursday + ', friday=' + qs.Friday + ', saturday=' + qs.Saturday + ' where user="' + req.params.user + '"');

			res.redirect(302, '/gethours/' + req.params.user + '/' + req.params.password );
			break;
		default:
			res.writeHead(200);
			res.end('invalid action');
			return;
	}
});
