function fractalLegend(id){

   
var petalColors = d3.scaleOrdinal()
    .range(['#FFB09E', '#CBF2BD', '#AFE9FF', '#FFC8F0', '#FFF2B4']);
const purple = '#2c2040';
const pink = '#bf6078';
const yellow = '#fad67d';
const colors = chroma.scale([purple, pink, yellow, pink, purple]).mode('hsl');
//const colorScale = d3.scaleLinear().domain([0, 7, 12, 19, 23]).range([0, 0.25, 0.5, 0.75, 0.96]);

let petalPaths = [
    [
      'M0 0',
      'C25 42 40 55 0 100',
      'C-25 55 -40 42 0 0'
    ],
    [
      'M0 0',
      'C50 25 50 75 0 100',
      'C-50 75 -50 25 0 0'
    ],
    [
    	'M0 0',
      'C50 50 50 100 0 100',
      'C-50 100 -50 50 0 0'
    ],
    [
      'M0 0',
      'C50 40 50 70 20 100',
      'L0 85',
      'L-20 100',
      'C-50 70 -50 40 0 0'
    ]
]

var leaf = [
      'M0 0',
      'C15 22 10 35 0 55',
      'C-15 35 -10 22 0 0'
    ];

var petalScale = d3.scaleOrdinal()
    	.domain(['fac_elem','wsc', 'esc','rlc'])
    	.range(_.range(4));
var flowerSizeScale = d3.scaleLinear()
    	.range([.05, .5]);

var colorScale = d3.scaleOrdinal()
    .domain([200,0])
     .range(chroma.scale([purple, pink, yellow, pink, purple]).colors(15));

    const colorBranch = d3.scaleOrdinal().domain([200,0]).range(chroma.scale(['#594d42', 
//                         '#808080', 
                         '#d4d4d4','#D9C99A', '#c77179', '#8c5b49', '#735C5C','#8c5b49','#c77179','#D9C99A','#d4d4d4',
//                        '#808080',
                         '#594d42']).colors(15));
    
    var colorBrick = d3.scaleOrdinal()
        .domain([200,0])
    .range(chroma.scale([
                '#8B0000','#B22222','#CD5C5C','#c77179', '#8c5b49', '#735C5C', '#8c5b49','#c77179','#CD5C5C','#B22222','#8B0000']).colors(15));
    
        var colorStone = d3.scaleOrdinal()
        .domain([200,0])
    .range(chroma.scale(['#594d42', 
                         '#808080', 
                         '#d4d4d4','#D9C99A', '#d4d4d4',
                        '#808080',
                         '#594d42']).colors(15));
    
     var colorOak = d3.scaleOrdinal()
        .domain([200,0])
    .range(chroma.scale(['#594d42', 
                         '#808080', 
                         '#8c5b49', '#735C5C','#8c5b49',
                        '#808080',
                         '#594d42']).colors(15));
    var colorSand = d3.scaleOrdinal()
        .domain([200,0])
        .range(chroma.scale(['#90826C','#A79C85','#BFB595','#F2F0D8','#BFB595','#A79C85','#90826C']).colors(15));

    
    var colorPick = function (branchL) {
            return colorScale(branchL)
        };
    var colorPickBrick = function (branchL) {
            return colorBrick(branchL)
        };
    var colorPickStone = function (branchL) {
            return colorStone(branchL)
        };
    var colorPickOak = function (branchL) {
            return colorOak(branchL)
        };
    var colorPickSand = d=>colorSand(d);


    

    
    var legendScale = d3.scaleOrdinal()
        .domain([200,0])
//     .range(chroma.scale([purple, pink, yellow, pink, purple]).colors(12));
    .range(['#da967a', '#efc17c', '#974f69', '#c46b78']);
    
    //petal legend
    var legend = d3.select(id);
    var legendPetalShapes= legend.append('g')
        .selectAll('g')
    .data(['fac elem','wsc', 'esc','rlc'])
    .enter().append('g')
    .attr('transform', function(d, i) {
          var x = i * (80 / 2) + 30;
          return 'translate(' + [x, 20] + ')scale(0.25)';
        });
    legendPetalShapes.append('path')
        .attr('fill', d=>legendScale(d))
        .attr('d', function(type) {
          return petalPaths[petalScale(type)];
        });
      legendPetalShapes.append('text')
      	.attr('y', 150)
      	.attr('text-anchor', 'middle')
      	.attr('fill', '#444')
      	.style('font-size', 14 / .4 + 'px')
      	.text(function(d) {return d});
    
    // size of flower 
      var legendPetalSizes = legend
      .append('g')
//      	.attr('transform',
//              'translate(' + [legendWidth / 2, flowerSize * .9 * 3] + ')')
      	.selectAll('g')
      	.data(['original','addition'])
      .enter()
      .append('g')
        .attr('transform', function(d, i) {
          var x = i * (100 / 2) + 210;
          return 'translate(' + [x, 30] + ')';
        });
      
      legendPetalSizes.selectAll('path')
        .data(function(d) {
        	var numPetals = 5;
        	var path = petalPaths[petalScale('wsc')];
          return _.times(numPetals, function(i) {
            return {
              scale: .20,
              angle: (360/numPetals) * i,
              path: path,
                type: d
            }
          });
        }).enter().append('path')
        .attr('stroke', function(d) {
          if (d.type==='original'){return '#fff'}
          else if (d.type==='addition') {return pink}
        })
        .attr('stroke-width', function(d) {
          if (d.type==='original'){return 0}
          else if (d.type==='addition') {return 7}
        })
        .attr('fill', function(d) {
          if (d.type==='original'){return pink}
          else if (d.type==='addition') {return 'none'}
        })
        .attr('d', function(d) {return d.path.join(' ')})
        .attr('transform', function(d) {
          return 'rotate(' + [d.angle] + ')scale(' + d.scale + ')';
        });
//      console.log(minRating,maxRating)
      legendPetalSizes.append('text')
        .attr('transform', 'translate(0,25)scale(0.25)')
      	.attr('y', 100 / 2)
      	.attr('dy', '.35em')
      	.attr('text-anchor', 'middle')
      	.attr('fill', '#444')
//      	.style('font-size', 12)
    .style('font-size', 14 / .4 + 'px')
        .text(d=>d);
    


}