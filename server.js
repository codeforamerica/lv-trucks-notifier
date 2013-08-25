var config       = require('./config')

var PORT         = 8000,
//    express      = require('express'),
	fs           = require('fs'),
    path         = require('path'),
    moment       = require('moment'),
    mustache     = require('mustache'),
    requestJSON  = require('request-json'),
    sendgrid     = require('sendgrid')(config.SENDGRID_USERNAME, config.SENDGRID_PASSWORD)
    when         = require('when')

var TODAY        = config.TODAY
	SCHEDULE_DAY = config.SCHEDULE_DAY

console.log('Starting: ' + config.APP_NAME)

// Check if the schedule date is after the end date. If so, quit!
// To test this, set SCHEDULE_DAY to the day after DATE_PROGRAM_END.
// e.g SCHEDULE_DAY = moment(config.DATE_PROGRAM_END).add('days', 1)
if (SCHEDULE_DAY.isAfter(moment(config.DATE_PROGRAM_END), 'day')) {

	console.log('The schedule day is ' + SCHEDULE_DAY.format('MMMM Do YYYY') + '.')
	console.log('The end date for this program ended on ' + moment(config.DATE_PROGRAM_END).format('MMMM Do YYYY') + '.')
	console.log('The notifier will now exit.')
	process.exit()
}

// Node.js express server setup
/*
var app = express()

app.configure(function() {
	app.set('port', process.env.PORT || PORT)
	app.use(express.static(path.join(__dirname, 'public')))
})

app.listen(app.get('port'), function () {
	console.log('Useless web server: Listening on port ' + app.get('port'))
})
*/


// **********************************************************************
// GET DATA FROM API

var api = requestJSON.newClient(config.API_SERVER)

var data = {}

var dataSources = {
	locations:   config.API_LOCATIONS,
	vendors:     config.API_VENDORS,
	timeslots:   config.API_TIMESLOTS
}

when(_getAllData(dataSources), 
	function success (success) {
		console.log('All data sources retrieved.')

		// Data munching!
		data.locations = _doLocationData(data.locations)
		data.vendors   = _doVendorData(data.vendors)
		data.schedule  = _doScheduleData(data.timeslots)
		data.emaillist = _doMailingList(data.vendors)

		return success
	},
	function error (err) {
		console.log('Error: ' + err)
	}
).then(function (after) {

// **********************************************************************
// DO STUFF WITH DATA

	// Create that output!
	var contents = _assembleNotification()

	var emailtext = _templateText(contents)
	var emailhtml = _templateHtml(contents)

	if (config.SENDGRID_PASSWORD && config.SENDGRID_USERNAME) {
		// Send emails
		_sendEmail(emailtext, emailhtml, data.emaillist)
	} else {
		console.log('No Sendgrid credentials available, outputting to console instead.')
		console.log(emailtext)
	}

	// exit upon completion?!
//	console.log('Done')
//	process.exit()
})


// **********************************************************************
// FUNCTIONS

// Function to get all the data sources
function _getAllData (sources) {
	// Note: this (+ comments) were pretty much copied from the
	// request-json documentation: https://github.com/cujojs/when/wiki/Examples

	// sources = array of API sources

	// Array to hold deferred for each data source being loaded
	var deferreds = []

	// Call _getData for each source, and push the returned deferred
	// onto the deferreds array
	for (type in sources) {
		// NOTE: We could push only the promise, but since this array never
		// leaves the loadImages function, it's ok to push the whole
		// deferred.  No one can gain access to them.
		// However, if this array were exposed (e.g. via return value),
		// it would be better to push only the promise.
		deferreds.push(_getData(type, sources[type]));
	}

	// Return a new promise that will resolve only when all the
	// promises in deferreds have resolved.
	// NOTE: when.all returns only a promise, not a deferred, so
	// this is safe to expose to the caller.
	return when.all(deferreds);
}

// Generic data loading function
function _getData (type, source) {

	console.log('Retrieving ' + type + ' from ' + source + ' ...')

	var deferred = when.defer()

	api.get(source, function(err, res, body) {
		if (err) {
			deferred.reject(new Error('Error loading ' + type + ' from ' + source + ' : ' + err))
		}
		else {
			data[type] = body
			deferred.resolve(body)
			console.log(source + ' ... Done!')
		}
	})

	// Return only the promise, so that the caller cannot
	// resolve, reject, or otherwise muck with the original deferred.
	return deferred.promise;
}


// Specific data munging functions

function _doLocationData (locations) {

	var locations = locations.sort(_sort_by('id', true))

	return locations
}

function _doVendorData (vendors) {

	return vendors
}

function _doMailingList (vendors) {

	var emaillist = []

	// Produce email list from vendor list.
	for (i = 0; i < vendors.length; i++) {
		emaillist.push(vendors[i].email)
	}

	// Test for now.
	emaillist = []

	// Add additional recipients that are not on the vendor list.
	emaillist = emaillist.concat(config.EMAIL_ADDITIONAL_RECIPIENTS)

	return emaillist
}

function _doScheduleData (timeslots) {

	var schedule = []

	for (var j = 0; j < timeslots.length; j++) {

		var start = moment(timeslots[j].start_at)
		var end = moment(timeslots[j].finish_at)

		if (start.isSame(SCHEDULE_DAY, 'day')) {
			schedule.push(timeslots[j])
		}

	}

	// Sort schedule by time
	schedule = schedule.sort(_sort_by('start_at', true))

	// Actions
	for (var i = 0; i < schedule.length; i++) {

		var start = moment(schedule[i].start_at)
		var end = moment(schedule[i].finish_at)

		// Add some helpful information for start times
		schedule[i].day_of_week = start.format('ddd')
		schedule[i].month = start.format('MMMM')
		schedule[i].day = start.date()
		schedule[i].year = start.year()

		// Formatted strings
		schedule[i].from = _formatTime(start)
		schedule[i].until = _formatTime(end)

	}

	return schedule
}

// Generic accessory functions for data munging
// These have been copied from lv-trucks-map

function _sort_by (field, reverse, primer) {
	var key = function (x) {return primer ? primer(x[field]) : x[field]};

	return function (a,b) {
		var A = key(a), B = key(b);
		return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1,1][+!!reverse];                  
	}
}


function _formatTime (date) {

	// date is a moment.js object
	// moment.js can't create string formats where the minutes
	// are optional, so this function returns a string in a format
	// like '6am' or '6:30pm'

	if (date.minutes() > 0) {
		return string = date.format('h:mma')
	} else {
		return string = date.format('ha')
	}

}

// Assemble email function

function _assembleNotification () {

	var contents = {
		'locations': []
	}
	
	contents.app_name      = config.APP_NAME
	contents.date          = SCHEDULE_DAY.format('dddd, MMMM D, YYYY')

	contents.contact_name  = config.EMAIL_FROM_NAME
	contents.contact_email = config.EMAIL_FROM_ADDRESS

	for (var i = 0; i < data.locations.length; i ++) {

		var location = {}
		location.name = data.locations[i].name
		location.schedule = []

		contents.locations.push(location)

		for (var j = 0; j < data.schedule.length; j ++) {

			if (data.schedule[j].location_id === data.locations[i].id) {

				var entry = {}

				entry.from   = _pad(data.schedule[j].from)
				entry.until  = _pad(data.schedule[j].until)
				entry.id     = data.schedule[j].vendor_id

				for (var k = 0; k < data.vendors.length; k ++) {
					if (entry.id === data.vendors[k].id) {
						entry.vendor = data.vendors[k].name
					}
				}

				// assuming that i = current position on array
				contents.locations[i].schedule.push(entry)

			}
		}
	}

	return contents
}

function _templateText (contents) {

	console.log('Creating text template...')
	var template_text = fs.readFileSync('templates/email.txt', { encoding: 'utf8'} )

	return mustache.render(template_text, contents)

}

function _templateHtml (contents) {

	console.log('Creating HTML template...')
	var template_html = fs.readFileSync('templates/email.html', { encoding: 'utf8'} )

	return mustache.render(template_html, contents)

}

function _pad(string) {
	// this exists solely to make the text output line up pretty (like a table)
	string = string + '        '
	return string.slice(0,6)
}


function _sendEmail (messageText, messageHtml, to) {

	console.log('Sending emails to ' + to + ' ...')

	var log = '[Sendgrid] Sending emails : '

	sendgrid.send({
		to:       to, 
		from:     config.EMAIL_FROM_ADDRESS,
		fromname: config.EMAIL_FROM_NAME,
		subject:  config.EMAIL_SUBJECT,
		text:     messageText,
		html:     messageHtml
	}, function(err, json) {
		if (err) { 
			return console.error(log + err);
		}
		console.log(log + json.message);
	});
}

