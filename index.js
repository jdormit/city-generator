var TWEET_INTERVAL_MINUTES = 30;

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

setInterval(main, TWEET_INTERVAL_MINUTES * 60 * 1000);

function main() {
	generateCityDescription(function(desc){
		client.post('statuses/update', {status: desc}, function(error, tweet, response) {
			if (error) throw error;
		});
	});
}

//streaming API for retweets
client.stream('statuses/filter', {track: 'imaginarycities,imaginarycity,cityscape,cityscapes'}, function(stream) {
	stream.on('data', function(tweet){
		if (!(tweet.user.id_str === '704696544176386000')) { //do not retweet my own tweets
			if (tweet.entities.media) { //only retweet pics
				var status = {
					status: 'A city imagined by @' + tweet.user.screen_name + '.\nhttp://twitter.com/' + tweet.user.id_str + "/status/" +
						tweet.id_str
				};
				client.post('statuses/update', status, function(error, tweet, response) {
					if (error) console.log(error);
				});
			}
		}
	});
});

function generateCityDescription(callback) {
	var str = "An error occurred.";
	var version = Math.floor((Math.random() * 7) + 1);
	var city = GenerateCity(function(city) {
		callback(makeDescription(city, version));
	});
}

function makeDescription(city, version) {
	var strlen = Number.MAX_VALUE;
	while (strlen >= 140) {
		switch(version) {
			case 1:
				str = "In " + city.adjective + " " + city.name + ", " + city.descriptor + ", " + city.clause + ".";
				break;
			case 2:
				clause = city.clause.charAt(0).toUpperCase() + city.clause.substr(1, city.clause.length);
				str = clause + " in " + city.name + ", the " + city.adjective + " " + city.descriptor + ".";
				break;
			case 3:
				str = "In the " + city.adjective + " city of " + city.name + ", " + city.clause + ".";
				break;
			case 4:
				str = city.name + " is the " + city.descriptor + ".";
				break;
			case 5:
				str = "In " + city.name + ", " + city.clause + ".";
				break;
			case 6:
				str = city.name + " is the " + city.adjective + " " + city.descriptor + ".";
				break;
			case 7:
				str = "In " + city.adjective + " " + city.name + ", " + city.clause + ".";
		}
		str += "\n #imaginarycities #invisiblecities"
		strlen = str.length;
		version = Math.floor((Math.random() * 7) + 1);
	}
	return str;
}

function GenerateCity(callback) {
	var city = {};
	city.name = chance.city();
	
	generateDescriptor(function(descriptor) {
		city.descriptor = descriptor;
		generateAdjective(function(adjective) {
			city.adjective = adjective;
			generateClause(function(clause){
				city.clause = clause;
				callback(city);
			});
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
	var numNouns = Math.floor((Math.random() * 2) + 1);
	var numVerbs = Math.floor((Math.random() * 2) + 1);
	Wordnik.getCommonNoun(true, function(noun1) {
		Wordnik.getVerb(function(verb1) {
			if (numVerbs > 1) {
				Wordnik.getVerb(function(verb2) {
					if (numNouns > 1) {
						Wordnik.getCommonNoun(true, function(noun2) {
							callback(noun1 + " " + verb1 + " and " + noun2 + " " + verb2);
						});
					}
					else {
						callback(noun1 + " " + verb1 + " and " + verb2);
					}
				});
			}
			else {
				if (numNouns > 1) {
					Wordnik.getCommonNoun(true, function(noun2) {
						callback(noun1 + " and " + noun2 + " " + verb1);
					});
				}
				else {
					callback(noun1 + " " + verb1);
				}
			}
		});
	});
}

console.log("running CityGenerator");