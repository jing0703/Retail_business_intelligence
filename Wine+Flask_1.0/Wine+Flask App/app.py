import os
import pandas as pd
import numpy as np
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
from flask_sqlalchemy import SQLAlchemy

import pymongo
from bson.json_util import dumps
import scrape

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func,inspect,MetaData, Table, Column, Integer, String, Float
import pymysql
pymysql.install_as_MySQLdb()

from config import dbuser, dbpasswd, dburi, dbport, dbname

# -----------------------------------------------------------------------------------------
app = Flask(__name__)

engine = create_engine(f"mysql+pymysql://{dbuser}:{dbpasswd}@{dburi}:{dbport}/{dbname}", echo=False)
metadata = MetaData(engine)
metadata.reflect(engine)

Table('itemlist', metadata, Column('SKU', Integer, primary_key=True),extend_existing=True)
Table('department', metadata, Column('DEPID', Integer, primary_key=True),extend_existing=True)
Table('category', metadata, Column('CATID', Integer, primary_key=True),extend_existing=True)
Table('pack', metadata, Column('PACKID', Integer, primary_key=True),extend_existing=True)
Table('size', metadata, Column('SIZEID', Integer, primary_key=True),extend_existing=True)
Table('storespecial', metadata, Column('SKU', Integer, primary_key=True),extend_existing=True)

Base = automap_base(metadata=metadata)
Base.prepare(engine, reflect=True)

Category = Base.classes.category
Department = Base.classes.department
Itemlist = Base.classes.itemlist
Pack = Base.classes.pack
Size = Base.classes.size
Storespecial = Base.classes.storespecial

session = Session(bind=engine)

# -----------------------------------------------------------------------------------------
# -----------------------------------------------------------------------------------------
conn = 'mongodb://localhost:27017'
client = pymongo.MongoClient(conn)
mongo = client.scrapped_db
# -----------------------------------------------------------------------------------------
# global globalsku
# global globalsearch
globalsku = 0
globaltest = 0

@app.route("/")
def welcome(): 
    return render_template("Welcome.html")

@app.route("/teamintro")
def teamintro(): 
    return render_template("teamintro.html")

@app.route("/project")
def project(): 
    return render_template("project.html")


@app.route("/dashboard", methods=["GET", "POST"])
def index(): 
    #get input wine name from form 
    if request.method == "POST":
        global globalclick
        global globalsku
        global globalsearch
        global globaldep
        global globalcat

        searchname = request.form["wineName"]
        clickname = request.form["clickInput"]
        globaldep = request.form["depselect"]
        globalcat = request.form["catselect"]

        globalclick = clickname

        print("CLICKNAME: "+clickname)

        try:searchSKU = session.query(Itemlist.SKU).filter(Itemlist.ITEMNAME == clickname).all()[0][0]
        except:searchSKU = clickname.replace(" ","+")

        globalsku = searchSKU
        globalsearch = searchname.upper()

        print(f"{globalsku} {globalsearch}")
        print(globaldep+" "+globalcat)
        
    return render_template("dashboard.html")


@app.route("/scrapeinfo")
def scrapeinfo(): 
    global globalclick
    searchname = globalclick
    try:searchSKU = session.query(Itemlist.SKU).filter(Itemlist.ITEMNAME == searchname).all()[0][0]
    except:searchSKU = searchname.replace(" ","+")

    global globalsku
    globalsku = searchSKU

    listings_data = scrape.scrape(searchname)
    listings_data["sku"] = searchSKU

    mongo.WineColl.delete_one({"sku":searchSKU})
    mongo.WineColl.insert_one(listings_data)
    return redirect("/dashboard", code=302)


@app.route("/iteminfo")
def iteminfo():
    global globalsku
    listings = mongo.WineColl.find({"sku":globalsku})
    return dumps(listings[0])

@app.route("/storeinfo")
def storeinfo():
    global globalsku
    iteminfo = session.query(Itemlist.ITEMNAME, Size.SIZENAME, Department.DEPNAME, Category.CATNAME, Itemlist.PRICEPERUNIT, Storespecial.Sale, Pack.PACKNAME, Itemlist.SKU).\
    outerjoin(Storespecial, Itemlist.SKU==Storespecial.SKU).\
    outerjoin(Size, Itemlist.SIZEID==Size.SIZEID).\
    outerjoin(Category, Itemlist.CATID==Category.CATID).\
    outerjoin(Department, Itemlist.DEPID==Department.DEPID).\
    outerjoin(Pack, Itemlist.PACKID==Pack.PACKID).\
    filter(Itemlist.SKU == globalsku).all()

    try: price = float(iteminfo[0][4])
    except:price = iteminfo[0][4]

    try: saleprice = float(iteminfo[0][5])
    except:saleprice = iteminfo[0][5]

    json_iteminfo = {"name":iteminfo[0][0],
                    "size":iteminfo[0][1],
                    "department":iteminfo[0][2],
                    "category":iteminfo[0][3],
                    "price":price,
                    "saleprice":saleprice,
                    "pack":iteminfo[0][6],
                    "sku":iteminfo[0][7]}

    return jsonify(json_iteminfo)


@app.route("/itemlist")
def itemlist():
    global globaldep
    global globalcat
    global globalsearch

    searchname = globalsearch+"%"

    query = session.query(Itemlist.ITEMNAME, Department.DEPNAME, Category.CATNAME).\
    outerjoin(Category, Itemlist.CATID==Category.CATID).\
    outerjoin(Department, Itemlist.DEPID==Department.DEPID)

    if globalcat != "0":
        query = query.filter(Category.CATNAME == globalcat)
    if globaldep != "0":
        query = query.filter(Department.DEPNAME == globaldep)
    if searchname != "":
        query = query.filter(Itemlist.ITEMNAME.like(searchname))

    itemsearchlist = query.all()
    
    itemsearchlist2 = []
    for x in itemsearchlist:
        itemsearchlist2.append([x[0],x[1],x[2]])
    return jsonify(itemsearchlist2)


@app.route("/depcat")
def depcat():
    depcatFilter = session.query(Category.CATNAME, Department.DEPNAME).outerjoin(Department, Category.DEPID==Department.DEPID).all()
    depcatList=[]
    for x in depcatFilter:
        xdict = {"Department":x[1], "Category":x[0]}
        depcatList.append(xdict)
    return jsonify(depcatList)

@app.route("/depcat2")
def depcat2():
    depcatFilter = session.query(Category.CATNAME, Department.DEPNAME, func.sum(Itemlist.TOTALQTY)).\
        outerjoin(Department, Category.DEPID==Department.DEPID).\
        outerjoin(Itemlist, Category.CATID==Itemlist.CATID).\
        group_by(Category.CATNAME, Department.DEPNAME).all()

    depcatList=[]
    for x in depcatFilter:
        try:quant = int(x[2])
        except:quant=0
        xdict = {"Department":x[1], "Category":x[0], "CatQTY":quant}
        depcatList.append(xdict)
    return jsonify(depcatList)

@app.route("/dep_quant")
def dep_quant():
    dep_quantity = session.query(Department.DEPNAME, func.sum(Itemlist.TOTALQTY)).\
    outerjoin(Itemlist, Department.DEPID==Itemlist.DEPID).\
    group_by(Department.DEPNAME).all()

    dep_List = []
    qty_List = []

    for x in dep_quantity:
        try:quant = int(x[1])
        except:quant=0
        dep_List.append(x[0])
        qty_List.append(quant)
        
    depQnt_Data = {"type": "bar", 
    "x": dep_List, 
    "y": qty_List
    }
    
    
    return jsonify(depQnt_Data)


@app.route("/businessstats")
def businessstats():
    return render_template("stats.html")

if __name__ == "__main__":
    app.run(debug=True)


