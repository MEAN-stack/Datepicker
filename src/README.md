# Datepicker - Simple AngularJS datepicker directive

## Demo

http://mean-stack.github.io/datepicker/datepicker9.html

## Requirements

AngularJS, Bootstrap

## Installation

### NPM
npm install --production

### Manual
Just copy `datepicker.js` and include it in your AngularJS project

## Testing

- Unit tests require Karma, Jasmine, Angular-mocks, and Chrome or PhantomJS
- End-to-end tests are included. These require Protractor, WebDriver, Selenium, mocha, chai,...

npm install
npm test

On Windows - modify the `"test"` script in <b>package.json</b> or run the tests by hand
To skip end-to-end testing remove the `"postinstall"` script in <b>package.json</b> and remove the protractor test.
