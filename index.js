var Twitter = require('twitter');
var RestClient = require('node-rest-client').Client;
var Chance = require('chance');

var client = new Twitter({
  consumer_key: 'XIuxju45DPPRjGslLXQAD5vbE',
  consumer_secret: 'vuMKzHfWVQi9g3N7eDj5MyMNkWX7DIEaDbvxjb3RmAZzTDDjdm',
  access_token_key: '704696544176386048-yiCgMV9GLXuDNlSuwoHLXBIGvtQCyNj',
  access_token_secret: 'PNlsr2iklnfvTFLplkUssDKnlU9uIsxEH7iuIHVPDDenD'
});

var restClient = new RestClient();

var chance = new Chance();

function generateCityDescription() {
	var desc = "";
	var name = chance.city();
	
	console.log(desc);
	return desc;
}

//setInterval(generateCityDescription, 1000);

/*
City descriptions should be generated in the format "In the <adjective> city of <name>, <clause>", "<clause> in the the <adjective> city of <name>, or <name> a city of <description>"
A clause looks like "<adjective><noun><verb><adjective><noun>"
*/