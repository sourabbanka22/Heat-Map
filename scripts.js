
const container = d3.select("#main");

container.append("h1")
        .attr("id", "title")
        .text("Visualizing Data with Heat Map")
        .append("h6")
        .attr("id", "description")
        .text("Monthly Global Land-Surface Temperature");

const boxSize = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 60
}

const width = 800 - boxSize.left - boxSize.right;
const height = 400 - boxSize.top - boxSize.bottom;

const containerBody = container
                        .append("svg")
                        .attr("viewBox", `0 0 ${width + boxSize.left + boxSize.right}  ${height + boxSize.top + boxSize.bottom}`);

const canvasContents = containerBody.append("g")
                                      .attr("transform", `translate(${boxSize.left}, ${boxSize.top})`);

const legend = containerBody
                .append("g")
                .attr("id", "legend")
                .attr("transform", `translate(${width}, ${boxSize.top})`);

const legendObj = {
    color: ["#FF0030", "#FD5405", "#FCCF05", "#E6FD06", "#03FE26", "#06DBD6", "#051CFD"],
    temperature: [12.8, 11.1, 9.4, 7.9, 6.1, 4.7, 2.8],
    size: 50
}

legend
    .selectAll("rect")
    .data(legendObj.color)
    .enter()
    .append("rect")
    .attr("width", legendObj.size - 10)
    .attr("height", legendObj.size - 25)
    .attr("x", (d, i) => i*(-legendObj.size))
    .attr("y", 0)
    .attr("fill", (d, i) => legendObj.color[i])
    .select("text")
    .data(legendObj.temperature)
    .enter()
    .append("text")
    .attr("x", (d, i) => i*(-legendObj.size) + 7)
    .attr("y", legendObj.size - 10)
    .style("font-size", "0.7rem")
    .text((d, i) => `${legendObj.temperature[i]}°C`);


const xScale = d3.scaleTime().range([0, width]);

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const yScale = d3.scaleBand()
                 .range([legendObj.size * 2, height]);

const convertToYear = d3.timeParse("%Y");
const convertToMonth = d3.timeParse("%m");
const getInTimeMonth = d3.timeFormat("%B");


const temperatureUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

fetch(temperatureUrl)
  .then((response) => response.json())
  .then((json) => drawHeatMap(json.baseTemperature, json.monthlyVariance));


drawHeatMap = (baseValue, data) => {

    data.forEach((d)=> {
        d["year"] = convertToYear(d["year"]);
        d["month"] = convertToMonth(d["month"]);
    });

    let maxScale = d3.max(data, d => d["year"]);
    let minScale = d3.min(data, d => d["year"]);

    let maxYear = maxScale.getFullYear();
    let minYear = minScale.getFullYear();

    xScale.domain([minScale, maxScale]);

    yScale.domain(months);
    
    const xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.timeFormat("%Y"))
                    .ticks(d3.timeYear.every(10))
                    .tickSizeOuter(0);

    const yAxis = d3.axisLeft(yScale)
                    .tickSizeOuter(0);


    canvasContents
        .append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    canvasContents
        .append("g")
        .attr("id", "y-axis")
        .call(yAxis);

    const tooltip = container
                        .append("div")
                        .attr("id", "tooltip");

    canvasContents
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("data-month", (d) => d["month"].getMonth())
        .attr("data-year", (d) => d["year"].getFullYear())
        .attr("data-temp", (d) => d["variance"] + baseValue)
        .on("mouseenter", (d) => {
            tooltip
                .attr("data-year", d["year"].getFullYear())
                .style("opacity", 1)
                .style("left", `${d3.event.layerX}px`)
                .style("top", `${d3.event.layerY}px`)
                .text(() => {
                    let year = d["year"].getFullYear();
                    let month = getInTimeMonth(d["month"]);
                    let temperature = (d["variance"] + baseValue).toFixed(3);
                    return `
                    Year: ${year}
                    Month: ${month}
                    Degrees: ${temperature}
                    `;
            });
        })
        .on("mouseout", () => {
            tooltip
                .style("opacity", 0);
        })
        .attr("x", (d) => xScale(d["year"]))
        .attr("y", (d) =>  yScale(getInTimeMonth(d["month"])))
        .attr("width", width/(maxYear - minYear))
        .attr("height", (height - legendObj.size*2)/ 12)
        .attr("fill", (d, i) => {
            let cellTemperature = d.variance + baseValue;
            if(cellTemperature > legendObj.temperature[0]) {
                return legendObj.color[0];
            }
            else if(cellTemperature > legendObj.temperature[1]) {
                return legendObj.color[1];
            }
            else if(cellTemperature > legendObj.temperature[2]) {
                return legendObj.color[2];
            }
            else if(cellTemperature > legendObj.temperature[3]) {
                return legendObj.color[3];
            }
            else if(cellTemperature > legendObj.temperature[4]) {
                return legendObj.color[4];
            }
            else if(cellTemperature > legendObj.temperature[5]) {
                return legendObj.color[5];
            }
            else {
                return legendObj.color[6];
            }
        }) 
}
