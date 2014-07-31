TFL Cycle Hire API
========================================

###What it Does

A node.js application that supports basic requests for the TFL cycle hire scheme, using the XML data provided by TFL. An asynchronous resquest is made every 3 minutes for the latest data, which is then cached.

Coordinates should be in WGS84 decimal form.

All distances calculated are 'as the crow flies'.

##Functionality

=============================================

####Nearest stations

`/nearest/bikes/?`

**Parameters**

`latitude`  
`longitude`   
`number` *optional* - number of stations, by default will return all stations.

e.g. `/nearest/stations/?latitude=51.535630782&longitude=-0.155715844&number=10`

**Returns array of TFL station ID's and distance away pairs**

---------------------------------------------

#####Nearest stations with *available* **docks**

`/nearest/bikes/?`

---------------------------------------------

#####Nearest stations with *available* **bikes**

`/nearest/docks/?`

=============================================

####Distance to nearest station

`/distance/station/?`

**Parameters**

`latitude`  
`longitude`   

e.g. `/distance/station/?latitude=51.535630782&longitude=-0.155715844`

**Returns distance in m (to nearest metre)**

---------------------------------------------

#####Distance to nearest *available* **bike**

`/distance/bike/?`

---------------------------------------------

#####Distance to nearest *available* **docks**

`/distance/dock/?`

=============================================


####Stations within ... metres

`/stations/within/?`

**Parameters**

`latitude`  
`longitude`   
`distance` - The search radius in m.

e.g. `/distance/station/?latitude=51.535630782&longitude=-0.155715844&distance=500`
	
**Returns array of TFL station ID's and distance away pairs**

---------------------------------------------

#####Stations with *available* **docks** within ... metres

`/bikes/within/?`

---------------------------------------------

#####Stations with *available* **bikes** within ... metres
	
`/stations/within/?`

=============================================

####Station with ID

`/station/?`

**Parameters**

`id` - Corresponding TFL station ID.  

e.g. `/station/?id=88`

**Returns TFL station object**

=============================================

####Bikes available for station.

`/station/bikes/?`

**Parameters**

`id` - Corresponding TFL station ID.  

e.g. `/station/bikes/?id=88`

**Returns number of avaiblable bikes**

---------------------------------------------

####Docks available for station.

`/station/docks/?`

**Parameters**

`id` - Corresponding TFL station ID.  

e.g. `/station/docks/?id=88`

**Returns number of avaiblable docks**


