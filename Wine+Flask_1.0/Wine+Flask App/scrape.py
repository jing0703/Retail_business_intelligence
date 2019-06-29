from splinter import Browser
from bs4 import BeautifulSoup
import pandas as pd
import requests
import json
import sqlite3
import os.path

from config import gkey
base1 = "https://maps.googleapis.com/maps/api/geocode/json?"
base2 = "https://maps.googleapis.com/maps/api/distancematrix/json?"

origin = "300 atrium drive somerset nj"
    

def scrape(searchname):
    executable_path = {"executable_path": "/usr/local/bin/chromedriver"}
    browser = Browser("chrome", **executable_path, headless=False)

    listings = []
    ws_itemobject={}

    converted_name = searchname.replace(" ","+")
    url = f"https://www.wine-searcher.com/find/{converted_name}/1/usa-nj"
    browser.visit(url)
    html=browser.html
    soup = BeautifulSoup(html,'lxml')
    try:
        store_result = soup.find("div", {"id": "wine-select-find"})
        stores = store_result.find_all('tr', class_='wlrwdt ')
        store_name = []
        wine_price = []
        store_location = []
        lat_long=[]
        distance=[]
        for store in stores:
            name = store.find('span', itemprop="name").text
            price = "$ " + store.find('span', class_='offer_price ')['content']
            unit = store.find('span', class_='offer_btl').text
            location = store.find_all('span', itemprop="addressRegion")[1].text + ", NJ"

            latlongsearch = name+" "+location
            CoordParam = {"address": latlongsearch, "key": gkey}
            response = requests.get(base1, params=CoordParam).json()
            lat_long.append([response["results"][0]["geometry"]["location"]["lat"],response["results"][0]["geometry"]["location"]["lng"]])

            param2 = {"origins": origin, "key": gkey, "destinations":latlongsearch, "units":"imperial"}
            response2 = requests.get(base2, params=param2).json()
            distance.append(response2["rows"][0]["elements"][0]["distance"]["text"])
            
            store_name.append(name)
            wine_price.append(price+" /"+unit)
            store_location.append(location)
        store_info = dict(zip(store_location, zip(store_name, wine_price, lat_long, distance)))
        ws_itemobject['store_info']= store_info

        wine_result = soup.find('div',class_='wine-info-panel')
        ave_price = wine_result.find('b').text.replace('\n','')
        try: critic_score =  wine_result.find('span', itemprop="ratingValue").text
        except: critic_score = "Score Not Available"
        try:
            user_rating = wine_result.find_all('span', class_="dtlbl sidepanel-text")[2].find('b').text
            user_rating = user_rating.split()
            rating = user_rating[0]
        except:
            rating = "NA"
        region =  wine_result.find_all('span',class_="dtlbl sidepanel-text")[-2].find_all('a')[0].text
        country_list = wine_result.find_all('span',class_="dtlbl sidepanel-text")[-2].find_all('a')
        country_Hierarchy = []
        for i in range(1,len(country_list)):
            country = country_list[i].text.replace('\n','')
            country_Hierarchy.append(country)
        grape = wine_result.find_all('span',class_="dtlbl sidepanel-text")[-1].text.replace('\n','')
        grape = grape.split()[1]
        style = wine_result.find_all('a',title="View Wine Style")[0].text
        food = wine_result.find_all('div',class_="dtlbl sidepanel-text")[0].find('a',title="View Food Category").text
        try: alcohol = wine_result.find_all('div',class_="dtlbl sidepanel-text")[2].find('b').text
        except: alcohol = "NA"
        try:
            producer = wine_result.find('a',title="View producer details").text 
        except:
            producer = wine_result.find('a',title= "View producer's profile").text
        wine_info = {
                    'Name':searchname,
                    'Average_Price':ave_price,
                    'Critic_Score':critic_score,
                    'User_Rating':rating,
                    'Producer':producer,
                    'Country_Hierarchy':country_Hierarchy,
                    'Region':region,
                    'Grape':grape,
                    'Style':style,
                    'Food':food,
                    'Alcohol_Content':alcohol
                        }
        ws_itemobject['wine_info']= wine_info
        listings = ws_itemobject
    except:
        listings = {'result':"not found"}
    return listings