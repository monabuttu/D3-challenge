// @TODO: YOUR CODE HERE!

buildPlot();

function buildPlot(){

    var svgArea = d3.select("body").select("svg");

    if (!svgArea.empty()) {
        svgArea.remove();
      }
    
    // svg params
    var svgHeight = window.innerHeight;
    var svgWidth = window.innerWidth;

    // var svgWidth = 960;
    // var svgHeight = 500;

    var margin = {
    top: 20,
    right: 70,
    bottom: 60,
    left: 75
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
    var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


    d3.csv('assets/data/data.csv').then(function(healthData){

        console.log(healthData[0]);

        healthData.forEach(function (state){
            state.obesity = +state.obesity
            state.income = +state.income
        });

        // Step 2: Create scale functions
        // ==============================
        var xLinearScale = d3.scaleLinear()
        .domain(d3.extent(healthData, d => d.obesity))
        .range([0, width]);

        var yLinearScale = d3.scaleLinear()
            .domain(d3.extent(healthData, d=>d.income))
            .range([height, 0]);

        // Step 3: Create axis functions
        // ==============================
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Step 4: Append Axes to the chart
        // ==============================
        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        chartGroup.append("g")
            .call(leftAxis);
        
        // text label for the x axis
        svg.append("text")             
        .attr("transform",
                "translate(" + (width/2) + " ," + 
                            (height + margin.top+35) + ")")
        .style("text-anchor", "middle")
        .text("Obesity Rate (%)");

        // text label for the y axis
        svg.append("text")
        .attr("text-anchor", "middle")  
        .attr("transform", "translate("+ ((margin.left/2)-10) +","+(height/2)+")rotate(-90)")  
        .text("Income ($)"); 

        // Step 5: Create Circles
        // ==============================
        var circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.obesity))
        .attr("cy", d => yLinearScale(d.income))
        .attr("r", "10")
        .attr("fill", "green")
        .attr("opacity", ".5");

        //Add the SVG Text Element to the chart group
        var text = chartGroup.selectAll("text")
                               .data(healthData)
                               .enter()
                               .append("text")
                               .attr("x", d => xLinearScale(d.obesity)-7)
                               .attr("y", d => yLinearScale(d.income)+4)
                               .text( function (d) { return `${d.abbr}` })
                               .attr("font-family", "sans-serif")
                               .attr("font-size", "10px")
                               .attr("fill", "black");
    

    }).catch(function(error) {
        console.log(error);
      });

};

// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", buildPlot);