require('custom-event-polyfill');
var liteURL = require('lite-url');
var pattern = require('path-match')();
var extend  = require('extend');

// Data
var _data = {
  'currentPath'  : null,
  'currentRoute' : null,
  'lastRoute'    : null
};

// Options
var options = {
  'routes'   : {},
  'always'   : function(route) { }, // runs before every route load
  'notFound' : function(route) { }, // runs if route is not found in user defined routes
  'root'     : null,
  'event'    : null
}

/**
 * Returns current path (window)
 * - Replaces string root in path (if exists)
 */
var _getCurrentPath = function(root){
  var url  = liteURL(window.location.href);
  var path = url.pathname;
  return (!root) ? path : path.replace(root, '');
}

/**
 * Navigates a route
 * - Fires unload of previous route (if exists) and load of current route
 */
var _navigate = function(){
  _data.lastRoute    = _data.currentRoute;
  _data.currentRoute = null; // reset current route
  _data.currentPath  = _getCurrentPath(options.root); // get current path

  Object.keys(options.routes).some(function(key) { // loop through routes until we find a match
    var routeToMatch = pattern(options.routes[key].pattern);
    var routeParams  = routeToMatch(_data.currentPath);
    if(routeParams){ // if params exist, we've got a match
      _data.currentRoute = {
        'name'   : key,
        'params' : routeParams
      }
      return true; // exit some
    }
  });

  if(_data.lastRoute)
    _unload(_data.lastRoute);

  if(typeof options.always === 'function') 
    options.always(_data.currentRoute);

  if(_data.currentRoute)
    _load(_data.currentRoute);
  else
    options.notFound(_data.currentPath);
}

/**
 * Runs routes load, and dispatches event
 */
var _load = function(route){
  if(typeof options.routes[route.name].load === 'function') 
    options.routes[route.name].load(route.params);

  _doEvent('routeLoad', route);
}

/**
 * Runs routes unload, and dispatches event
 */
var _unload = function(route){
  if(typeof options.routes[route.name].unload === 'function') 
    options.routes[route.name].unload(route.params);

  _doEvent('routeUnload', route);
}

/**
 * Defines and dispatches custom events on the window
 */
var _doEvent = function(name, details){
  var event = new CustomEvent(name, {
    detail : details
  });
  window.dispatchEvent(event); 
}

/**
 * Merge options
 */
var init = function(opts) {
  options = extend(true, options, opts);
  if(options.event)
    window.addEventListener(options.event, _navigate);
};

/**
 * Add a route
 */
var add = function(opts) {
  if(('name' in opts) && ('pattern' in opts)){
    options.routes[opts.name] = {
      'pattern' : opts.pattern,
      'load'    : opts.load,
      'unload'  : opts.unload
    };
  } else {
    console.log('You need at least a name and pattern defined');
  }
};

/**
 * Remove a route
 */
var remove = function(route) {
  delete options.routes[route];
};

/**
 * Public methods
 */
module.exports = {
  'init'     : init,
  'add'      : add,
  'remove'   : remove,
  'navigate' : _navigate,
  'data' : _data 
};