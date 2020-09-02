function fractal(dataset, width, height, frameId){

var margin = {top: 10, left: 10, bottom: 10, right: 10},
    width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom;
   
var petalColors = d3.scaleOrdinal()
    .range(['#FFB09E', '#CBF2BD', '#AFE9FF', '#FFC8F0', '#FFF2B4']);
const purple = '#2c2040';
const pink = '#bf6078';
const yellow = '#fad67d';
const colors = chroma.scale([purple, pink, yellow, pink, purple]).mode('hsl');


const ratio1 = .72, //.67
    ratio2 = .72, //.67
    angle1 = 40, //40
    angle2 = 30, //20
    myLength = 80, //150
    myWidth = 6 
    
var treeLine = function (x0, y0, x, y, l, angle) {
    this.x0 = x0;
    this.y0 = y0;
    this.x = x;
    this.y = y;
    this.len = l;
    this.angle = angle
};

var toRadians = function (angle) {
    return angle * (Math.PI/180);
}

var treeLines = function (starting, ratio1, ratio2, angle1, angle2) {
    x1 = starting.x;
    y1 = starting.y;
    theta = starting.angle;
    draw_len = starting.len;

    x21 = x1 + ratio1*draw_len*Math.cos(toRadians(theta - angle1));
    y21 = y1 + ratio1*draw_len*Math.sin(toRadians(theta - angle1));


    line1 = new treeLine(x1, y1, x21, y21, ratio1*draw_len, theta - angle1)

    x22 = x1 + ratio2*draw_len*Math.cos(toRadians(theta + angle2));
    y22 = y1 + ratio2*draw_len*Math.sin(toRadians(theta + angle2));

    line2 = new treeLine(x1, y1, x22, y22, ratio2*draw_len, theta + angle2)

    return [line1, line2];

};

var nextLines = function (starting, ratio1, ratio2, angle1, angle2) {
    x1 = starting.x;
    y1 = starting.y;
    theta = starting.angle;
    draw_len = starting.len;

    x21 = x1 + ratio1*draw_len*Math.cos(toRadians(theta - angle1));
    y21 = y1 + ratio1*draw_len*Math.sin(toRadians(theta - angle1));

    line1 = new treeLine(x1, y1, x21, y21, ratio1*draw_len, theta - angle1)

    return line1;
};
    
var nextLines2 = function (starting, ratio1, ratio2, angle1, angle2) {
    x1 = starting.x;
    y1 = starting.y;
    theta = starting.angle;
    draw_len = starting.len;

    x22 = x1 + ratio2*draw_len*Math.cos(toRadians(theta + angle2));
    y22 = y1 + ratio2*draw_len*Math.sin(toRadians(theta + angle2));

    line2 = new treeLine(x1, y1, x22, y22, ratio2*draw_len, theta + angle2)

    return line2;
};

const treeFrame = [];
    
var buildTree = function (depth, ratio1, ratio2, angle1, angle2, widthT, lengthT) {
    var root = new treeLine(width/2, height-25, width/2, height-25-lengthT, lengthT, -90);
    var lines = [root];
    var leaves = [root];
    
    for (var i = 0; i<=depth; i++){
        var newLeaves = [];
        for (var seed in leaves) {
    
            var newLines = treeLines(leaves[seed], ratio1, ratio2, angle1, angle2);
            for (var addons in newLines) {
                lines.push(newLines[addons]);
                newLeaves.push(newLines[addons]);
            }
        }
        leaves = newLeaves.slice();
    }
    treeFrame.branches = _.chain(lines)
        .value();
}
var tree = buildTree(6, ratio1, ratio2, angle1, angle2, myWidth, myLength);


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
    
d3.csv(dataset, function(data) {
    console.log(data)
//    console.log(treeFrame)
    
    const allBldgs = _.chain(data)
    .groupBy(t=>t.building_name)
    .map(function(t){
        return {
            building_name: t[0].building_name,
            allFacElements: t,
            year: parseInt(t[0].year_add),
            location: t[0].location,
            region: t[0].region
        }
    }).sort(function(a, b) {return a.year - b.year;})
    .value();
    
    _.each(allBldgs, function(bldg, key, allBldgs){
//        console.log(bldg)
        bldg.facades = _.chain(bldg.allFacElements)
            .groupBy(t=> t.facade_number)
            .map(function(t){
                return {
                    building_name: t[0].building_name,
                    elements: t,
                    facade_number: t[0].facade_number,
                    element_count: t.length
                };
            }).sort(function(a, b) {
              if (b.facade_number < a.facade_number) {
                return -1;
              }
              if (b.facade_number > a.facade_number) {
                return 1;
              }
              return 0;
            })
            .value();
        _.each(bldg.facades, function(fac, i){
//            console.log(fac)
            fac.compositions = _.chain(fac.elements)
            .groupBy(function(t){
                return t.comp_num
            })
            .map(function(t){
                return {
                    comp_type: t[0].comp_type,
                    comp_num: t[0].comp_num,
                    elements: t,
                    comp_quant: t.length,
                    size: parseInt(t[0].TS_quant),
                    building_name: t[0].building_name,
                    year_add: t[0].year_add,
                    facade_number: t[0].facade_number,
                    orig: t[0].orig,
                    materials_all: t[0].materials_all
                };
            }).sort((a,b) => a.elem_count - b.elem_count)
            .value();
            
            let node1 = bldg.facades.map(d=>d.elements)
            let nodesElem = _.flatten(node1)
            let node2 = fac.compositions
            let nodesComp = _.flatten(node2)

            let nodesAll = [];
            _.each(nodesComp, function(link, k){
                nodesAll.push(link)
                 _.each(nodesElem, function(node, l){
                if (link.comp_num === node.comp_num && link.facade_number === node.facade_number){
                        nodesAll.push(node)
                    }
                })
            })
            fac.allNodes = nodesAll
            
            _.each(fac.compositions, function(comp, n){
                comp.nodeId = n
                comp.parentId = null
                _.each(comp.elements, function(elem){
                    elem.parentId = n
                    elem.nodeId = "null"
                })
            })
            
            _.each(fac.allNodes, function(element, k){
               if (k === 0) {
                    const rootStart = treeFrame.branches[0]
                    const lines = rootStart;
                    element.branch = lines
                }
                if (k > 0){
                    if (element.parentId === null && element.nodeId !== null && fac.facade_number === element.facade_number){
                        element.branch = treeFrame.branches[k]
                        }
                    else if (element.parentId !== null && fac.facade_number === element.facade_number){
                        element.branch = treeFrame.branches[k]
                    }
                 }
            })
            
            fac.treelines = []
            _.each(fac.allNodes, function(tree, t){
                fac.treelines.push(tree.branch)
            })
            
        })
    });
    
    _.each(allBldgs, function(bldg, b){
        _.each(bldg.facades, function(fac, f){
            _.each(fac.allNodes, function(node){
                if (node.parentId === null){
                    node.parentx = node.branch.x
                    node.parenty = node.branch.y
                } else {
                    node.parentx = fac.compositions[node.parentId].branch.x
                    node.parenty = fac.compositions[node.parentId].branch.y
                }
                
            })
        })
    });

    console.log(allBldgs)
///////////////////////////////////
///////////////////////////////////
    


    
    var colorScale = d3.scaleOrdinal()
        .domain([200,0])
     .range(chroma.scale([purple, pink, yellow, pink, purple]).colors(15));

    const colorBranch = d3.scaleOrdinal().domain([200,0]).range(chroma.scale(['#594d42', 
//                         '#808080', 
                         '#d4d4d4','#D9C99A', '#c77179', '#8c5b49', '#735C5C','#8c5b49','#c77179','#D9C99A','#d4d4d4',
//                        '#808080',
                         '#594d42']).colors(15));
    
    var colorBasalt = d3.scaleOrdinal().domain([200,0]).range(chroma.scale(['#110c08', '#211610', '#2c201a', '#362a24', '#3f3631', '#48413c', '#534d48', '#5f5854', '#6b6461']).colors(9))
    
    var colorBrick = d3.scaleOrdinal()
        .domain([200,0])
    .range(chroma.scale([
                '#8B0000','#B22222','#CD5C5C','#c77179','#c77179','#CD5C5C','#B22222','#8B0000']).colors(15));
//        .range(chroma.scale([
//                '#8B0000','#B22222','#CD5C5C','#c77179', '#8c5b49', '#735C5C', '#8c5b49','#c77179','#CD5C5C','#B22222','#8B0000']).colors(15));
    
    var colorYellowBrick = d3.scaleOrdinal()
        .domain([200,0])
        .range(chroma.scale([
                '#d38f50', '#cea25e', '#d4b072', '#dabd88', '#e3c997', '#ecd7a4', '#f3e4b6', '#faf1ca', '#ffffe0']).colors(15));
    
    var colorGlass = d3.scaleOrdinal().domain([200,0]).range(chroma.scale(['#828f9a', '#8e99a3', '#98a4ae', '#a1afbb', '#b1b9c0', '#bec3c8', '#cbced2', '#d7d9dc', '#e3e4e7']).colors(9))
    
        var colorStone = d3.scaleOrdinal()
        .domain([200,0])
    .range(chroma.scale(['#594d42', 
                         '#808080', 
                         '#d4d4d4','#D9C99A', '#d4d4d4',
                        '#808080',
                         '#594d42']).colors(15));
    
     var colorOak = d3.scaleOrdinal()
        .domain([200,0])
        .range(chroma.scale(['#594d42','#8c5b49', '#735C5C','#8c5b49','#594d42']).colors(15));
    var colorSand = d3.scaleOrdinal()
        .domain([200,0])
    .range(chroma.scale(['#90826C','#A79C85','#BFB595','#F2F0D8','#BFB595','#A79C85','#90826C']).colors(15));
    
    var colorBrownSand = d3.scaleOrdinal().domain([200,0]).range(chroma.scale(['#9b8172', '#9e8475', '#a28776', '#9f8c82', '#a09088', '#a3938c', '#a7968e']).colors(7))
    

    
    var colorPick = function (branchL) {
            return colorScale(branchL)
        };
    var colorPickBasalt = function (branchL) {
            return colorBasalt(branchL)
        };
    var colorPickBrick = function (branchL) {
            return colorBrick(branchL)
        };
    var colorPickYellowBrick = function (branchL) {
        return colorYellowBrick(branchL)
    };
   var colorPickGlass = function (branchL) {
        return colorGlass(branchL)
    };
    var colorPickStone = function (branchL) {
        return colorStone(branchL)
    };
    var colorPickBrownSand = function (branchL) {
        return colorBrownSand(branchL)
    };
    var colorPickOak = function (branchL) {
            return colorOak(branchL)
        };
    var colorPickSand = d=>colorSand(d);

    var widthScale = d3.scaleLinear()
        .domain([myLength, 0])
        .range([myWidth, 2]);
    
    var radius = 10;
    var widthTree = 300;
    var perRow = 4;
    
   const svg = d3.select(frameId)
   .attr('width', 1200)
    .attr('height', 7250);

    const svgBldg = svg.selectAll('svg')
        .data(allBldgs)
        .enter().append('svg')
        .attr('class', 'buildings')
        .attr('y', function(d,i){
            return (i * 350)
        })
        .attr('transform', function(d,i){
            return 'translate(0,' + (i * 300) + ')'
        });
    
     //add building label
    const svgLabel = svgBldg.append('text')
        .attr('y', height-280)
        .attr('x', width-300)
//        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .style('font-weight', 600)
      	.attr('dy', '.35em')
        .text(d=>d.building_name + ' ('+ d.year +')' );
    
    const trees = svgBldg.selectAll('g')
        .data(d=>d.facades)
        .enter().append('g')
        .attr('transform', function(d, i) {
            return 'translate(' + ((i % perRow) * widthTree) + ',0)'
          });
   
    const branch = trees.selectAll('.trees')
        .data(d=>d.treelines)
        .enter()
        .append('svgBldg:path')
        .attr('d', d => `M${d.x0},${d.y0} Q${p5.prototype.randomGaussian((d.x0+ d.x) / 2, 3)},${p5.prototype.randomGaussian((d.y0 + d.y) / 2, 3)} ${d.x},${d.y}`)
        .attr('stroke-width', function (d) { return widthScale(d.len); })
        .attr('class', 'branch')
        .attr('stroke', function (d) { return colorBranch(d.len); })
        .attr('fill', 'none')
    ;
    

    const leaves = trees.selectAll('g .leaf')
        .data(d=>d.allNodes)
        .enter().append('g')
        .attr('class', 'leaf')
        .attr('stroke', d => {
                if (d.materials_all ==="red brick" || d.materials_all==="brick" || d.materials_all==="copper"){
                    return colorPickBrick(d.x)
                } else if (d.materials_all==="stone" || d.materials_all==="portland stone" || d.materials_all==="limestone"){
                    return colorPickStone(d.x)
                }else if (d.materials_all==="oak" || d.materials_all==="wood"){
                    return colorPickOak(d.x)
                }else if (d.materials_all==="sandstone"){
                    return colorPickSand(d.x)
                }else if (d.materials_all==="yellow brick"){
                    return colorPickYellowBrick(d.x)
                }else if (d.materials_all==="basalt"){
                    return colorPickBasalt(d.x)
                }else if (d.materials_all==="brown sandstone"){
                    return colorPickBrownSand(d.x)
                }else if (d.materials_all==="glass" || d.materials_all==="plate glass"){
                    return colorPickGlass(d.x)
                }else {
                    return colorPick(d.branch.x)
    //                return "red"
                }
        })
        .on('mouseover.links', showLinks('block'))
        .on('mouseout.links', showLinks('none'))
        .attr('transform', function(d) {
              var cx = d.branch.x;
              var cy = d.branch.y;
              return 'translate(' + [cx, cy] +
                ')rotate(' + [p5.prototype.randomGaussian((d.branch.angle-20),6)] + ')scale(.20)';
            }) ;

    leaves.selectAll('path .leaf')
        .data(function(d){
            let numPetals = parseInt(d.comp_quant);
            let path = petalPaths[petalScale(d.comp_type)];
            return _.times(numPetals, function(i){
                return {
                scale: flowerSizeScale(parseInt(d.size)),
                angle: (360/numPetals) *i,
                path: path,
                year: d.year_add, materials_all: d.materials_all, x: d.branch.x,
                facade_number: d.facade_number, orig:d.orig
                }
            });
        })
        .enter().append('path')
        .attr('class', 'petal')
        //        .attr('stroke', '#F8F8FF')
        .attr('stroke-width', function(d) {
            if (d.orig==='TRUE' ){ return 0;}
            else{return 7;}
        })
        .attr('fill', function(d){
            if (d.orig==='TRUE' ){
                if (d.materials_all ==="red brick" || d.materials_all==="brick" || d.materials_all==="copper"){
                    return colorPickBrick(d.x)
                } else if (d.materials_all==="stone" || d.materials_all==="portland stone" || d.materials_all==="limestone"){
                    return colorPickStone(d.x)
                }else if (d.materials_all==="oak" || d.materials_all==="wood"){
                    return colorPickOak(d.x)
                }else if (d.materials_all==="sandstone"){
                    return colorPickSand(d.x)
                }else if (d.materials_all==="yellow brick"){
                    return colorPickYellowBrick(d.x)
                }else if (d.materials_all==="basalt"){
                    return colorPickBasalt(d.x)
                }else if (d.materials_all==="brown sandstone"){
                    return colorPickBrownSand(d.x)
                }else if (d.materials_all==="glass" || d.materials_all==="plate glass"){
                    return colorPickGlass(d.x)
                }else {
                    return colorPick(d.x)
    //                return "red"
                }
            } else {
                return '#FFF';
            }
            
        })
        .attr('d', function(d) {return d.path.join(' ')})
        .attr('transform', function(d) {
            return 'rotate(' + [d.angle] + ')';
        })
//        .on('click', d=>{console.log(d);})
    ;
    
    //add links between composition elements
    const links = trees.selectAll('g .links')
        .data(d=>d.allNodes)
        .enter().append('g')
        .attr('class', 'links')
        .style('display', 'none');
    
    links.selectAll('circle .links')
        .data(function(d){
            return _.times(1, function(i){
                return {
                x: d.branch.x, x0:d.branch.x0, y:d.branch.y, y0:d.branch.y0
                }
            });
        })
        .enter()
        .append('circle')
        .attr('r', 3)
        .attr('fill', 'red')
        .attr('cx', function(d) { return (d.x); })
        .attr('cy', function(d) { return (d.y); });
    
    links.selectAll('path .links')
        .data(function(d){
            let numPetals = parseInt(d.comp_quant);
            return _.times(numPetals, function(i){
                return {
                x: d.branch.x, x0:d.parentx, y:d.branch.y, y0:d.parenty
                }
            });
        })
        .enter().append('path')
        .attr('d', linkArc)
        .attr('fill', 'none')
        .attr('stroke-width', '1.5px')
        .attr('stroke-dasharray','10,10')
        .attr('stroke', 'red');
    
    //add building label
    const labels = trees.append('text')
        .attr('class', 'label')
        .attr('y', height-15)
        .attr('x', width/2)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
      	.attr('dy', '.35em')
        .text(d=>d.facade_number);
    
    const title = d3.select('#title')
    const composition = d3.select('#composition')
    const content = d3.select('#content');

    leaves.on('click', function(d) {
        console.log(d)
        let currentComp = d.comp_num;
            console.log(currentComp)
            svg.selectAll('g .leaf')
//            .filter(l=>(l.comp_num === currentComp ))
            .style('opacity', function(o) {
                if (o.comp_num === currentComp){
                    return 1;
                } else return 0.3;
               
            });
            svg.selectAll('.branch')
            .style('opacity', function(o) {
                if (o.comp_num === currentComp){
                    return 0.3;
                } else return 0.3;
            });
        var buildingName = d.building_name;
        var name = title.selectAll('.name');
        title.enter().append('div').attr('class', 'name');
        title.exit().remove();
        title.selectAll('div').remove();
        title.append('div').text(buildingName);
        
        var compNum = d.comp_num;
        var TS_amt = d.size;
        var year = d.year_add;
        var facade_num = d.facade_number;
//        console.log(compNum, TS_amt, year)
//        
        var comp = composition.selectAll('.comp');
        composition.enter().append('div').attr('class', 'comp');
        composition.exit().remove();
        composition.selectAll('div').remove();
        composition.append('div').text('Year: ' + year);
        composition.append('div').text('Facade: ' + facade_num);
        composition.append('div').text('Composition: ' + compNum + ' (' + TS_amt + ')');
        
        console.log(d.comp_num)
      
        var arch_elem = content.selectAll('.element')
            .data(d.elements);
        arch_elem.enter().append('div').attr('class', 'element');
        arch_elem.exit().remove();
        
        arch_elem.selectAll('div').remove();
        arch_elem.append('div')
            .text( d=>d.architectural_element + ': ' + d.AE_type + ' (' + d.materials_all + ', ' + d.comp_quant + ')'
            );
    });
    
    const fadeOff = d3.select('body');
    fadeOff.on('dblclick', function(d) {
        let deselect = fadeOff.selectAll('svg');
        deselect.selectAll('g .leaf')
            .style('opacity', function(o) {
                return 1;
               
               });
        deselect.selectAll('.branch')
            .style('opacity', function(o) {
                 return 1;
               
               });
        var name = title.selectAll('.name');
        title.selectAll('div').remove();
        var comp = composition.selectAll('.comp');
        composition.selectAll('div').remove();
        var arch_elem = content.selectAll('.element');
        arch_elem.selectAll('div').remove();
    })
    
    function linkArc(d) {
      var dx = d.x - d.x0,
          dy = d.y - d.y0,
          dr = Math.sqrt(dx * dx + dy * dy);
      return 'M' + d.x0 + ',' + d.y0 + 'A' + dr + ',' + dr + ' 0 0,1 ' + d.x + ',' + d.y;
    }


    function fade(opacity) {
        return d => {
           let currentComp = d.comp_num;
//            console.log(currentComp)
            svg.selectAll('g .leaf')
//            .filter(l=>(l.comp_num === currentComp ))
            .style('opacity', function(o) {
                if (o.comp_num === currentComp){
                    return 1;
                } else return opacity;
               
               });
            svg.selectAll('.branch')
            .style('opacity', function(o) {
                if (o.comp_num === currentComp){
                    return 1;
                } else return opacity;
               
               });
        }}
    
     function showLinks(display) {
        return d => {
           let currentComp = d.comp_num;
//            console.log(currentComp)
            svg.selectAll('g .links')
            .filter(l=>(l.comp_num === currentComp ))
            .style('display', function(o) {
               return display;
               }); 
        }}
       

//    
});

}