var monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
];
var stateNames = {"AGS":"AGUASCALIENTES","BC":"BAJA CALIFORNIA","BCS":"BAJA CALIFORNIA SUR",
                  "CAMP":"CAMPECHE",
                  "CHPS":"CHIAPAS","CHIH":"CHIHUAHUA","COAH":"COAHUILA","COL":"COLIMA","CDMX":"CIUDAD DE MEXICO","DGO":"DURANGO",
                  "GTO":"GUANAJUATO","GRO":"GUERRERO","HGO":"HIDALGO","JAL":"JALISCO","MEX":"MEXICO","MICH":"MICHOACAN","MOR":"MORELOS",
                  "NAY":"NAYARIT",
                  "NL":"NUEVO LEON","OAX":"OAXACA","PUE":"PUEBLA","QRO":"QUERETARO","QROO":"QUINTANA ROO","SLP":"SAN LUIS POTOSI",
                  "SIN":"SINALOA","SON":"SONORA","TAB":"TABASCO","TAM":"TAMAULIPAS","TLAX":"TLAXCALA",
                  "VER":"VERACRUZ","YUC":"YUCATAN","ZAC":"ZACATECAS"};
var Reds = ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"];
var round = d3.format(".1f");
var comma = d3.format(",");
var selection = d3.select("#hexmap");
var width = selection[0][0].clientWidth - 20;
var height = width*1;
var projection, path, legend;
var last_date, hexmap, national, selected_value = 'hd';

var vis = d3.select("#hexmap").append("svg")
        .attr("class", "OrRd")
        .attr("width", width).attr("height", height);

var createQuantized = function(domain) {
    return(d3.scale.quantize()
           .domain(domain)
           .range(d3.range(9).map(function(i) { return 'q' + i + "-9"; })));
};
national_chart = function(data, obj, target, title) {
    hom = JSON.parse(JSON.stringify(data))[obj];
    if (hom.length === 2) {
        hom[0] = MG.convert.date(hom[0], 'date');
        hom[1] = MG.convert.date(hom[1], 'date');
    } else {
        hom = MG.convert.date(hom, 'date');
    }
    MG.data_graphic({
        title: title,
        //description: "smoke weed every day",
        data: hom,
        area: false,
        interpolate: "linear",
        height: 180,
        width: 275,
        full_width: true,
        linked: true,
        right:10,
        left: 77,
        top: 25,
        buffer: 0,
        target: target,
        y_extended_ticks: true,
        show_secondary_x_label: false,
        small_text: false,
        x_accessor: 'date',
        y_accessor: 'rate',
        xax_count: 2,
        yax_count: 3,
        xax_format: d3.time.format('%b-%Y'),
        y_label: annualized_rate,
        mouseover: function(d, i) {
            var date = new Date(d.date);
            var day = d.date.getDate();
            var monthIndex = d.date.getMonth();
            var year = d.date.getFullYear();
            d3.select(target + ' svg .mg-active-datapoint')
                .text(monthNames[monthIndex] + '-' + year + rate_text + round(d.rate) + count_text + comma(d.count));
        },
    });
}

d3.json("/assets/json/mx_hexgrid.geojson", function(json) {
    d3.json("/assets/json/states_last.json", function(states_last) {
        d3.json('/assets/json/states.json', function(states) {
            format=d3.time.format('%b %Y')
            d3.select('#map-date').html('Map of Crime Rates - ' + format(d3.time.format('%Y-%m-%d').parse(states_last.hd[0].date)))


            last_date = states_last;
            hexmap = json;
            extent = d3.extent(states_last.hd, function(d) {return d.rate});
            quantize = createQuantized(extent);

            // create a first guess for the projection
            var center = d3.geo.centroid(json)
            var scale  = 130;
            var offset = [width/2, height/2];
            projection = d3.geo.mercator().scale(scale).center(center)
                .translate(offset);

            tip = d3.tip().attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    index = _.findIndex(states_last[selected_value], function(chr) {
                        return chr.state_code == d.properties.state_code;
                    });
                    return "<strong>" + states_last[selected_value][index].state + "</strong><br>" +
                        "<strong>"+rate+"</strong> <span style='color:white'>" + round(states_last[selected_value][index].rate) + "</span><br>" +
                        "<strong>"+count+"</strong> <span style='color:white'>" + states_last[selected_value][index].count + "</span><br>" +
                        "<strong>"+pop+"</strong> <span style='color:white'>" + comma(states_last[selected_value][index].population) + "</span><br>";
                });

            // create the path
            path = d3.geo.path().projection(projection);

            // using the path determine the bounds of the current map and use
            // these to determine better values for the scale and translation
            var bounds  = path.bounds(json);
            var hscale  = scale*width  / (bounds[1][0] - bounds[0][0]);
            var vscale  = scale*height / (bounds[1][1] - bounds[0][1]);
            var scale   = (hscale < vscale) ? hscale : vscale;
            var offset  = [width - (bounds[0][0] + bounds[1][0])/2,
                           height - (bounds[0][1] + bounds[1][1])/2];

            // new projection
            projection = d3.geo.mercator().center(center)
                .scale(scale * 0.89).translate(offset);
            path = path.projection(projection);
            vis.call(tip)
            vis.selectAll("path").data(json.features).enter().append("path")
                .attr("d", path)
                .attr("class", function(d) {
                    index = _.findIndex(states_last.hd, function(chr) {
                        return chr.state_code == d.properties.state_code;
                    });

                    return quantize(states_last.hd[index].rate);
                })
                .style("stroke-width", "1")
                .style("stroke", "black")


            vis.selectAll("text")
                .data(json.features)
                .enter()
                .append("svg:text")
                .text(function(d){
                    return d.properties.state_abbr;
                })
                .attr("x", function(d){
                    return path.centroid(d)[0];
                })
                .attr("y", function(d){
                    return  path.centroid(d)[1]+5;
                })
                .attr("text-anchor","middle")
                .attr('font-size','10pt');

            vis.append("g").selectAll("path").data(json.features).enter().append("path")
                .attr("d", path)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .on('click', function(d) {
                    d3.selectAll("#hexmap g path").style("stroke", "black").style("opacity", "0").style("stroke-width", "0")
                    d3.select(this).style("stroke", "black").style("opacity", "1").style("stroke-width", "4px")
                    national_chart({'hd': [_.filter(states.hd[0], {'state_code':d.properties.state_code}),
                                           _.filter(states.hd[1], {'state_code':d.properties.state_code})]}, 'hd', '#nat_hd', homicidio_doloso  + d.properties.state_abbr);
                    national_chart({'sec': _.filter(states.sec, {'state_code':d.properties.state_code})},'sec', '#nat_sec', secuestro + d.properties.state_abbr);
                    national_chart({'ext': _.filter(states.ext, {'state_code':d.properties.state_code})},'ext', '#nat_ext', extorsion + d.properties.state_abbr);
                    national_chart({'rvcv': _.filter(states.rvcv, {'state_code':d.properties.state_code})},'rvcv', '#nat_rvcv', rvcv + d.properties.state_abbr);
                    national_chart({'rvsv': _.filter(states.rvsv, {'state_code':d.properties.state_code})},'rvsv', '#nat_rvsv', rvsv + d.properties.state_abbr);
                    d3.select("#crime_charts").text(stateNames[d.properties.state_abbr])
                    change_small_multiples(selected_value);
                })
                .style("stroke-width", "1")
                .style("stroke", "transparent")
                .style("opacity", "0")
                .style("fill", "transparent")

            legend = d3.select('#legend')
                .append('ul')
                .attr('class', 'OrRd list-inline');

            var keys = legend.selectAll('li.key')
                    .data(quantize.range());

            keys.enter().append('li')
                .attr('class', 'key')
                .style('border-top-color', function(d, i) {
                    return Reds[i];
                })
                .text(function(d) {
                    var r = quantize.invertExtent(d);
                    return round(r[0]);
                });
        });
    });
});

create_national_charts = function() {
    national_chart(national, 'hd', '#nat_hd', homicidio_doloso + national_text);
    national_chart(national,'sec', '#nat_sec', secuestro + national_text);
    national_chart(national,'ext', '#nat_ext', extorsion + national_text);
    national_chart(national,'rvcv', '#nat_rvcv', rvcv + national_text);
    national_chart(national,'rvsv', '#nat_rvsv', rvsv + national_text);
}

d3.json('/assets/json/national.json', function(data) {
    national = data;
    create_national_charts();
    change_small_multiples(selected_value);
});

//d3.select(window).on('resize', resize);
d3.select('#reset').on('click', function(d) {
    create_national_charts();
    d3.select("#crime_charts").text(national_text)
    d3.selectAll("#hexmap g path").style("stroke", "black").style("opacity", "0").style("stroke-width", "0")
    change_small_multiples(selected_value);
})
function resize() {
    // adjust things when the window size changes
    width = parseInt(d3.select('#hexmap').style('width'));

    //width = width - margin.left - margin.right;
    height = width;

    // update projection
    projection
        .translate([width / 2, height / 2])
        .scale(width);

    // resize the map container
    vis
        .style('width', width + 'px')
        .style('height', height + 'px');

    // resize the map
    vis.select('path').attr('d', path);
}

$('#crimeSelect').on('change', function() {
    change_map(this.value); // or $(this).val()
    selected_value = this.value;
    change_small_multiples(selected_value);
});

change_small_multiples = function(selected_value) {
    d3.select("#nat_" + 'hd' + ' .mg-chart-title').style('color', '#555').style('background-color', '#B8E4E4').style('border-top-left-radius', '7px').style('border-top-right-radius', '7px');
    d3.select("#nat_" + 'ext' + ' .mg-chart-title').style('color', '#555').style('background-color', '#B8E4E4').style('border-top-left-radius', '7px').style('border-top-right-radius', '7px');
    d3.select("#nat_" + 'sec' + ' .mg-chart-title').style('color', '#555').style('background-color', '#B8E4E4').style('border-top-left-radius', '7px').style('border-top-right-radius', '7px');
    d3.select("#nat_" + 'rvcv' + ' .mg-chart-title').style('color', '#555').style('background-color', '#B8E4E4').style('border-top-left-radius', '7px').style('border-top-right-radius', '7px');
    d3.select("#nat_" + 'rvsv' + ' .mg-chart-title').style('color', '#555').style('background-color', '#B8E4E4').style('border-top-left-radius', '7px').style('border-top-right-radius', '7px');
    d3.select("#nat_" + selected_value + ' .mg-chart-title').style('color', 'white').style('background-color', 'black').style('border-top-left-radius', '7px').style('border-top-right-radius', '7px');
    d3.select("#nat_" + 'hd' + ' svg').style("background-image", "url(/assets/css/images/bg01-blue.png");
    d3.select("#nat_" + 'ext' + ' svg').style("background-image", "url(/assets/css/images/bg01-blue.png");
    d3.select("#nat_" + 'sec' + ' svg').style("background-image", "url(/assets/css/images/bg01-blue.png");
    d3.select("#nat_" + 'rvcv' + ' svg').style("background-image", "url(/assets/css/images/bg01-blue.png");
    d3.select("#nat_" + 'rvsv' + ' svg').style("background-image", "url(/assets/css/images/bg01-blue.png");
    d3.select("#nat_" + selected_value + ' svg').style("background-image", "url(/assets/css/images/bg01-brown.png");
}

change_map = function(value){
    extent = d3.extent(last_date[value], function(d) {return d.rate});
    quantize = createQuantized(extent);
    vis.selectAll("path")
        .attr("class", function(d) {
            index = _.findIndex(last_date[value], function(chr) {
                return chr.state_code == d.properties.state_code;
            });

            return quantize(last_date[value][index].rate);
        });
    //.style("stroke-width", "1")
    //.style("stroke", "black");

    legend.selectAll('li.key')
        .style('border-top-color', function(d, i) {
            return Reds[i];
        })
        .text(function(d) {
            var r = quantize.invertExtent(d);
            return round(r[0]);
        });
};
