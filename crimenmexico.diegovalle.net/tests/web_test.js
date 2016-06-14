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
            }, '5 charts of crime');
            test.assertExists('#hexmap svg path', 'hexmap exists')
        });

        casper.thenOpen(partialURL + '/es/', function() {
            test.assertExists('svg g path', 'chart exists');
            test.assertEval(function() {
                return __utils__
                    .findAll('.national-chart').length === 5;
            }, 'es 5 charts of crime');
            test.assertExists('#hexmap svg path', 'hexmap exists')
        });

        casper.thenOpen(partialURL + '/en/states.html', function() {
            test.assertEval(function() {
                return __utils__
                    .findAll('.line-chart').length === 32;
            }, 'state small multiples');
        });

        casper.thenOpen(partialURL + '/es/states.html', function() {
            test.assertEval(function() {
                return __utils__
                    .findAll('.line-chart').length === 32;
            }, 'state small multiples');
        });

        // casper.thenOpen(partialURL + '/en/municipios-map.html', function() {
        //     test.assertExists('img.leaflet-tile-loaded', 'municipio map tiles exist');
        // });

        casper.thenOpen(partialURL + '/en/municipios.html', function() {
            test.assertEval(function() {
                return __utils__
                    .findAll('.line-chart').length > 30;
            }, 'municipio small multiples');
        });

        casper.thenOpen(partialURL + '/es/municipios.html', function() {
            test.assertEval(function() {
                return __utils__
                    .findAll('.line-chart').length > 30;
            }, 'municipio small multiples');
        });

        casper.thenOpen(partialURL + '/en/anomalies.html', function() {
        });
        casper.thenOpen(partialURL + '/es/anomalies.html', function() {
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
