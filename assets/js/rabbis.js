function rabbis(dataset, frameId1, frameId2){

var margin = {top: 40, right: 0, bottom: 30, left: 120},
    width = 1200 - margin.left - margin.right,
    height = 50 - margin.top - margin.bottom;
    
let div = d3.select('body')
        .append('div') 
        .attr('class', 'tooltip')
        .style('opacity', 0);

var svgM = d3.select(frameId1)
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin")
  .attr("viewBox", "0 0 1200 50")
  .classed("svg-content", true)
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", 10 + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

d3.csv(dataset, function(data) {
console.log(data)


let congregations = _.chain(data)
    .filter(d=>d.idcongregation!="")
    .groupBy(d=>d.idcongregation)
    .map(d=>{
        return {
            idcongregation: d[0].idcongregation,
            congregation_name: d[0].congregation_name,
            year_est: d[0].year_est,
            location: d[0].target_location,
            loc_lat: parseFloat(d[0].targetX),
            loc_lon: parseFloat(d[0].targetY),
            rabbis: d,
            amt: d.length
        }
    })
    .sort(function(a,b){return b.loc_lat - a.loc_lat})
    .value();
console.log(congregations)
    
//_.each(congregations, function(c,k){
//    
//})
let rabbiData = data.filter(d=>d.idcongregation!="")
//_.sortBy(data, [function(o) { return parseFloat(o.targetX); }]).filter(d=>d.idcongregation !== "");
console.log(rabbiData.filter(d=>d.year_start==""))
let names = _.uniq(rabbiData.map(d=>d.name))

    console.log(names.length)

    let color = d3.scaleOrdinal()
        .domain(names) 
        .range(chroma.scale(["#17becf","#1f77b4","#aec7e8","#f0027f","#f781bf","#ff7f0e","#ffbb78","#ffd92f","#98df8a", "#2ca02c", "#7b4173", "#a55194", "#ce6dbd", "#f1b6da"]).colors(names.length));
//    var color = d3.scaleOrdinal()
////    .domain(data)
//  .range(d3.schemeSet3);
  // Add X axis
    const x = d3.scaleTime()
        .domain([new Date(1597, 0, 1), new Date(1845, 0, 1)])
        .range([0, width]);
    svgM.append("g")
        .attr('id', 'xAxisDate')
        .attr("color", "#333")
        .style('font-size', '0.9rem')
        .call(d3.axisBottom(x).tickSize(height).tickFormat(d3.timeFormat("%Y")))
        .call(g => g.select(".domain").attr("display", "none"))
        .call(g => g.selectAll(".tick").selectAll("line").attr("display", "none"))
        .call(g => g.selectAll(".tick").selectAll("text").attr("transform", "translate(0," + (-height-20) + ")"));


_.each(congregations, function(c, i){
//     console.log(c)
    let heightB = c.rabbis.length *8;
        
    var svg = d3.select(frameId2)
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin")
  .attr("viewBox", "0 0 1200 " + heightB )
  .classed("svg-content", true)
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", heightB)
    .style("background-color", function(l){
        if ((i % 2) == 0){return "#F8F8F8"}
        else {return "none"}
    })
  .append("g")
    .attr("transform", "translate(" + margin.left + ",0)");
    
    const x = d3.scaleTime()
        .domain([new Date(1597, 0, 1), new Date(1845, 0, 1)])
        .range([0, width]);
    svg.append("g")
        .attr('id', 'xAxisDate')
        .attr("color", "#333")
        .style('font-size', '0.9rem')
        .call(d3.axisBottom(x).tickSize(heightB).tickFormat(d3.timeFormat("%Y")))
        .call(g => g.select(".domain").attr("display", "none"))
        .call(g => g.selectAll(".tick").selectAll("line").attr("stroke", "#D8D8D8").style("stroke-dasharray", "5 5"))
        .call(g => g.selectAll(".tick").selectAll("text").attr("display", "none"));

  var y = d3.scaleBand()
    .range([ heightB, 0 ])
    .domain(c.rabbis.sort(function(a,b){return parseFloat(b.year_start) - parseFloat(a.year_start)}).map(d=>d.name))
    .padding(1);
  svg.append("g")
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").attr("display", "none"))
    .call(g => g.selectAll(".tick").selectAll("line").attr("display", "none"))
    .call(g => g.selectAll(".tick").selectAll("text").attr("display", "none"));

    var hillGradients = svg.append("defs").selectAll("linearGradient")
    .data(c.rabbis)
    .enter().append("linearGradient")
    //Create a unique id per "hill"
    .attr("id", function(d){ return "gradient-" + d.idpeople; })
   .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "100%")
    .attr("y2", "100%");

//Add colors to the gradient
hillGradients.append("stop")
    .attr('class', 'start')
    .attr("offset", "0%")
    .attr("stop-color", function(d) {
        return color(d.name);
    })
    .attr("stop-opacity", 1);
hillGradients.append("stop")
    .attr('class', 'end')
    .attr("offset", "60%")
    .attr('stop-color','#f4f1eb')
    .attr("stop-opacity", 0);
    
    var rabbiGradients = svg.append("defs").selectAll("linearGradient")
    .data(c.rabbis)
    .enter().append("linearGradient")
    //Create a unique id per "hill"
    .attr("id", function(d){ return "gradientB-" + d.idpeople; })
   .attr("x1", "100%")
    .attr("x2", "0%")
    .attr("y1", "100%")
    .attr("y2", "100%");

//Add colors to the gradient
rabbiGradients.append("stop")
    .attr('class', 'start')
    .attr("offset", "0%")
    .attr("stop-color", function(d) {
        return color(d.name);
    })
    .attr("stop-opacity", 1);
rabbiGradients.append("stop")
    .attr('class', 'end')
    .attr("offset", "60%")
    .attr('stop-color','#f4f1eb')
    .attr("stop-opacity", 0);
    

  svg.selectAll("myline")
    .data(c.rabbis
//          .filter(d=>d.year_end !="").filter(d=>d.year_start != "")
         )
    .enter()
//    .append("line")
    .append("rect")
      .attr("class", "rabbi-bar")
    .attr("x", function(d) { 
      if(d.year_start=="" && d.year_end !="") {return x(new Date(d.year_end,0,1)) }
        else {return x(new Date(d.year_start,0,1)) }
//      return x(new Date(d.year_start,0,1)); 
      })
      .attr("y", function(d) { return y(d.name)-6; })
    .attr("width", function(d) { 
      if(d.year_start!="" && d.year_end =="") {return 100 }
      if(d.year_start=="" && d.year_end !="") {return 100 }
        else {return x(new Date(d.year_end,0,1)) - x(new Date(d.year_start,0,1)) }
//      return x(new Date(d.year_end,0,1)) - x(new Date(d.year_start,0,1)) 
      })
    .attr("height", 8)
//      .attr("x1", function(d) { 
//      return x(new Date(d.year_start,0,1))})
////            if(d.year_start=="" && d.year_end !=""){return x(new Date((parseFloat(d.year_end)+6),0,1))}
////            else {return x(new Date(d.year_start,0,1))}; })
//      .attr("x2", function(d) { 
//      return x(new Date(d.year_end,0,1))})
////            if(d.year_end=="" && d.year_start !=""){return x(new Date((parseFloat(d.year_start)+6),0,1))}
////            else {return x(new Date(d.year_end,0,1))}; })
//      .attr("y1", function(d) { return y(d.name); })
//      .attr("y2", function(d) { return y(d.name); })
//      .attr("stroke", function(d){ return color(d.name)})
//      .attr("stroke-width", "6px")
//    .style("fill", "none")
//    .attr("stroke", function(d) {
//        return "url(#gradient-" + d.idpeople + ")";
//    })
    .style('cursor', 'pointer')
    .on('mouseover.tooltip', function(d) {
            div.transition()    
                .duration(100)    
                .style("opacity", 0.95);    
            div.html( d.name +"</br>"+ d.congregation_name +"</br>" + d.year_start +"-"+ d.year_end )  
                .style("left", (d3.event.pageX + 12) + "px")   
                .style("top", (d3.event.pageY - 28) + "px");  
            })          
    .on('mouseout.tooltip', function(d) {   
        div.transition()    
            .duration(100)    
            .style("opacity", 0); 
    })
//        .attr("opacity", 0.4);
;
    d3.selectAll(".rabbi-bar")
//    .style("fill", "none")
    .attr("fill", function(d) {
         if(d.year_start!="" && d.year_end =="") {return "url(#gradient-" + d.idpeople + ")";}
        if(d.year_start=="" && d.year_end !="") {return "url(#gradientB-" + d.idpeople + ")";}
        else {return color(d.name)}
    })
//    .attr("stroke-width", "6px")
    ;
    
     svg.selectAll("myCircle")
    .data(c.rabbis
//          .filter(d=>d.year_end !="").filter(d=>d.year_start != "")
         )
      .enter()
        .append("line")
        .attr("id", "congregations")
        .attr("x1", function(d) { return x(new Date(d.year_est,0,1)); })
        .attr("x2", function(d) { return x(new Date(d.year_est,0,1)); })
        .attr("y1", function(d) { return y(d.name)-5; })
        .attr("y2", function(d) { return y(d.name)+5; })
        .attr("stroke-width", 4)
        .style("stroke", function(d){
            if (d.rite=="sephardic"){return "#00608c"}
            else {return "#d65ca2"}
        })
        .style('cursor', 'pointer')
        .on('mouseover.tooltip', function(d) {
                div.transition()    
                    .duration(100)    
                    .style("opacity", 0.95);    
                div .html( d.congregation_name +"</br>"+ d.target_location + "</br>Est."+ d.year_est )  
                    .style("left", (d3.event.pageX + 12) + "px")   
                    .style("top", (d3.event.pageY - 28) + "px");  
                })          
        .on('mouseout.tooltip', function(d) {   
            div.transition()    
                .duration(100)    
                .style("opacity", 0); 
        });
    
       var yLabels = d3.scaleBand()
        .range([ heightB, 0 ])
        .domain(c.rabbis.map(d=> d.congregation_name))
        .padding(1);
      svg.append("g")
    .attr("color", "#333")
        .style('font-size', '0.7rem')
        .call(d3.axisLeft(yLabels))
        .call(g => g.select(".domain").attr("display", "none"))
.call(g => g.selectAll(".tick").selectAll("line").attr("display", "none"))
    .call(g => g.selectAll(".tick").selectAll("text").attr("cursor", "pointer").on('mouseover.tooltip', function(n) {
            div.data(c.rabbis).enter();
                div.transition()    
                    .duration(100)    
                    .style("opacity", 0.95);    
                div .html( d=>d.congregation_name +"</br>"+ d.target_location + "</br>Est."+ d.year_est )  
                    .style("left", (d3.event.pageX + 12) + "px")   
                    .style("top", (d3.event.pageY - 28) + "px");  
                })          
        .on('mouseout.tooltip', function(d) {   
            div.transition()    
                .duration(100)    
                .style("opacity", 0); 
        }));
//    })
})
    


})

    
}