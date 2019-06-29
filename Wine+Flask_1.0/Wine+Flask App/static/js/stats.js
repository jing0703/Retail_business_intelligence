var depurl = "/dep_quant";
var caturl = "/cat_quant";



d3.json(depurl).then(function(response) {

    // var data = response;

    var dataArray = response.y;
    var dataCategories = response.x;

    // svg container
    var height = 600;
    var width = 1100;

    // margins
    var margin = {
    top: 50,
    right: 50,
    bottom: 200,
    left: 150
    };

    // chart area minus margins
    var chartHeight = height - margin.top - margin.bottom;
    var chartWidth = width - margin.left - margin.right;

    // create svg container
    var svg = d3.select("#test1").append("svg")
        .attr("height", height)
        .attr("width", width);

    // shift everything over by the margins
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);


    // scale y to chart height
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(dataArray)])
        .range([chartHeight, 0]);

    // scale x to chart width
    var xScale = d3.scaleBand()
        .domain(dataCategories)
        .range([0, chartWidth])
        .padding(0.1);

    // create axes
    var yAxis = d3.axisLeft(yScale);
    var xAxis = d3.axisBottom(xScale);

    // set x to the bottom of the chart
    chartGroup.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(xAxis)
        .selectAll("text") 
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em") 
        .attr("transform", "rotate(-65)");

    // set y to the y axis
    chartGroup.append("g")
        .call(yAxis);

    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 70)
        .attr("x", 0 - ((height-margin.bottom) / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Total Quantity");

    chartGroup.append("text")
        .attr("y", -50 )
        .attr("x", (chartWidth-margin.left)/2 )
        .attr("dy", "1em")
        .attr("dx", "-3em")
        .classed("axis-text", true)
        .text("Item Quantity by Department");

    // Create the rectangles using data binding
    var barsGroup = chartGroup.selectAll("rect")
        .data(dataArray)
        .enter()
        .append("rect")
        .attr("x", (d, i) => xScale(dataCategories[i]))
        .attr("y", d => yScale(d))
        .attr("width", xScale.bandwidth())
        .attr("height", d => chartHeight - yScale(d))
        .attr("fill", "#970303")
        .attr("value", (d,i)=>dataCategories[i]);
        



    barsGroup.on("mouseover", function() {
    d3.select(this)
                .transition()
                .duration(500)
                .attr("fill", "red");
    })
        .on("mouseout", function() {
        d3.select(this)
                .transition()
                .duration(500)
                .attr("fill", "#970303");
        });
        
    barsGroup.on("click", function() {
        var value = d3.select(this).attr("value");
        console.log(value)
        onclickcat(value)
    });
    

});

function onclickcat(value) {
    var depValue = value;
  
    var url4 = "/depcat2";
    d3.json(url4).then(function(response) {
        filterData = response
        if (depValue != "0"){filterData=filterData.filter(entry=>{return entry.Department==depValue});}
    
        const category = filterData.map(entry => entry.Category)
        const catqty = filterData.map(entry => entry.CatQTY)
        
        var dataArray = catqty;
        var dataCategories = category;

        // svg container
        var height = 600;
        var width =1100;

        // margins
        var margin = {
        top: 50,
        right: 50,
        bottom: 200,
        left: 150
        };

        // chart area minus margins
        var chartHeight = height - margin.top - margin.bottom;
        var chartWidth = width - margin.left - margin.right;
        d3.select("#test2").html("")
        // create svg container
        var svg = d3.select("#test2").append("svg")
            .attr("height", height)
            .attr("width", width);
        

        // shift everything over by the margins
        var chartGroup = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // scale y to chart height
        var yScale = d3.scaleLinear()
            .domain([0, d3.max(dataArray)])
            .range([chartHeight, 0]);

        // scale x to chart width
        var xScale = d3.scaleBand()
            .domain(dataCategories)
            .range([0, chartWidth])
            .padding(0.1);

        // create axes
        var yAxis = d3.axisLeft(yScale);
        var xAxis = d3.axisBottom(xScale);

        // set x to the bottom of the chart
        chartGroup.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .transition()
            .ease(d3.easeLinear)
            .duration(500)
            .call(xAxis)
            .selectAll("text") 
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em") 
            .attr("transform", "rotate(-65)");

        // set y to the y axis
        chartGroup.append("g")
            .call(yAxis);

        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - 70)
            .attr("x", 0 - ((height-margin.bottom) / 2))
            .attr("dy", "1em")
            .classed("axis-text", true)
            .text("Total Quantity");
    
        chartGroup.append("text")
            .attr("y", -50 )
            .attr("x", (chartWidth-margin.left)/2 )
            .attr("dy", "1em")
            .attr("dx", "-3em")
            .classed("axis-text", true)
            .text(`Item Quantity by Category of ${value}`);

        // Create the rectangles using data binding
        var barsGroupCat = chartGroup.selectAll("rect")
            .data(dataArray)
            .enter()
            .append("rect")
            .attr("x", (d, i) => xScale(dataCategories[i]))
            .attr("y", d => yScale(d))
            .attr("width", xScale.bandwidth())
            .transition()
            .duration(500)
            .attr("height", d => chartHeight - yScale(d))
            .attr("fill", "#17a2b8")
            .attr("value", (d,i)=>dataCategories[i])
            

        // Create the event listeners with transitions
        barsGroupCat.on("mouseover", function() {
        d3.select(this)
                    .transition()
                    .duration(500)
                    .attr("fill", "red");
        })
            .on("mouseout", function() {
            d3.select(this)
                    .transition()
                    .duration(500)
                    .attr("fill", "#17a2b8");
            });




    });
  
};
