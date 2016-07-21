var partialURL = 'http://localhost:8000';
var i;
var errors = [];

casper.test.begin(
    'Visit crimenmexico pages and check for errors',
    1,
    function suite(test) {
        casper.start(partialURL + '/en/', function() {
            test.assertTitle('Mexico Crime Report - Monthly Crime Info from Mexico',
                             'homepage title is the one expected');
            test.assertExists('svg g path', 'chart exists');
            test.assertEval(function() {
                return __utils__
                    .findAll('.national-chart').length === 5;
            }, '/en/ 5 charts of crime');
            test.assertEval(function() {
                return __utils__
                    .findAll('svg > path.mg-line2-color').length === 1;
            }, '/en/ 1 line of INEGI homicides');
            test.assertEval(function() {
                return __utils__
                    .findAll('svg > path.mg-line1-color').length === 5;
            }, '/en/ 5 lines of SESNSP crimes');
            test.assertExists('#hexmap svg path', 'hexmap exists');
        });

        casper.thenOpen(partialURL + '/es/', function() {
            test.assertExists('svg g path', 'chart exists');
            test.assertEval(function() {
                return __utils__
                    .findAll('.national-chart').length === 5;
            }, '/es/ es 5 charts of crime');
            test.assertEval(function() {
                return __utils__
                    .findAll('svg > path.mg-line2-color').length === 1;
            }, '/es/ 1 line of INEGI homicides');
            test.assertEval(function() {
                return __utils__
                    .findAll('svg > path.mg-line1-color').length === 5;
            }, '/es/ 5 lines of SESNSP crimes');
            test.assertExists('#hexmap svg path', 'hexmap exists');
        });

        casper.thenOpen(partialURL + '/es/#historical', function() {
            casper.waitForSelector('#national90 h2',
                                   function pass() {
                                       test.pass('h2 title in national chart')
                                       test.assertEval(function() {
                                           return __utils__
                                               .findAll('svg > path.mg-line2-color').length === 2;
                                       }, '/en/#historical 2 line of INEGI homicides + historical');
                                   },
                                   function fail() {
                                       test.fail('/es/#historical h2 title')
                                   }
                                  );


        });

        casper.thenOpen(partialURL + '/en/#historical', function() {
            casper.waitForSelector('#national90 h2',
                                   function pass() {
                                       test.pass('h2 title in national chart')
                                       test.assertEval(function() {
                                           return __utils__
                                               .findAll('svg > path.mg-line2-color').length === 2;
                                       }, '/en/#historical 2 line of INEGI homicides + historical');
                                   },
                                   function fail() {
                                       test.fail('/en/#historical h2 title')
                                   }
                                  );


        });

        casper.thenOpen(partialURL + '/en/states.html', function() {
            test.assertEval(function() {
                return __utils__
                    .findAll('.line-chart').length === 32;
            }, '/en/states.html state small multiples');
            test.assertEval(function() {
                return __utils__
                    .findAll('svg > path.mg-line2-color').length === 32;
            }, '/en/states.html 32 lines of INEGI homicides');
            test.assertEval(function() {
                return __utils__
                    .findAll('svg > path.mg-line1-color').length === 32;
            }, '/en/states.html 32 line of SESNSP crimes');
        });

        casper.thenOpen(partialURL + '/es/states.html', function() {
            test.assertEval(function() {
                return __utils__
                    .findAll('.line-chart').length === 32;
            }, '/es/states.html state small multiples');
            test.assertEval(function() {
                return __utils__
                    .findAll('svg > path.mg-line2-color').length === 32;
            }, '/es/states.html 32 lines of INEGI homicides');
            test.assertEval(function() {
                return __utils__
                    .findAll('svg > path.mg-line1-color').length === 32;
            }, '/es/states.html 32 line of SESNSP crimes');
        });

        casper.thenOpen(partialURL + '/en/municipios-map.html', function() {
            test.assertExists('img.leaflet-tile-loaded', '/en/municipios-map.html municipio map tiles exist');
        });

        casper.thenOpen(partialURL + '/es/municipios-map.html', function() {
            test.assertExists('img.leaflet-tile-loaded', '/es/municipios-map.html municipio map tiles exist');
        });

        casper.thenOpen(partialURL + '/en/municipios.html', function() {
            test.assertEval(function() {
                return __utils__
                    .findAll('.line-chart').length > 30;
            }, '/en/municipios.html municipio small multiples');

            test.assertEval(function() {
                return __utils__
                    .findAll('svg > path.mg-line2-color').length > 32;
            }, '/en/municipios.html more than 30 lines of Municipio INEGI homicides');
            test.assertEval(function() {
                return __utils__
                    .findAll('svg > path.mg-line1-color').length > 32;
            }, '/en/municipios.html more than 30 lines of municipio SESNSP crimes');
        });

        casper.thenOpen(partialURL + '/es/municipios.html', function() {
            test.assertEval(function() {
                return __utils__
                    .findAll('.line-chart').length > 30;
            }, '/es/municipios.html municipio small multiples');

            test.assertEval(function() {
                return __utils__
                    .findAll('svg > path.mg-line2-color').length > 32;
            }, '/es/municipios.html more than 30 lines of Municipio INEGI homicides');
            test.assertEval(function() {
                return __utils__
                    .findAll('svg > path.mg-line1-color').length > 32;
            }, '/es/municipios.html more than 30 lines of municipio SESNSP crimes');
        });

        casper.thenOpen(partialURL + '/en/anomalies.html', function() {
            test.assertEval(function() {
                return __utils__
                    .findAll('svg > path.mg-line1-color').length > 1;
            }, 'more than 1 lines of Anomalies');
            test.assertEval(function() {
                return __utils__
                    .findAll('svg g path').length > 32;
            }, 'more than 1 lines of Anomalies');
        });
        casper.thenOpen(partialURL + '/es/anomalies.html', function() {
            test.assertEval(function() {
                return __utils__
                    .findAll('svg > path.mg-line1-color').length > 1;
            }, 'more than 1 lines of Anomalies');
            test.assertEval(function() {
                return __utils__
                    .findAll('svg g path').length > 32;
            }, 'more than 1 lines of Anomalies');
        });

        casper.thenOpen(partialURL + '/en/infographics.html', function() {
        });
        casper.thenOpen(partialURL + '/es/infographics.html', function() {
        });

        casper.thenOpen(partialURL + '/en/datos.html', function() {
        });
        casper.thenOpen(partialURL + '/es/datos.html', function() {
        });


        casper.on('page.error', function(msg, trace) {
            this.echo('Error:    ' + msg, 'ERROR');
            this.echo('file:     ' + trace[0].file, 'WARNING');
            this.echo('line:     ' + trace[0].line, 'WARNING');
            this.echo('function: ' + trace[0]['function'], 'WARNING');
            errors.push(msg);
            test.fail('console error');
        });

        casper.on('resource.received', function(resource) {
            var status = resource.status;
            if (status >= 400) {
                test.fail('Resource ' + resource.url +
                          ' failed to load (' + status + ')', 'error');
                casper.log('Resource ' + resource.url +
                           ' failed to load (' + status + ')', 'error');

                errors.push({
                    url: resource.url,
                    status: resource.status
                });
            }
        });

        casper.run(function() {
            if (errors.length > 0) {
                this.echo(errors.length +
                          'errors found', 'WARNING');
            } else {
                this.echo(errors.length + ' Javascript errors found', 'INFO');
            }
            casper.exit();
        });
    });
