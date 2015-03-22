var express = require('express');
var http = require('http');
//var qs = require('querystring'); //new
var app = express();
var config = require('./config');

var server = {

  // Initialise the server
  init: function() {
    console.log('\nInitialising routing proxy server...\n');
    this.configureProxy();
    this.setRoutes();
    app.listen(config.server_port);
    console.log('Server ready, http://localhost:' + config.server_port + '\n');
  },

  // Proxy configuration (Needed within TR network)
  configureProxy: function() {
    config.http_proxy = config.http_proxy ? config.http_proxy.split(':') : [];
    config.http_proxy_port = config.http_proxy[1] || 80;
    config.http_proxy = config.http_proxy[0];

    console.log('Proxy: ' + (config.http_proxy ?
      config.http_proxy + ':' + config.http_proxy_port : 'NOPROXY'));
  },

  // Set the route handlers
  setRoutes: function() {
    console.log('Setting routes...');
    app.use(express.static(__dirname));
    for (var key in this.routes) {
      var routeHandlers = this.routes[key];
      routeHandlers.forEach(function(item) {
        console.log(key.toUpperCase() + ': /' + item.route);
        app[key](item.route, item.handler.bind(item));
      });
    }
    console.log('done\n');
  },

  // Route handlers
  routes: {

    all: [{
      route: config.service_url + '/*',
      handler: function(req, res) {

        var host = config.forced_host || req.host;

        //if (req.method === 'GET') this.get(host, req, res);
        //else this.post(host, req, res);

        switch(req.method) {
            case 'GET':
                this.get(host, req, res);
                break;
            case 'POST':
                this.post(host, req, res);
                break;
            case 'PUT':
                this.put(host, req, res);
                break;
            case 'DELETE':
                this.del(host, req, res);
                break;
      }
    },

      // Handle GET requests
      get: function(host, req, res) {

        var options = {
          hostname: config.http_proxy || host,
          port: config.http_proxy_port,
          path: req.url.slice(config.service_url.length),
          headers: req.headers
        };

        options.headers.Host = host;

        console.log('URL: ' + options.path);
        console.log('ProxURL: ' + host + options.path);
        console.log(options.hostname);


        http.get(options, function(response) {
          var resData = '';
          response.setEncoding('utf8');

          response.on('data', function(chunk) {
            resData += chunk;
          });

          response.on('end', function() {
            res.set({
              'Content-Type': response.headers['content-type'] || response.headers['Content-Type']
            });
            res.end(resData);
            console.log('..');
          });
        });

      },

      // Handle POST requests   - buggy  
      post: function(host, req, res) {

        var postdata = '';
        
        var options = {
          hostname: config.http_proxy || host,
          port: config.http_proxy_port,
          path: req.url.slice(config.service_url.length),
          method:'POST',
          headers: req.headers
        };

        options.headers['Content-Type']='application/json';
        options.headers.Host = host;

        var post = http.request(options, function(response) {
          var resData = '';
          response.setEncoding('utf8');

          response.on('data', function(chunk) {
            resData += chunk;
          });

          response.on('end', function() {
            res.set({
              'Content-Type': response.headers['content-type'] || response.headers['Content-Type']
            });
            res.end(resData);
            console.log('..');
          });
        });

        console.log('URL: ' + options.path);
        console.log('ProxURL: ' + host + options.path);

        req.on('data', function (chunk) {
          postdata += chunk;
        });

        req.on('end', function() {
          
          options.headers['Content-Length']= Buffer.byteLength(postdata);

          post.write(postdata);
          post.end();
        });
       },

      // Handle PUT requests   - buggy 
      put: function(host, req, res) {
        var putData = '';
        
        var options = {
          hostname: config.http_proxy || host,
          port: config.http_proxy_port,
          path: req.url.slice(config.service_url.length),
          method:'PUT',
          headers: req.headers
        };

        options.headers['Content-Type']='application/json';
        options.headers.Host = host;

        var put = http.request(options, function(response) {
          var resData = '';
          response.setEncoding('utf8');

          response.on('data', function(chunk) {
            resData += chunk;
          });

          response.on('end', function() {
            res.set({
              'Content-Type': response.headers['content-type'] || response.headers['Content-Type']
            });
            res.end(resData);
            console.log('..');
          });
        });

        console.log('URL: ' + options.path);
        console.log('ProxURL: ' + host + options.path);

        req.on('data', function (chunk) {
          putData += chunk;
        });

        req.on('end', function() {
          
          options.headers['Content-Length']= Buffer.byteLength(putData);

          put.write(putData);
          put.end();
        });
      },

      // Handle DELETE requests  - buggy 
      del: function(host, req, res) {
        var deleteData = '';
        
        var options = {
          hostname: config.http_proxy || host,
          port: config.http_proxy_port,
          path: req.url.slice(config.service_url.length),
          method:'DELETE',
          headers: req.headers
        };

        options.headers['Content-Type']='application/json';
        options.headers.Host = host;

        var del = http.request(options, function(response) {
          var resData = '';
          response.setEncoding('utf8');

          response.on('data', function(chunk) {
            resData += chunk;
          });

          response.on('end', function() {
            res.set({
              'Content-Type': response.headers['content-type'] || response.headers['Content-Type']
            });
            res.end(resData);
            console.log('..');
          });
        });

        console.log('URL: ' + options.path);
        console.log('ProxURL: ' + host + options.path);

        req.on('data', function (chunk) {
          deleteData += chunk;
        });

        req.on('end', function() {
          
          options.headers['Content-Length']= Buffer.byteLength(deleteData);

          del.write(deleteData);
          del.end();
        });
      }

    }]
  }
}

server.init();