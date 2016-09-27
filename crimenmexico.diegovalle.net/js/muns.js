var selected_value = 'hd', muns;
         var monthNames = [
             "Jan", "Feb", "Mar",
             "Apr", "May", "Jun", "Jul",
             "Aug", "Sep", "Oct",
             "Nov", "Dec"
         ];
         var round = d3.format(".1f");
         var format=d3.time.format('%b %Y');
         var draw_line_chart = function(muns){
             var createChartDivs = function(muns) {
                 groups=_.groupBy(muns, function(x) {return x.name});
                 byrate = _.map(groups, function(g, key) {
                     return { name: key,
                              rate: _.reduce(g, function(m,x) { return (x.rate === null ? m : x.rate); }, 0) };
                 });
                 muns_ordered = _.pluck(_.sortBy(byrate, "rate"), "name").reverse();

                 _.map(muns_ordered, function(x) {
                     if (document.getElementById('line' + x.replace(/ |\./g, '')
                                                           .replace(/,/g, '')) === null) {
                                                               $('<div  class="3u 12u(mobile)" ><div style="width:100%" class ="line-chart" id="'+ 'line' + x.replace(/ |\./g, '')
                                                                                                                                                             .replace(/,/g, '') +'"></div></div>').appendTo('#small-multiples');
                     }
                 });
                 $('.line-chart').each(function(index, obj){
                     if(typeof muns_ordered[index] !== "undefined")
                       $(obj).attr('id', 'line' + muns_ordered[index].replace(/ |\./g, '')
                                                                   .replace(/,/g, ''));
                 });
                 return(muns_ordered)
             };
             if (muns[selected_value].length === 2) {
                 muns_ordered = createChartDivs(muns[selected_value][0]);
                 /* max_rate = _.max([_.max(muns[selected_value][0], 'rate')['rate'],
                    _.max(muns[selected_value][1], 'rate')['rate']]);
                  */
                 max_rate = _.max(muns[selected_value][0], 'rate')['rate'];
             } else {
                 muns_ordered = createChartDivs(muns[selected_value]);
                 max_rate = _.max(muns[selected_value], 'rate')['rate'];
             }
             var filterCrime = function(data, name) {
                 if (data.length === 2) {
                     data = [ _.filter(data[0], { 'name': name }),
                              _.filter(data[1], { 'name': name })];
                     if (typeof(data[0][0].date) !== 'object') {
                         data[0] = MG.convert.date(data[0], 'date');
                         data[1] = MG.convert.date(data[1], 'date');
                     }
                 } else {
                     data = _.filter(data, { 'name': name });
                     if (typeof(data[0].date) !== 'object')
                         data = MG.convert.date(data, 'date');
                 }

                 return(data)
             };

             var line_chart = function(data, title, target) {
                 var line_options = {
                     height: 150,
                     max_y: max_rate,
                     area: false,
                     full_width: true,
                     left: 70,
                     buffer: 0,
                     // width:281,
                     //missing_is_hidden: true,
                     interpolate: "linear",
                     x_accessor: 'date',
                     y_accessor: 'rate',
                     small_text: true,
                     xax_count: 3,
                     xax_format: d3.time.format('%b'),
                     y_extended_ticks: true,
                     y_label: annualized_rate,
                     mouseover: function(d, i) {
                         var date = new Date(d.date);
                         var day = d.date.getDate();
                         var monthIndex = d.date.getMonth();
                         var year = d.date.getFullYear();
                         d3.select("#line" + target.replace(/ |\./g, '')
                                                   .replace(/,/g, '') + ' svg .mg-active-datapoint')
                           .text(monthNames[monthIndex] + '-' + year + rate_text + round(d.rate) + count_text + d.count);
                     },
                 };
                 line_options.data = line_values;
                 line_options.title = title;
                 line_options.target = "#line" + target.replace(/ |\./g, '')
                                                       .replace(/,/g, '');
                 MG.data_graphic(line_options);
             }
             //console.time("concatenation");
             _.forEach(muns_ordered, function(x) {
                 line_values = filterCrime(muns[selected_value], x);
                 line_chart(line_values, x, x)
                     return
             });
         };
         $( window ).load(function() {
             d3.json('/assets/json/municipios.json', function(data) {
                 muns = data;
                 draw_line_chart(muns);


             });

             $('#crimeSelect').on('change', function() {
                 selected_value = this.value;
                 $("body").addClass("loading");
                 draw_line_chart(muns);
                 $("body").removeClass("loading");
             });
         });
