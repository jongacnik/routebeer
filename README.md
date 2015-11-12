# routebeer

A simple router for the browser best enjoyed with [pjax](https://github.com/thybag/PJAX-Standalone)

**Some API Changes in version 0.1.8**

## Usage

	var routebeer = require('routebeer')

	var router = routebeer({
		always : function (data) { // run on every navigate
			console.log(data)
		},
		notFound : function (data) { // run on route not found
			console.log(data)
		},
		root : '/', // define optional base
		event : 'pjax:success' // run route check on event
	})
	.add({ // add a route
		name : 'project',
		path : '/projects/:project',
		load : function (r) { // run when navigating to route
			console.log(r) // r will contain route data, such as params
		},
		unload : function (r) { // run when navigating away from route
			console.log(r)
		}
	})
	.add({
		name : 'about',
		path : '/about',
		load : function (r) {
			console.log(r)
		},
		unload : function (r) {
			console.log(r)
		}
	})
	.add({
		name : 'home',
		path : '/',
		load : function (r) {
			console.log(r)
		},
		unload : function (r) {
			console.log(r)
		}
	})
	.navigate() // init

Path definition using [path match](https://www.npmjs.org/package/path-match)

### Remove

	router.remove('home') // removes route

### Events

	router
		.on('load', function (r) {

		})
		.on('unload', function (r) {

		})

## Bundled Version

If you don't want to mess with a build process you can also include the pre-bundled version found in routebeer.bundled.js in your project which exposes routebeer() globally.