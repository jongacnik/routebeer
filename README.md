# routebeer

A little router for the browser for ajaxified sites. We use it to organize/glue smaller bundles of code we want to load and unload when entering and exiting pages. Best enjoyed with [pjax](https://github.com/thybag/PJAX-Standalone) or [similar](http://weblinc.github.io/jquery.smoothState.js/index.html).

## Install

	npm install routebeer --save

## Usage & Options
	
	var routebeer = require('routebeer'); // require
	routebeer.init(); // init to get things going

But usually you'd initialize with some options

	routebeer.init({
		routes   : {
			project : {
				pattern : '/work/:project',
				load    : function(params){ console.log('We on a project page'); },
				unload  : function(params){ console.log('We out a project page'); }
			}
		},
		always   : function(route){ console.log('We ran something...'); },
		notFound : function(route){ console.log('Naw'); },
		root     : '/some/directory',
		event    : 'pjax:success'
	});

Once ready to go, let's navigate

	routebeer.navigate(); // grabs current window path and checks it against our routes for a match


**routes** is a little object that stores our defined routes. In this case we've defined a `project` route. The `load` function for that route is run when that particular route is matched. The `unload` function for that route is run when that route is navigated away from. The routes parameter names and values are passed into these functions. *Routebeer uses [path match](https://www.npmjs.org/package/path-match) which is built on top of [Path-to-RegExp](https://github.com/component/path-to-regexp) so you can use any of it's options to define paths.*

**always** runs before every route load. Information about the route is passed in as a param.

**notFound** runs if there is no route that matches current path. Information about the route is passed in as a param.

**root** let's us define our project root that all paths are matched relative to (Basically whatever is placed here is ignored from the beginning of the path when routebeer checks for matches).

**event** is the event to which routebeer is bound. In this case we've bound it to `pjax:success` so routebeer is going to run `navigate()`check for a route match whenever the `pjax:success` event is fired.


### Additional Methods

You don't need to define all routes within the init function. Two helpers are included to add and remove routes.

#### add

	routebeer.add({
		name    : 'home',
		pattern : '/',
		load    : function(params){ console.log('load', params); },
		unload  : function(params){ console.log('unload', params); }
	});
	
#### remove

	routebeer.remove('home');
	
### Events

Routebeer emits `routeLoad` and `routeUnload` events on the window whenever it happens. Data like the route name and params can be found in the event detail. Listen for these events like so:

	window.addEventListener('routeLoad',function(event){
		console.log(event.detail.name, event.detail.params);
	});
	
	window.addEventListener('routeUnload',function(event){
		console.log(event.detail.name, event.detail.params);
	});
	
### Use Case

As mentioned up top this routebeer is enjoyed best with something like [pjax](https://github.com/thybag/PJAX-Standalone). Let's say you're using pjax to add some ajaxy smoothness to your site rather than full page refreshes. You might need to init a slideshow and bind a few events for the homepage, and then when you enter the contact page, you're gonna want to unbind those homepage events and maybe init a contact form. Doing this is super easy to set up with routebeer:

	routebeer.init({
		routes : {
			home : {
				pattern : '/',
				load    : home.load // let's assume this inits the slideshow and binds events
				unload  : home.unload // let's assume this unbinds all homepage events
			},
			contact : {
				pattern : '/contact',
				load    : contact.load // let's assume this inits our contact form
				unload  : contact.unload // let's assume this deconstructs our contact form
			}
		},
		event : 'pjax:success'
	});
		
Now whenever pjax updates your content, routebeer will grab the current path, check to see if it matches any of your defined routes (home or contact). It's gonna run the unload function of whatever the previous route was (if it exists) for cleanup, and if it finds a match, run the new load function.

It's basically like building and destroying views, but since it's framework agnostic you can organize your stuff however you want.