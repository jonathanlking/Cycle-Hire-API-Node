var http = require('http');
var request = require('request');
var fileStream = require('fs');
var parseString = require('xml2js').parseString;

var error = 400;

function degreesToRadians(degrees)
{
	return degrees * (Math.PI / 180)
}

/*----------Start the server----------*/

var express = require('express');
var app = express();

var server = app.listen(3000, function()
{
	console.log('Server running.');
	console.log('Listening on port %d', server.address().port);
	// Start the XML caching process and set it to be refreshed a minutes time
	cacheXML();
});

/*----------Endpoints----------*/

// Show link to Github project on landing page
app.get('/', function(request, responce)
{
	formattedLastRefreshDate (function(formattedDate){
		responce.send('Please use a supported endpoint. </br></br> Documentation can be found on the <a href="http://github.com/jonathanlking/Cycle-Hire-API">Github page</a>. </br></br>'+'Live data from TFL last refreshed: ' + formattedDate);	
	});
	
});

app.get('/json', function(request, responce)
{
	cycleData(function(data)
	{
		responce.contentType('application/json');
		responce.send(JSON.stringify(data));
	});
});
app.get('/nearest/stations', function(request, responce)
{

	var latitude = request.param("latitude");
	var longitude = request.param("longitude");
	var number = request.param("number");

	if (!latitude || !longitude) responce.send(error);

	else
	{
		nearestStations(latitude, longitude, function(stations)
		{
			responce.contentType('application/json');
			responce.send(stations);
		}, number);
	}

});
app.get('/nearest/bikes', function(request, responce)
{

	var latitude = request.param("latitude");
	var longitude = request.param("longitude");
	var number = request.param("number");

	if (!latitude || !longitude) responce.send(error);

	else
	{
		nearestStationsWithAvailableBikes(latitude, longitude, function(stations)
		{
			responce.contentType('application/json');
			responce.send(stations);
		}, number);
	}

});
app.get('/nearest/docks', function(request, responce)
{

	var latitude = request.param("latitude");
	var longitude = request.param("longitude");
	var number = request.param("number");

	if (!latitude || !longitude) responce.send(error);

	else
	{
		nearestStationsWithAvailableDocks(latitude, longitude, function(stations)
		{
			responce.contentType('application/json');
			responce.send(stations);
		}, number);
	}
});

app.get('/stations/within', function(request, responce)
{

	var latitude = request.param("latitude");
	var longitude = request.param("longitude");
	var distance = request.param("distance");

	if (!latitude || !longitude || !distance) responce.send(error);

	else
	{
		stationsWithinDistance(latitude, longitude, distance, function(stations)
		{
			responce.contentType('application/json');
			responce.send(stations);
		});
	}
});
app.get('/bikes/within', function(request, responce)
{

	var latitude = request.param("latitude");
	var longitude = request.param("longitude");
	var distance = request.param("distance");

	if (!latitude || !longitude || !distance) responce.send(error);

	else
	{
		stationsWithinDistanceWithAvailableBikes(latitude, longitude, distance, function(stations)
		{
			responce.contentType('application/json');
			responce.send(stations);
		});
	}
});
app.get('/docks/within', function(request, responce)
{

	var latitude = request.param("latitude");
	var longitude = request.param("longitude");
	var distance = request.param("distance");

	if (!latitude || !longitude || !distance) responce.send(error);

	else
	{
		stationsWithinDistanceWithAvailableDocks(latitude, longitude, distance, function(stations)
		{
			responce.contentType('application/json');
			responce.send(stations);
		});
	}
});

app.get('/station', function(request, responce)
{

	var stationId = request.param("id");
	if (!stationId) responce.send(error);

	else
	{
		stationForId(stationId, function(station)
		{
			responce.contentType('application/json');
			if (station) responce.send(station);
			// In case no station exists for that Id
			else responce.send(error);
		});
	}
});


/*----------Main Functions----------*/

function nearestStations(latitude, longitude, callback, number)
{
	cycleData(function(data)
	{
		var distanceArray = [];

		for (var i = 0; i < data.stations.length; i++)
		{
			// Iterate through all the stations
			var station = data.stations[i];
			station.distance = distanceFromStation(latitude, longitude, station);
			distanceArray.push(station);
		}

		var sorted = distanceArray.sort(compareDistancesOfStations);
		if (number) callback(sorted.slice(0, number));
		else callback(sorted);

	});
}

function nearestStationsWithAvailableBikes(latitude, longitude, callback, number)
{
	cycleData(function(data)
	{
		var distanceArray = [];

		for (var i = 0; i < data.stations.length; i++)
		{
			// Iterate through all the stations
			var station = data.stations[i];

			// Ignore this station and move onto the next
			if (station.nbBikes <= 0 || station.locked) continue;
			
			station.distance = distanceFromStation(latitude, longitude, station);
			distanceArray.push(station);
		}

		var sorted = distanceArray.sort(compareDistancesOfStations);
		if (number) callback(sorted.slice(0, number));
		else callback(sorted);

	});
}

function nearestStationsWithAvailableDocks(latitude, longitude, callback, number)
{
	cycleData(function(data)
	{
		var distanceArray = [];

		for (var i = 0; i < data.stations.length; i++)
		{
			// Iterate through all the stations
			var station = data.stations[i];

			// Ignore this station and move onto the next
			if (station.nbEmptyDocks <= 0) continue;
			
			station.distance = distanceFromStation(latitude, longitude, station);
			distanceArray.push(station);
		}

		var sorted = distanceArray.sort(compareDistancesOfStations);
		if (number) callback(sorted.slice(0, number));
		else callback(sorted);

	});
}

function stationsWithinDistance(latitude, longitude, metres, callback, filterFunction)
{
	// The callback receives an ordered array (in increasing distance) of station objects
	if (!filterFunction) filterFunction = nearestStations;

	filterFunction(latitude, longitude, function(stations)
	{
		var abort = false;
		for (var i = 0; i < stations.length && !abort; i++)
		{
			var distance = stations[i]['distance'];

			if (distance > metres)
			{
				abort = true;
				callback(stations.slice(0, i));
			}
		}
	});
}

function stationsWithinDistanceWithAvailableBikes(latitude, longitude, metres, callback)
{
	stationsWithinDistance(latitude, longitude, metres, callback, nearestStationsWithAvailableBikes);
}

function stationsWithinDistanceWithAvailableDocks(latitude, longitude, metres, callback)
{
	stationsWithinDistance(latitude, longitude, metres, callback, nearestStationsWithAvailableDocks);
}


/*----------Helper Functions----------*/

function formattedLastRefreshDate (callback) {
	
	cycleData(function(data) {
		
		var epoch = data.lastUpdate;
		var date = new Date(parseInt(epoch));
		callback(date.toUTCString());
	});
}


function distanceFromStation(latitude, longitude, station)
{
	// Takes station object
	return distanceBetweenCoordinates(latitude, longitude, station.lat, station.long);
}

function stationForId(id, callback)
{
	// The callack takes the returned station objects id as its single parameter
	cycleData(function(data)
	{
		var stations = data.stations;
		var count = 0;
		stations.every(function(station) 
		{
			count ++;
			if (station.id == id) 
			{
				callback(station);
				return false;	
			}
			else if (count == stations.length) callback(null);
			else return true;
		});
	});
}

function compareDistancesOfStations(a, b)
{
	if (a.distance < b.distance) return -1;
	if (a.distance > b.distance) return 1;
	return 0;
}

function distanceBetweenCoordinates(latitude_1, longitude_1, latitude_2, longitude_2)
{
	var radius = 6371000; // *mean* radius of the earth in metres
	var deltaLatitude = degreesToRadians(latitude_2 - latitude_1);
	var deltaLongitude = degreesToRadians(longitude_2 - longitude_1);

	// Using the Haversine formula
	var a = Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) + Math.cos(degreesToRadians(latitude_1)) * Math.cos(degreesToRadians(latitude_2)) * Math.sin(deltaLongitude / 2) * Math.sin(deltaLongitude / 2)
	var b = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return Math.round(radius * b); // Distance in metres, rounded to the nearest metre
}

/*----------Core Functions----------*/

// To save loading from file every time, we load into this variable.
var loadedData;

function cycleData(callback)
{
	if (loadedData)
	{
		callback(loadedData);
	}
	else
	{
		// Load from file
		fileStream.readFile('cache.xml', 'utf8', function(error, file)
		{
			if (error) console.log(error);
			else
			{
				// Read the cached data, convert it to json and return it.
				parseString(file, function(error, result)
				{
					loadedData = result;
					
					// The array of 'raw' stations
					var _stations = result.stations.station;
					// The array of formatted stations
					var stations = [];
					for (var i = 0; i < _stations.length; i++)
					{
						// The unformatted station
						var _station = _stations[i];
						// The formatted station
						var station = new Object();
						
						station.id = parseInt(_station.id[0])
						station.name = _station.name[0];
						station.terminalName = parseInt(_station.terminalName[0]);
						station.lat = parseFloat(_station.lat[0]);
						station.long = parseFloat(_station.long[0]);
						station.installed = _station.installed[0] == 'true' ? true : false;
						station.locked = _station.locked[0] == 'true' ? true : false;
						station.installDate = parseInt(_station.installDate[0]);
						station.temporary = _station.temporary[0] == 'true' ? true : false;
						station.nbBikes = parseInt(_station.nbBikes[0]);
						station.nbEmptyDocks = parseInt(_station.nbEmptyDocks[0]);
						station.nbDocks = parseInt(_station.nbDocks[0]);
						
						// Add the formatted station to the array of stations
						stations.push(station);
					}
					
					var lastUpdate = parseInt(result.stations.$.lastUpdate);
					var loadedData = {lastUpdate : lastUpdate, stations : stations};
					callback(loadedData);
				});
			}
		});
	}
}

function cacheXML()
{
	// Download the data from TFL every 3 minutes and save to file
	request('http://www.tfl.gov.uk/tfl/syndication/feeds/cycle-hire/livecyclehireupdates.xml', function(error, response, body)
	{
		if (!error && response.statusCode == 200)
		{
			console.log("File downloaded.");

			// Cache the data to file
			fileStream.writeFile('cache.xml', body, function(error)
			{
				if (error) console.log(error);
				else console.log("File cached.");
				loadedData = null;
			});

		}
	});
	
	// Run again in a minutes time
	setTimeout(cacheXML, 1000 * 1 * 60);
}