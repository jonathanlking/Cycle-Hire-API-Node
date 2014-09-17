TFL Cycle Hire API
==================

A node.js application that supports basic requests for the TFL cycle hire scheme, using the XML data provided by TFL. An asynchronous request is made every minute for the latest data, which is then cached.

Coordinates should be given in WGS84 decimal form.

All dates are milliseconds elapsed since 01 Jan 1970 (Unix Epoch time stamp).

All distances calculated are 'as the crow flies' and are in m (to nearest metre).

All data returned has a JSON content type.

##Station Object

**The station object has the following structure, which is the same as used by TFL in their API. Their complete documentation is included and called "bch-feed-data-dictionary.pdf".**

`distance` *optional* - The stations distance from the provided coordinates. This is only set where coordinates are provided in the function called.

`id` - This number is the unique identifier for each bike station record corresponding to the unique ID in the database. Does not change.

`name` - Text description of the bike stations as displayed on the map to the bike user.

`terminalName` - This is name associated with the physical terminal which corresponds to the logical terminal name in the Service Provider’s bike management system.

`lat` - Latitude of the location of the bike station.

`long` - Longitude of the location of the bike station.

`installed` - Text description specifying whether the bike station is available for usage.  
**True** – bike station is installed  **False** – bike station has not yet been installed or has recently been removed.

`locked` - Text description specifying whether the bike station is currently locked or not. A locked station will allow a bike user to return a bike but not rent one from this station.  
**True** – bike station is locked  
**False** – bike station is not locked

`installDate` - The time at which the terminal and other equipment was installed at that bike station. Used when the station is announced but not yet installed. Field can be empty.

`removalDate` - The time at which the terminal and other equipment will be removed. Field can be empty if no removal is planned.

`temporary` - Text description specifying whether or not a bike station is a temporary installation. Usually installed for a special event and removed after a short period of time.

`nbBikes` - Total number of available bikes at a docking station, excluding any locked/faulty bikes that cannot be rented.

`nbEmptyDocks` - Total number of available docking points at a docking station. A bike dock is empty when no bike is docked in it. It excludes any defective bike docks, i.e. those that do not allow a bike to be docked in.

`nbDocks` - Total number of docking points at a docking station.


##Functionality

####JSON

`/json/`

	- lastUpdate (timestamp)
	- stations[] (array of station objects)

**Returns the TFL data in a JSON format**

---------------------------------------------

####Nearest stations

`/nearest/bikes/?`

**Parameters**

`latitude`  
`longitude`   
`number` *optional* - number of stations, by default will return all stations.

e.g. `/nearest/stations/?latitude=51.535630782&longitude=-0.155715844&number=10`

**Returns array of station objects**

#####Nearest stations with *available* **docks**

`/nearest/bikes/?`

#####Nearest stations with *available* **bikes**

`/nearest/docks/?`

---------------------------------------------

####Stations within ... metres

`/stations/within/?`

**Parameters**

`latitude`  
`longitude`   
`distance` - The search radius in m.

e.g. `/stations/within/?latitude=51.535630782&longitude=-0.155715844&distance=500`
	
**Returns array of station objects**

#####Stations with *available* **docks** within ... metres

`/bikes/within/?`

#####Stations with *available* **bikes** within ... metres
	
`/docks/within/?`

---------------------------------------------

####Station with ID

`/station/?`

**Parameters**

`id` - Corresponding TFL station ID.  

e.g. `/station/?id=88`

**Returns station object**

---------------------------------------------



