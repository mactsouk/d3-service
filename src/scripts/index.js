import axios from 'axios';
import Websocket from 'ws';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

const username = 'service';
const token = '7a89e29e-453e-48cc-a881-94d687bfb1cb';
const topicDataUrl = 'ws://localhost:3030/api/ws/v2/sql/execute';

const webSocketRequest = new WebSocket(topicDataUrl);
var websocketData = new Array;
const websocketSubject = new Subject();

// We are waiting for the authentication token
async function requestToWSEndpoint() {
  // Construct the WebSocket token
  const reqToken = username.concat(':', token);;

  websocketData = [];

  // This is an object with the authentication token + query
  // This is the first message for the Websocket connection
  const firstMessage = {
    token: reqToken,
    stats: 2,
    sql: "SELECT count(*), passenger_count, VendorID, sum(total_amount) FROM nyc_yellow_taxi_trip_data WHERE passenger_count != 0 AND passenger_count <= 6 GROUP BY passenger_count, VendorID",
    live: false
  };

  // We open the Websocket
  webSocketRequest.onopen = () => {
    // Here, we send the message with the query and the credentials
    webSocketRequest.send(JSON.stringify(firstMessage));

    // Here, the onmessage() method is executed each time we receive a message
    // from the Websocket connection.
    webSocketRequest.onmessage = (streamEvent) => {
      // This streamEvent is an object that has a data attribute.
      // That data attribute has a type property, which can be
      // RECORD, END or ERROR.
      const isRecord = JSON.parse(streamEvent.data).type === 'RECORD';
      const isComplete = JSON.parse(streamEvent.data).type === 'END';
      const isError = JSON.parse(streamEvent.data).type === 'ERROR';

      websocketSubject.next(websocketData);
      isRecord && websocketData.push(JSON.parse(streamEvent.data).data.value);
      isError && websocketSubject.console.error((error) => console.error(error));
      isComplete && websocketSubject.complete();
    };
  };
};

(async function () {
  await requestToWSEndpoint();

  // finanize() will return data when the stream has finished.
  websocketSubject.pipe(finalize(() => {
    var width = 1000;
    var height = 1000;
    var margin = { top: 50, right: 40, bottom: 50, left: 60 };
    var width = width - margin.left - margin.right;
    var height = height - margin.top - margin.bottom;

    console.log(websocketData, 'DATA');
    websocketData.forEach(function(d) {
      d.sum = d.sum / d.count;
    });

    var xValue = function(d) { return d.count;}, // data -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    // setup y
    var yValue = function(d) { return d.sum;}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

    // setup fill color
    var cValue = function(d) { return d.VendorID;},
    color = d3.scale.category10();
  
    // add the graph canvas to the body of the webpage
    var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([d3.min(websocketData, xValue)-1, d3.max(websocketData, xValue)+1]);
    yScale.domain([d3.min(websocketData, yValue)-1, d3.max(websocketData, yValue)+1]);

    // x-axis
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Count");

    // y-axis
    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Amount per trip");

    // draw dots
    svg.selectAll(".dot")
      .data(websocketData)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", function(d) { return 2 * d.passenger_count;})
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d) { return color(cValue(d));})
      .style("opacity", 20)
      .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html("VendorID: " + d["VendorID"] + "<br/> (" + xValue(d)
	        + ", " + Math.floor(yValue(d)) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
      });
  })).subscribe();
}());
