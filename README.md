lv-trucks-notifier
==================

Daily auto-notification of scheduled vendors for the City of Las Vegas mobile food vendor program.

This script was created by request of the City of Las Vegas Parking Services manager. Food truck vendors signed up for time slots across a six-month pilot program period, but tended to forget their time slots. (The rules of the program stipulate that anyone who misses three time slots without asking for a change may lose their participation in the program.)

As a result, the parking services manager wanted to automatically notify the vendors of each day's schedule, as opposed to manually sending daily reminders.  We made this as a standalone script that will run each evening at 5pm PST and e-mail blast all the vendors in the program of the next day's schedule.

### How it works

This is a standalone application, but has several very important dependencies:

* __[Las Vegas Food Trucks back-end server.][lv-trucks-server]__  This application was created by Code for America Las Vegas fellows and contains the schedule and vendor information added by the city.  The e-mail script relies on the same API exposed by this server that is used by the [public-facing trucks map][lv-trucks-map]. (The lv-trucks-notifier script does not depend on the trucks map.)

[lv-trucks-map]: https://github.com/codeforamerica/lv-trucks-map/
[lv-trucks-server]: https://github.com/codeforamerica/food_trucks

* __Heroku.__  The script is hosted on Heroku, a popular crowd platform as a service (PaaS) host. Although there is a herokuapp.com subdomain, _the script currently does not expose anything over HTTP_, so visiting http://lv-trucks-notifier.herokuapp.com/ does nothing. The _lv-trucks-notifier_ script uses Heroku because it is easy to deploy the script quickly, and also so it can rely on several free-tier add-ons that Heroku makes easy to use:

    * __Heroku Scheduler.__ This add-on automatically runs the _lv-trucks-notifier_ script once each day, at a time (in UTC time zone) specified in the add-on's settings. The script will immediately exit upon completion, so it does not take up server resources continuously. _NOTE:_ Heroku does not guarantee that the scheduler runs reliably, and it is possible that on some days the script will fail to run. This has already happened once before on August 29, 2013.

    * __Sendgrid Standard.__ This add-on uses the SendGrid e-mail service to send the schedule to participating vendors. (The City provides the vendor list to the back-end server database, and the information is exposed via an API endpoint.) Since the free tier of this add-on allows 200 e-mails a day and there is currently much less than this many vendors, we are well within its limits. It also provides some logging, which is helpful.

    * __Papertrail Choklad.__ This is not required, but it will log the console's output, for later debugging.

The Sendgrid account credentials are stored as variables in the Heroku process environment. If Sendgrid credentials are not detected, a text form of the e-mail is output to the console instead of being e-mailed. (Good for testing, I hope.)


#### Important Javascript/Node.js libraries used

* __[moment.js](http://momentjs.com/)__ Date/time library, used as a replacement for JavaScript's Date() object, because of various formatting and transformation methods that make it very easy to use. The most important use of this library is in ```config.js``` where you can set whether the schedule should be today or tomorrow's.

* __[mustache.js](http://mustache.github.io/)__ "Logicless" templating library used to generate the emails.


### Modifying configuration and templates

Most of the basic administrative changes can be made by editing the variables in ```config.js``` and in the e-mail templates under the ```/templates``` folder.


### Tests and monitoring

There are no tests.

Currently, the only "live" monitoring of the service is that the fellows and the CLV parking manager is added on as additional recipients in ```config.js```.

Additional logging 


## Usage / Installation

Basic steps:

* Set up a Heroku instance and include two add-ons: the Heroku Scheduler and Sendgrid Standard.
* Edit ```config.js``` and ```/templates``` to your liking.
* Deploy the repo to Heroku, e.g. with ```git push heroku master``` on the command line.
* Set up an environment variable on Heroku to the local timezone you want to use (via the command line):
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
[LICENSE]: https://github.com/codeforamerica/lv-trucks-notifier/blob/master/LICENSE