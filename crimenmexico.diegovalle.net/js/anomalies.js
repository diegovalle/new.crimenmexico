var selected_value = 'hd', muns;
         var monthNames = [
             "Jan", "Feb", "Mar",
             "Apr", "May", "Jun", "Jul",
             "Aug", "Sep", "Oct",
             "Nov", "Dec"
         ];
         var round = d3.format(".1f");
         var format=d3.time.format('%b %Y');
             var draw_line_chart = function(crime_type, id){
                 groups=_.groupBy(muns[crime_type], function(x) {return x.name;});
                 byrate = _.map(groups, function(g, key) {
                     return { name: key,
                              rate: _.reduce(g, function(m,x) { return (x.rate === null ? m : x.rate); }, 0) };
                 });
                 muns_ordered = _.pluck(_.sortBy(byrate, "rate"), "name").reverse();

                 _.map(muns_ordered, function(x) {
                     if (document.getElementById('line' + x.replace(/ |\./g, '')
                                                           .replace(/,/g, '')) === null) {
                                                               $('<div  class="3u 12u(mobile)" ><div class =' + id + ' id="'+ 'line' + x.replace(/ |\./g, '')
                                                                                                                                        .replace(/,/g, '') + crime_type +'"></div></div>').appendTo(id);
                     }
                 });
                 $('.' + id.replace(/#/g, '')).each(function(index, obj){
                     $(obj).attr('id', 'line' + muns_ordered[index].replace(/ |\./g, '')
                                                                   .replace(/,/g, ''));
                 });


                 var filterCrime = function(data, name) {
                     data = _.filter(data, { 'name': name });
                     if (typeof(data[0].date) !== 'object')
                         data = MG.convert.date(data, 'date');
                     return(data);
                 };
                 max_rate = _.max(muns[crime_type], 'rate')['rate'];
                 var markers = [{
                     'date': new Date('Mon Jun 01 2015 00:00:00 GMT-0600 (CST)'),
                     'label': 'Anomaly'
                 }];

                 var line_chart = function(data, title, target) {
                     var line_options = {
                         height: 150,
                         //max_y: max_rate,
                         area: false,
                         full_width: true,
                         left: 60,
                         buffer: 0,
                         show_year_markers: true,
                         show_secondary_x_label: false,
                         // width:281,
                         //missing_is_hidden: true,
                         interpolate: "linear",
                         //y_scale_type: 'log',
                         x_accessor: 'date',
                         y_accessor: 'rate',
                         small_text: true,
                         xax_count: 3,
                         xax_format: d3.time.format('%Y'),
                         yax_count: 3,
                         y_extended_ticks: true,
                         y_label: annualized_rate,
                         mouseover: function(d, i) {
                             var date = new Date(d.date);
                             var day = d.date.getDate();
                             var monthIndex = d.date.getMonth();
                             var year = d.date.getFullYear();
                             d3.select("#line" + target.replace(/ |\./g, '')
                                                       .replace(/,/g, '') + crime_type+ ' svg .mg-active-datapoint')
                               .text(monthNames[monthIndex] + '-' + year + rate_text + round(d.rate) + count_text + d.count);
                         },
                     };
                     line_options.data = line_values;
                     line_options.title = title.split(",")[0].substring(0, 14) + ', ' + title.split(",")[1];
                     line_options.target = "#line" + target.replace(/ |\./g, '')
                                                           .replace(/,/g, '') + crime_type;
                     MG.data_graphic(line_options);
                 };
                 //console.time("concatenation");
                 _.forEach(muns_ordered, function(x) {
                     line_values = filterCrime(muns[crime_type], x);
                     line_chart(line_values, x, x);
                     return;
                 });
             };



         d3.json('/assets/json/estatal.json', function(mx){
             d3.json('/assets/json/cities.json', function(cities) {

                 draw_map = function(id, crime) {
                     if (typeof(cities[crime]) === "undefined") {
                         return;
                     };
                     var selection = d3.select(id);
                     var width = selection[0][0].clientWidth - 20;
                     var height = width*1;
                     // new projection
                     var center = d3.geo.centroid(topojson.feature(mx, mx.objects.collection));
                         var scale  = 130;
                     var offset = [width/2, height/2];
                     var vis = d3.select(id).append("svg")
                                 .attr("class", "OrRd")
                                 .attr("width", width).attr("height", height);

                     var projection = d3.geo.mercator().scale(scale).center(center)
                                        .translate(offset);
                     var path = d3.geo.path().projection(projection);
                     // using the path determine the bounds of the current map and use
                     // these to determine better values for the scale and translation
                     var bounds  = path.bounds(topojson.feature(mx, mx.objects.collection));
                     var hscale  = scale*width  / (bounds[1][0] - bounds[0][0]);
                     var vscale  = scale*height / (bounds[1][1] - bounds[0][1]);
                     var scale   = (hscale < vscale) ? hscale : vscale;
                     var offset  = [width - (bounds[0][0] + bounds[1][0])/2,
                                    height - (bounds[0][1] + bounds[1][1])/2];


                     projection = d3.geo.mercator().center(center)
                                    .scale(scale*0.89).translate(offset);
                     path = path.projection(projection);

                     //Group for the map features
                     var features = vis.append("g")
                                       .attr("class","features");

                     //Create zoom/pan listener
                     //Change [1,Infinity] to adjust the min/max zoom scale
                     var zoom = d3.behavior.zoom()
                                  .scaleExtent([1, Infinity])
                                  .on("zoom",zoomed);

                     vis.call(zoom);
                     //Update map on zoom/pan
                     function zoomed() {
                         features.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")")
                                 .selectAll("path").style("stroke-width", 0.5 / zoom.scale() + "px" );
                     }

                     features.selectAll("path")
                                 .data(topojson.feature(mx,mx.objects.collection).features).enter()
                                 .append("path")
                                 .attr("d",path);

                     max_count = _.max(cities[crime], 'count')['count'];
                     min_count = _.min(cities[crime], 'count')['count'];
                     var radius = d3.scale.sqrt()
                                    .domain([min_count, max_count])
                                    .range([4, 8]);
                     var cellnum = min_count == max_count ? 1 : min_count + 1 == max_count ? 2 : 3;
                     var sizeLegend = d3.legend.size()
                                        .labelFormat(d3.format(".0f"))
                                        .scale(radius)
                                        .shape("circle")
                                        .shapePadding(3)
                                        .cells(cellnum)
                                        .labelOffset(10);
                     vis.append("g")
                        .attr("transform", "translate(" + String(width - 60) + ", 60)")
                        .call(sizeLegend);

                     tip = d3.tip().attr('class', 'd3-tip')
                             .offset([-10, 0])
                             .html(function(d) {
                                 return "<strong>" + d.name + "</strong><br>" +
                                        "<strong>"+rate+"</strong> <span style='color:white'>" + round(d.rate) + "</span><br>" +
                                        "<strong>"+count+"</strong> <span style='color:white'>" +d.count + "</span><br>";
                             });
                     vis.call(tip);

                         features.append("g")
                        .attr("class", "bubble").selectAll("circle")
                        .data(cities[crime]).enter()
                        .append("circle")
                        .attr("cx", function (d) {
                            return projection([d.long, d.lat])[0];
                        })
                        .attr("cy", function (d) { return projection([d.long, d.lat])[1]; })
                        .attr("r", function(d) { return radius(d.count); })
                        .on('mouseover', tip.show)
                        .on('mouseout', tip.hide);
                 };
                 draw_map("#hom-map", "hom");
                 draw_map("#rvcv-map", "rvcv");
                 draw_map("#rvsv-map", "rvsv");
                 draw_map("#lesions-map", "lesions");
                 draw_map("#kidnapping-map", "kidnapping");
                 draw_map("#ext-map", "ext");
                 draw_map("#reos-map", "reos");
             });
         });

         $( window ).load(function() {
             d3.json('/assets/json/anomalies.json', function(data) {
                 muns = data;
                 if (muns['hom'].length !== 0) {
                     d3.select('#hom').text(int_homicide).style('padding', '10px');
                     draw_line_chart('hom', '#small-multiples-hom');
                 }
                 if (muns['rvcv'].length !== 0) {
                     d3.select('#rvcv').text(crwv).style('padding', '10px');
                     draw_line_chart('rvcv', '#small-multiples-rvcv');
                 }
                 if (muns['rvsv'].length !== 0) {
                     d3.select('#rvsv').text(crwov).style('padding', '10px');
                     draw_line_chart('rvsv', '#small-multiples-rvsv');
                 }
                 if (muns['lesions'].length !== 0) {
                     d3.select('#lesions').text(int_lesions).style('padding', '10px');
                     draw_line_chart('lesions', '#small-multiples-lesions');
                 }
                 if (muns['kidnapping'].length !== 0) {
                     d3.select('#kidnapping').text(kidnappings).style('padding', '10px');
                     draw_line_chart('kidnapping', '#small-multiples-kidnapping');
                 }
                 if (muns['ext'].length !== 0) {
                     d3.select('#ext').text(extortions).style('padding', '10px');
                     draw_line_chart('ext', '#small-multiples-ext');
                 }
                 if (muns['reos'].length !== 0) {
                     d3.select('#reos').text(reos).style('padding', '10px');
                     draw_line_chart('reos', '#small-multiples-reos');
                 }

             });

             $('#crimeSelect').on('change', function() {
                 selected_value = this.value;
                 $("body").addClass("loading");
                 draw_line_chart();
                 $("body").removeClass("loading");
             });
         });
