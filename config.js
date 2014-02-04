var moment     = require('moment'),
    TODAY      = moment().startOf('day'),
    SCHEDULE_DAY = TODAY.add('days', 1)

var config = {
  APP_NAME: 'Las Vegas Mobile Food Vendor Daily Notification System',

  SCHEDULE_DAY: SCHEDULE_DAY,

  EMAIL_FROM_NAME: 'City of Las Vegas Parking Services',
  EMAIL_FROM_ADDRESS: 'clvfoodtruck@lasvegasnevada.gov',
  EMAIL_REPLY_TO_ADDRESS: 'clvfoodtruck@lasvegasnevada.gov',
  EMAIL_SUBJECT: '[Las Vegas Mobile Food Vendors Program] Schedule for ' + SCHEDULE_DAY.format('dddd, MMMM D, YYYY'),

  EMAIL_ADDITIONAL_RECIPIENTS:  ['lou@codeforamerica.org', 'ryanc@codeforamerica.org', 'bstanley@lasvegasnevada.gov'],

  SENDGRID_USERNAME: process.env.SENDGRID_USERNAME,
  SENDGRID_PASSWORD: process.env.SENDGRID_PASSWORD,

  DATE_PROGRAM_START: 'February 1, 2014',
  DATE_PROGRAM_END: 'December 31, 2014',

  API_HOST: 'lv-food-trucks.herokuapp.com',
  API_SERVER: 'http://lv-food-trucks.herokuapp.com/api/',
  API_LOCATIONS: 'locations.json',
  API_VENDORS: 'vendors.json',
  API_TIMESLOTS: 'locations/1/time_slots/search.json?q%5Bstart_at_gt%5D=' + SCHEDULE_DAY.toJSON(),

  MAP_URL: 'http://lasvegasnevada.gov/foodtruck/'

}

module.exports = config