lv-trucks-notifier
==================

Daily auto-notification of scheduled vendors for the City of Las Vegas mobile food vendor program.

This script was made by request of the City of Las Vegas Parking Services manager. The food truck vendors signed up for time slots across a six-month time period for the pilot program, but tended to forget their time slots. (The rules of the program stipulate that anyone who misses three time slots without asking for a change may lose their participation in the program.)

The parking services manager wanted to automatically notify the vendors of each day's schedule. Currently, this script will run each evening at 5pm PST and e-mail blast all the vendors in the program of the next day's schedule.

### How it works

This is a standalone application, but has several dependencies:

* __[Las Vegas Food Trucks back-end server.][lv-trucks-server]__  This application was created by Code for America Las Vegas fellows and contains the schedule and vendor information added by the city.  The e-mail script relies on the same API exposed by this server that is used by the [public-facing trucks map][lv-trucks-map]. (The lv-trucks-notifier script does not depend on the trucks map.)

[lv-trucks-map]: https://github.com/codeforamerica/lv-trucks-map/
[lv-trucks-server]: https://github.com/codeforamerica/food_trucks

* __Heroku.__  The script is hosted on Heroku. Although there is a herokuapp.com subdomain, _the script currently does not expose anything over HTTP_, so visiting http://lv-trucks-notifier.herokuapp.com/ will not do anything. It only relies on several add-ons that Heroku makes easy to use:

* __Heroku Scheduler.__ This add-on automatically runs the script once each day at a pre-set time (in UTC time). It will immediately exit upon completion.

* __Sendgrid Standard.__ This add-on uses SendGrid to e-mail the schedule to the list of vendors. (The vendor list is provided by the City, entered into the back-end server database and exposed via an API endpoint.) Since the free tier of this add-on allows 200 e-mails a day and there is currently much less than this many vendors, we are well within its limits. It also provides some logging, which is helpful.

The Sendgrid account credentials are stored on the Heroku environment. If Sendgrid credentials are not detected in the process environment variables, a text form of the e-mail is output to the console instead. (Good for testing, I hope.)

#### Some additional Javascript/Node.js libraries to be aware of

* __[moment.js](http://momentjs.com/)__ Date/time library, used as a replacement for JavaScript's Date() object. The most important use of this library is in ```config.js``` where you can set whether the schedule should be today or tomorrow's.
* __[mustache.js](http://mustache.github.io/)__ Templating library used to generate the emails.


### Additional notes

Hopefully, most of the basic administrative changes can be made by editing the variables in ```config.js``` and in the e-mail templates under the ```/templates``` folder.

Currently, the only "live" monitoring of the service is that the fellows and the CLV parking manager is added on as additional recipients in ```config.js```.


## Usage / Installation

Basic steps:

* Set up a Heroku instance and include two add-ons: the Heroku Scheduler and Sendgrid Standard.
* Edit ```config.js``` and ```/templates``` to your liking.
* Deploy the repo to Heroku via ```git push heroku master```.
* Set up an environment variable on Heroku to the local timezone you want to use:
    heroku config:add TZ="America/Los_Angeles"
* Set up the Scheduler to run when you want it to. You can check to make sure that the e-mails are working by checking Sendgrid's logs. Alternatively, you can also get it to send e-mails to yourself by adding an e-mail address to the ```EMAIL_ADDDITIONAL_RECIPIENTS``` variable in ```config.js```.

## Contributing
In the spirit of [free software][free-sw], **everyone** is encouraged to help
improve this project.

[free-sw]: http://www.fsf.org/licensing/essays/free-sw.html

Here are some ways *you* can contribute:

* by reporting bugs
* by writing or editing documentation
* by writing specifications
* by writing code (**no patch is too small**: fix typos, add comments, clean up inconsistent whitespace)
* by refactoring code
* by closing [issues][]
* by reviewing patches
* [financially][]

[issues]: https://github.com/codeforamerica/lv-trucks-map/issues
[financially]: https://secure.codeforamerica.org/page/contribute

## Submitting an Issue
We use the [GitHub issue tracker][issues] to track bugs and features. Before submitting a bug report or feature request, check to make sure it hasn't already been submitted. You can indicate support for an existing issue by voting it up. When submitting a bug report, please include a [Gist][] that includes a stack trace and any details that may be necessary to reproduce the bug, including your gem version, Ruby version, and operating system. Ideally, a bug report should include a pull request with failing specs.

[gist]: https://gist.github.com/

## Submitting a Pull Request
1. Fork the project.
2. Create a topic branch.
3. Implement your feature or bug fix.
4. Commit and push your changes.
5. Submit a pull request. 

## Copyright
Copyright (c) 2013 Code for America. See [LICENSE][] for details.

[![Code for America Tracker](http://stats.codeforamerica.org/codeforamerica/lv-trucks-map.png)][tracker]

[tracker]: http://stats.codeforamerica.org/projects/lv-trucks-notifier