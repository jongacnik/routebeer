var path = require('path-match')()
var extend = require('extend')
var isEqual = require('is-equal')
var Emitter = require('tiny-emitter')

module.exports = function (opts) {

  var events = new Emitter()

  // Data
  var _data = {
    currentPath : null,
    currentRoute : null,
    lastRoute : null
  }

  // Options
  var options = extend(true, {
    routes : {},
    always : function (data) { }, // runs before every route load
    notFound : function (data) { }, // runs if route is not found in user defined routes
    root : null,
    event : null,
    ignoreDouble : false
  }, opts)

  if (options.event) {
    window.addEventListener(options.event, function () {
      if (options.event.indexOf('popstate') > -1 && _data.lastRoute === null) {
        return
      } else {
        _navigate()
      }
    })
  }

  /**
   * Returns current path (window)
   * - Replaces string root in path (if exists)
   */
  var _getCurrentPath = function (root) {
    var path = location.pathname
    return (!root) ? path : path.replace(root, '')
  }

  /**
   * Navigates a route
   * - Fires unload of previous route (if exists) and load of current route
   */
  var _navigate = function () {
    _data.lastRoute = _data.currentRoute
    _data.currentRoute = null // reset current route
    _data.currentPath = _getCurrentPath(options.root) // get current path

    Object.keys(options.routes).some(function(key) { // loop through routes until we find a match
      var routeToMatch = path(options.routes[key].path)
      var routeParams = routeToMatch(_data.currentPath)
      if (routeParams) { // if params exist, we've got a match
        _data.currentRoute = {
          name : key,
          params : routeParams
        }
        return true // exit some
      }
    })

    if (_data.lastRoute) {
      if (options.ignoreDouble && isEqual(_data.lastRoute, _data.currentRoute)) {
        return
      }
      _unload(_data.lastRoute)
    }

    if (typeof options.always === 'function') {
      options.always(_data)
    }

    if (_data.currentRoute) {
      _load(_data.currentRoute)
    } else {
      options.notFound(_data)
    }
  }

  /**
   * Runs routes load, and dispatches event
   */
  var _load = function (route) {
    if (typeof options.routes[route.name].load === 'function') {
      options.routes[route.name].load(route)
    }
    events.emit('load', _data)
  }

  /**
   * Runs routes unload, and dispatches event
   */
  var _unload = function (route) {
    if (typeof options.routes[route.name].unload === 'function') {
      options.routes[route.name].unload(route)
    }
    events.emit('unload', _data)
  }

  /**
   * Add a route
   */
  var add = function (opts) {
    if (('name' in opts) && ('path' in opts)) {
      options.routes[opts.name] = {
        path : opts.path,
        load : opts.load,
        unload : opts.unload
      }
    } else {
      console.log('You need at least a name and path defined')
    }
    return this
  }

  /**
   * Remove a route
   */
  var remove = function (route) {
    delete options.routes[route]
    return this
  }

  /**
   * Public methods
   */
  return {
    add : add,
    remove : remove,
    navigate : _navigate,
    data : _data,
    on : function(ev, cb){ events.on(ev, cb); return this }
  }

}