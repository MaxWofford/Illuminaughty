var request = require('request');
var $ = require('./tools');

function getWiki(ob, f){
	var o = $.app(ob, {action: 'query', format: 'json'});
	request({url: 'https://en.wikipedia.org/w/api.php', qs: o}, function (err, resp, body){
		if (err){ console.log(err); return;}
		f(JSON.parse(body));
	});
}

function getCategories(title, f){
	getWiki({titles: title, prop: "categories"}, function (bd){
		var pages = bd.query.pages;
		var categs = $.oval(pages)[0].categories;
		f($.map(function (o){return $.sli(o.title, 9);}, categs));
	});
}

function slier(n, m){
	return function (a){return $.sli(a, n, m);};
}

function valer(x){
	return function (a){return a[x];};
}

function getLinks(title, f){
	getWiki({titles: title, prop: "links"}, function (bd){
		f($.map(valer("links"), $.oval(bd.query.pages)[0].links));
	});
}

function printJSON(a){
	return console.log(JSON.stringify(a, null, 2));
}

function reload(a){
	delete require.cache[require.resolve(a)];
	return require(a);
}

module.exports = {
	getWiki: getWiki,
	printJSON: printJSON,
	getCategories: getCategories,
	getLinks: getLinks,
	reload: reload
};
