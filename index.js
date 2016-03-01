var Twitter = require('twitter');
var RestClient = require('node-rest-client').Client;
var Chance = require('chance');
var	pluralize = require('pluralize');

var client = new Twitter({
  consumer_key: 'XIuxju45DPPRjGslLXQAD5vbE',
  consumer_secret: 'vuMKzHfWVQi9g3N7eDj5MyMNkWX7DIEaDbvxjb3RmAZzTDDjdm',
  access_token_key: '704696544176386048-yiCgMV9GLXuDNlSuwoHLXBIGvtQCyNj',
  access_token_secret: 'PNlsr2iklnfvTFLplkUssDKnlU9uIsxEH7iuIHVPDDenD'
});

var restClient = new RestClient();

var chance = new Chance();

function generateCityDescription() {
	var city = GenerateCity(function(city) {
		console.log(city);
	});
}

var Wordnik = {
	getCommonNoun : function(plural, callback) {
		restClient.get("http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=true&includePartOfSpeech=noun&excludePartOfSpeech=proper-noun&minCorpusCount=400&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=-1&maxLength=-1&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5",
			function(data, response) {
				var noun = data.word;
				if (plural) noun = pluralize(data.word, 2);
				else noun = pluralize(data.word, 1);
				callback(noun);
		});
	},
	getAdjective : function(callback) {
		restClient.get("http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=true&includePartOfSpeech=adjective&minCorpusCount=400&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=-1&maxLength=-1&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5",
			function(data, response) {
				callback(data.word);	
		});
	},
	getVerb : function(callback) {
		restClient.get("http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=false&includePartOfSpeech=verb-transitive&minCorpusCount=-1&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=-1&maxLength=-1&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5",
			function(data, response) {
				callback(data.word);
		});
	}
};

function GenerateCity(callback) {
	var city = {};
	city.name = chance.city();
	
	generateDescriptor(function(descriptor) {
		city.descriptor = descriptor;
		generateAdjective(function(adjective) {
			city.adjective = adjective;
			callback(city);
		});
	});
};

function generateDescriptor(callback) {
	var numNouns = Math.floor((Math.random() * 2) + 1);
	Wordnik.getCommonNoun(true, function(noun1) {
		if (numNouns > 1) {
			Wordnik.getCommonNoun(true, function(noun2) {
				callback("city of " + noun1 + " and " + noun2);
			});
		}
		else {
			callback("city of " + noun1);
		}
	});
}

function generateAdjective(callback) {
	Wordnik.getAdjective(function(adjective){
		callback(adjective);
	});
}

function generateClause(callback) {
	
}


setInterval(generateCityDescription, 1000);

/*
City descriptions should be generated in the format "In the <adjective> city of <name>, <clause>", "<clause> in the the <adjective> city of <name>, or <name> a city of <description>"
A clause looks like "<adjective><noun><verb><adjective><noun>"

a city has a descriptor ("city of <blank> and <blank>"), an adjective, and a clause
*/