//Importing packages
var http = require('http');
var request = require('request');

function wikidataSearch(name) {
	
	result = requests.get('https://www.wikidata.org/w/api.php',params={
	'action':'wbsearchentities',
	'search':name,
	'language':'en',
	'format':'json'
	}).json()['search']
	if result==[]:
		print 'WARNING: No match found.'
	return result
}



//Main procedure
http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');
}).listen(1337, "127.0.0.1");
console.log('Server running at http://127.0.0.1:1337/');