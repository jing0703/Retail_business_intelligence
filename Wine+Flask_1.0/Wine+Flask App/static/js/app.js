
var url1 = "/iteminfo";
var url2 = "/storeinfo";
var API_KEY = "" //for leaflet (mapbox)


function build(){

  d3.select("#itemstats").html("");
  d3.select("#comp_body").html("");
  d3.select("#storestats").html("");
  d3.select("#comp_storecount").text(`0`);
  d3.select("#wineinfo_title").text(`Click on UPDATE to get info`);
  d3.select("#storemap").html("<div id='map' class='rounded border border-danger' style='height:600px'></div>");
  
  

  d3.json(url1).then(function(response) {
    console.log(response);

    d3.select("#wineinfo_title").text(`${response["wine_info"]["Name"]}`);

    var ws_list = ["Producer","Style","Average_Price",
                  "Country_Hierarchy","Food","Critic_Score",
                  "Region","Alcohol_Content","User_Rating",
                  "Grape"];

    

    for (var i = 0; i < ws_list.length; i++){
      d3
      .select("#itemstats")
      .append("div")
      .attr("class","col-md-4 clearfix")
      .html(`<p><div><strong>${ws_list[i]}:</strong></div><div id='${ws_list[i]}'>${response["wine_info"][ws_list[i]]}</div></p>`)
    };

    var rating = d3.select("#User_Rating").html()
    d3.select("#User_Rating").style("color","red")
    if (parseFloat(rating)>3.9){d3.select("#User_Rating").style("color","green");}



    d3.select("#comp_storecount").text(`${Object.keys(response["store_info"]).length}`)

    

    Object.entries(response["store_info"]).forEach(([key, value]) => 
      d3.select("#comp_body")
      .append("li")
      .attr("class", "list-group-item justify-content-between align-items-center")
      .html(`<div class='row'>
      <div class='col-md-6'>${key}<div>${value[0]}</div></div>
      <div class='col-md-3 d-flex align-items-center'>${value[3]}</div>
      <div class='col-md-3 text-danger d-flex align-items-center'>${value[1]}</div>
      </div>`)
    );




    wines= response['store_info']
    places = Object.keys(wines)
    // Create a map object
    var myMap = L.map("map", {
      center: [40.13975, -74.37625],
      zoom: 8,
    });
    
    var FlagIcon = L.icon({
      iconUrl: "http://www.clker.com/cliparts/u/F/m/t/r/1/red-flag-md.png",
      iconSize:     [38, 95], 
      iconAnchor:   [0, 95], 
      popupAnchor:  [40.535007, -74.521335] 
    });
    L.marker([40.535007, -74.521335], {icon: FlagIcon}).addTo(myMap);
    var Rutgersmarker = [];
    var Somersetmarker = [];
    Rutgersmarker.push(L.circle([40.535007, -74.521335], {
      stroke: false,
      fillOpacity: 0.75,
      color: "purple",
      fillColor: "purple",
      radius: 8047,
    }).addTo(myMap));
    Somersetmarker.push(L.circle([40.535007, -74.521335], {
      stroke: false,
      fillOpacity: 0.50,
      color: "pink",
      fillColor: "pink",
      radius: 16094,
    }).addTo(myMap));
    L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.streets-basic",
      accessToken: API_KEY
    }).addTo(myMap);



    var markerArray = [];
    for (var i = 0; i < places.length; i++) {
      var storemarker = L.marker(wines[places[i]][2],{
          draggable:false,
          title: wines[places[i]][0]
      }).bindPopup("<h4>" + wines[places[i]][0] + ", " + places[i] + "</h4><hr><h4>"+ wines[places[i]][1]+"</h4>");
      markerArray.push(storemarker)
    };

    var stores = L.layerGroup(markerArray);
    stores.addTo(myMap);


    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.streets",
      accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.dark",
      accessToken: API_KEY
    });
    var Rutgers = L.layerGroup(Rutgersmarker);
    var Somerset = L.layerGroup(Somersetmarker);
    var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
    };
    var overlayMaps = {
    "Five Miles Radius": Rutgers,
    "Ten Miles Radius": Somerset,
    };
    L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
    }).addTo(myMap);





    
  });


  

  d3.json(url2).then(function(response) {
    console.log(response);

    d3.select("#storeinfo_title").text(`SKU: ${response["sku"]}`);

    

    Object.entries(response).forEach(([key, value]) => 
      d3
      .select("#storestats")
      .append("div")
      .attr("class","col-md-4 clearfix")
      .html(`<p><strong>${key}:</strong></br>${value}</p>`)
    );

  });


};


build()



var url4 = "/depcat";
d3.json(url4).then(function(response) {

  const uniquedep = Array.from(new Set(response.map(entry => entry.Department)));
  uniquedep.sort().unshift("0")

  d3.select("#depselect")
    .selectAll("option")
    .data(uniquedep)
    .enter()
    .append("option")
    .html(function(d)
        {
        return `<option value=${d}>${d}</option>`; 
        });


  const category = response.map(entry => entry.Category)
  category.sort().unshift("0")

  d3.select("#catselect")
    .selectAll("option")
    .data(category)
    .enter()
    .append("option")
    .html(function(d)
        {
        return `<option value=${d}>${d}</option>`; 
        });
});

function onchangedep() {
  var depValue = d3.select('#depselect').property('value')

  var url4 = "/depcat";
  d3.json(url4).then(function(response) {
    filterData = response
    if (depValue != "0"){filterData=filterData.filter(entry=>{return entry.Department==depValue});}

    const category = filterData.map(entry => entry.Category)
    category.sort().unshift("0")

    d3.select("#catselect")
      .html("<option value='0'>Select Category</option>")
      .selectAll("option")
      .data(category)
      .enter()
      .append("option")
      .html(function(d)
          {
          return `<option value=${d}>${d}</option>`; 
          });
    

  });

};


$('#filter_table').on('click', 'tr', function(e){
  tableText($(this).attr('value'));
});

function tableText(tableRow) {
  var myJSON = tableRow;
  document.getElementById("clickInput").value = myJSON;

  var nametest = d3.select("#wineName").node().value
  var clicktest = d3.select("#clickInput").node().value
  var deptest = d3.select("#depselect").node().value
  var cattest = d3.select("#catselect").node().value

  
  req = $.ajax({
      url : '/dashboard',
      type : 'POST',
      data : { wineName : nametest, depselect : deptest, catselect : cattest, clickInput:clicktest }
      
  });

  build()
  console.log(document.getElementById("clickInput").value)
}


$(document).ready(function() {

  $('#modalbutton').on('click', function() {
      var nametest = d3.select("#wineName").node().value
      var clicktest = d3.select("#clickInput").node().value
      var deptest = d3.select("#depselect").node().value
      var cattest = d3.select("#catselect").node().value

      console.log(nametest)
      console.log(deptest)
      console.log(cattest)
      
      req = $.ajax({
          url : '/dashboard',
          type : 'POST',
          data : { wineName : nametest, depselect : deptest, catselect : cattest, clickInput:clicktest }
          
      });

      var url3 = "/itemlist";
      d3.json(url3).then(function(response) {
        console.log(response);
        d3.select("#filtered_list").html("");

        response.forEach((item) => {
          d3.select("#filtered_list")
            .append("tr")
            .attr("value",item[0])
            .attr("style","cursor: pointer;")
            .html(`<td>${item[0]}</td><td>${item[1]}</td><td>${item[2]}</td>`)

            
            
        });
      });
  

  });

});

function filterReset(){
  d3.event.preventDefault();
  d3.select("#wineName").node().value = ''
  document.getElementById('depselect').selectedIndex=0;
  document.getElementById('catselect').selectedIndex=0;
  onchangedep()
}
d3.select("#reset-btn").on("click", filterReset);

// https://www.youtube.com/watch?v=Kcka5WBMktw
// https://getbootstrap.com/docs/4.0/components/modal/#examples

