# Retail_business_intelligence

# Wine-Flask-1.0
A price comparison dashboard for a wine retail business 

## Installation Steps:
### Setting up the data
* Open MySQL and select "Data Import/Restore" located under the Server tab
* select "Import from Self-Contained File"
* choose path for the file located in "Wine+Flask1.0/Data" labeled "wineflaskdata.sql"

### Setting up the Keys
There are several Keys being used for various different plugins
* open config.py located in Wine+Flask1.0 folder
  - dbpassword: MySql server password (and database name from above step if named differently than "wineflaskdata")
  - gkey: Google API key, that is authorized to use Distance Matrix API
* open app.js located in Wine+Flask_1.0/Wine+Flask_App/static/js \n
  - API_KEY: Mapbox(Leaflet) key 
  
### Chromedriver
Make sure chromedriver setting is set according to your computer
* open scrape.py located in Wine+Flask1.0 folder
* set path for chromedriver on line 17 of scrape.py

# Wine-Flask2.0
An interactive tableau dashboard to perform basket anlaysis