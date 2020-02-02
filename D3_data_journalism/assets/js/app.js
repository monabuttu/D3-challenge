// @TODO: YOUR CODE HERE!

buildPlot();

// Initial Params
var chosenXAxis = "obesity";

function buildPlot(){

    var svgArea = d3.select("body").select("svg");

    if (!svgArea.empty()) {
        svgArea.remove();
      }
    
    // svg params
    var svgHeight = window.innerHeight;
    var svgWidth = window.innerWidth;

    var margin = {
    top: 70,
    right: 120,
    bottom: 125,
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

    //function for updating x linear scale
    function xScale(healthData, chosenXAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenXAxis])-1,d3.max(healthData, d => d[chosenXAxis])+1])
        .range([0, width]);
    
        return xLinearScale;
    
    }

    function yScale (healthData){

        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(healthData, d => d.income)-2000,d3.max(healthData, d => d.income)])
            .range([height, 0]);

        return yLinearScale;
    }


    //function for updating circle text
    function circleText(healthData,chosenXAxis){

        var text = chartGroup.selectAll(".stateText").remove();

        xLinearScale = xScale(healthData,chosenXAxis)
        yLinearScale = yScale(healthData);

        //Add the SVG Text Element to the chart group
        var text = chartGroup.selectAll("text")
        .data(healthData)
        .enter()
        .append("text")
        .classed("stateText",true)
        .transition()
        .duration(30)
        .attr("x", d => xLinearScale(d[chosenXAxis])-7)
        .attr("y", d => yLinearScale(d.income)+4)
        .text( function (d) { return `${d.abbr}` })
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .attr("fill", "black");
    }

    // function used for updating xAxis var upon click on axis label
    function renderAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
    
        xAxis.transition()
        .duration(30)
        .call(bottomAxis);
    
        return xAxis;
    }

    // function used for updating circles group with a transition to
    // new circles
    function renderCircles(circlesGroup, newXScale, chosenXaxis) {

        circlesGroup.transition()
        .duration(30)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    
        return circlesGroup;
    }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, circlesGroup) {

        if (chosenXAxis === "obesity") {
        var label = "Obesity:";
        }
        else {
        var label = "Smoking:";
        }
    
        var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`<strong>State: ${d.state}<br>Income: $${d.income}<br>${label} ${d[chosenXAxis]}%</strong>`);
        });
    
        circlesGroup.call(toolTip);
    
        circlesGroup.on("mouseover", function(data) {
        d3.select(this)
        .attr("fill", "gold");
        toolTip.show(data);
        })
        // onmouseout event
        .on("mouseout", function(data, index) {
            d3.select(this)
            .attr("fill", "green");
            toolTip.hide(data);
        });

        return circlesGroup;
    }

    d3.csv('assets/data/data.csv').then(function(healthData, err){

        if (err) throw err;

        console.log(healthData);

        healthData.forEach(function (state){
            state.obesity = +state.obesity
            state.income = +state.income
            state.smokes = +state.smokes
        });

        // Create scale functions
        // ==============================
        // xLinearScale function above csv import
        var xLinearScale = xScale(healthData, chosenXAxis);

        yLinearScale = yScale(healthData);

        // Create axis functions
        // ==============================
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        //Append Axes to the chart
        // ==============================
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        chartGroup.append("g")
            .call(leftAxis);

        // append y axis
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .classed("axis-text", true)
            .text("Income ($)");
 
        // =======================================================
        var toolTip = d3.select("body")
        .append("div")
        .classed("d3-tip", true);

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
        .attr("opacity", ".5")

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // updates circles with new x values
        circleText(healthData,chosenXAxis);

        // Create group for  2 x- axis labels
        var labelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var obesityLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "obesity") // value to grab for event listener
            .classed("active", true)
            .text("Obesity (%)");

        var smokingLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "smokes") // value to grab for event listener
            .classed("inactive", true)
            .text("Smoking (%)");

    
        // x axis labels event listener
        labelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // updates x scale for new data
            xLinearScale = xScale(healthData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

            // updates circles with new x values
            circleText(healthData,chosenXAxis);
            
            // changes classes to change bold text
            if (chosenXAxis === "obesity") {
                obesityLabel
                .classed("active", true)
                .classed("inactive", false);
                smokingLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else {
                obesityLabel
                .classed("active", false)
                .classed("inactive", true);
                smokingLabel
                .classed("active", true)
                .classed("inactive", false);
            }
            }
        });

    }).catch(function(error) {
        console.log(error);
      });

};

// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", buildPlot);