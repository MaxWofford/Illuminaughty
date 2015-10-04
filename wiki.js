// How to use
//
// $ node
// > var w = require('./wiki');
// > w.getWiki({titles: "Illuminati", prop: "links", pllimit: "400", plnamespace: "0"}, w.printJSON);
// > w.getLinks("Illuminati", console.log);
// (do some editing in wiki.js)
// > var w = w.reload('./wiki');

var request = require('request');
var $ = require('./tools');

function getWiki(ob, f){
	var o = $.app(ob, {action: 'query', format: 'json', redirects: 'true'});
	request({url: 'https://en.wikipedia.org/w/api.php', qs: o}, function (err, resp, body){
		if (err){console.log(err); return;}
		var bd = JSON.parse(body);
		// printJSON(bd);
		if (!$.ohas(bd, "query") || ($.ohas(bd.query.pages, "-1") && $.ohas(bd.query.pages["-1"], "missing"))){f(null); return;}
		f(bd);
	});
}

function getCategories(title, f){
	getWiki({titles: title, prop: "categories"}, function (bd){
		if (bd === null){f(null); return;}
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

// ex: w.getLinks("Illuminati", w.printJSON);
function getLinks(title, f){
	getWiki({titles: title, prop: "links", pllimit: "400", plnamespace: "0"}, function (bd){
		if (bd === null){f(null); return;}
		f($.map(valer("title"), $.oval(bd.query.pages)[0].links));
	});
}

function getNLinksHere(n, title, f){
	getWiki({titles: title, prop: "linkshere", lhlimit: $.str(n), lhnamespace: "0"}, function (bd){
		if (bd === null){f(null); return;}
		f($.map(valer("title"), $.oval(bd.query.pages)[0].linkshere));
	});
}

function getContent(title, f){
	getWiki({titles: title, prop: "revisions", rvprop: "content"}, function (bd){
		if (bd === null){f(null); return;}
		f($.oval(bd.query.pages)[0].revisions[0]["*"]);
	});
}

function getSomeHTML(title, f){
	getWiki({titles: title, prop: "revisions", rvprop: "content", rvparse: "", rvsection: "0"}, function (bd){
		if (bd === null){f(null); return;}
		f($.oval(bd.query.pages)[0].revisions[0]["*"]);
	});
}

function getFirstImage(title, f){
	getSomeHTML(title, function (cont){
		if (cont === null){f(null); return;}
		var c = $.cap(/<img[^>]+src=\"([^\"]+)\"[^>]*>/, cont);
		if (c === null){f(null); return;}
		f("https:" + c);
	});
}

function getImage(title, f){
	getWiki({titles: title, prop: "pageimages"}, function (bd){
		if (bd === null){f(null); return;}
		var imtitle = "File:" + $.oval(bd.query.pages)[0].pageimage;
		console.log("imtitle: " + imtitle);
		getWiki({titles: imtitle, prop: "imageinfo", iiprop: "url"}, function (bd){
			printJSON(bd);
			f($.oval(bd.query.pages)[0].imageinfo[0].url);
		});
	});
}

function printJSON(a){
	return console.log(JSON.stringify(a, null, 2));
}

// ex: var w = w.reload("./wiki");
function reload(a){
	delete require.cache[require.resolve(a)];
	return require(a);
}

module.exports = {
	getWiki: getWiki,
	printJSON: printJSON,
	getCategories: getCategories,
	getLinks: getLinks,
	getNLinksHere: getNLinksHere,
	getContent: getContent,
	getSomeHTML: getSomeHTML,
	getFirstImage: getFirstImage,
	getImage: getImage,
	reload: reload
};
