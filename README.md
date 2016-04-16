# Datepicker

There are a couple of places in my web application the user needs to enter a date, and optionally, a time.
Use cases are:

 * Date of birth - time not required, but date could be many years in the past.
 * Card expiry date - only month and year required.
 * Auction end date - limited to dates from now to 10 days in the future, optionally include a time.

In all cases it should be possible to set min and max allowed dates.
The control doesn't need to be fancy, just configurable, and simple to use.
And I want to avoid any posible confusion over day/month.

## HTML5
HTML5 `<input>` element has a `type="date"` attribute.
It is really nice to use in mobile Safari/Chrome on a handheld device, less usable on desktop Chrome, and not supported at all on IE or Firefox.

## Angular UI Bootstrap

Angular UI Bootstrap https://angular-ui.github.io/bootstrap/ has a datepicker which works ok, and also a timepicker.
But the calendar-based datepicker has a completely different look and feel to the timepicker, and selecting dates several years in the past or future is a bit fiddly.

## My datepicker

My control will use simple set of `<input>` or `<select>` elements. Most of the configuration will be via a date format string. For example:

```HTML
<div my-datepicker format="ddMMMyyyy">
```

![Screenshot](https://github.com/MEAN-stack/Datepicker/blob/master/date1.png)

```HTML
<div my-datepicker format="MM/yy">
```

![Screenshot](https://github.com/MEAN-stack/Datepicker/blob/master/date2.png)

## &lt;input&gt;&nbsp;or&nbsp;&lt;select&gt; ?

It seems reasonable to use a `<select>` element to choose the month from a list of 12 options, but what about the day of the month? or the year.
Then again, in some configurations the range of dates may be restricted, so choosing a year in the range 2016 .. 2024 might be fine in a list, but 1900 .. 2099 would not.

For my first stab at this, I'm going to implement the following behaviours:

* Day selection always `<input>`
* Month selection always `<select>`
* Year selection uses `<select>` if the range is 12 years or less, otherwise uses `<input>`


## Quick Dates

This is a nice feature I have seen on some websites:

![Screenshot](https://github.com/MEAN-stack/Datepicker/blob/master/date3.png)

The list of quick dates is _ad hoc_ but bound to the other controls, so that choosing a date from the list will update the contents of the datepicker elements.
I'm not sure yet how to implement this feature, but I think that I will try to use Angular's transclusion feature.

## Step 1 - HTML and CSS

As usual, I'm going to design and implement my control from the ground up, so I'll start with a piece of static HTML. This will be the basis of the template used in an Angular directive.
I'm also going to make use of Bootstrap's CSS. It means that anyone using the final control will also need bootstrap, but then everyone uses bootstrap these days don't they?

Here's the HTML:

```HTML
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.css">
    <style>
      .datepicker {
        border-radius:0;
        width: auto;
        display: inline-block;
      }
    </style>
  </head>
  <body>
    <div class="form-group" style="margin: 20px;">
      <input class="form-control datepicker" type="text" size="2" maxlength="2" value="8"
     ><select class="form-control datepicker" name="month">
        <option value="0">month</option>
        <option value="1">Jan</option>
        <option value="2">Feb</option>
        <option value="3">Mar</option>
        <option value="4">Apr</option>
        <option value="5">May</option>
        <option value="6">Jun</option>
        <option value="7">Jul</option>
        <option value="8">Aug</option>
        <option value="9">Sep</option>
        <option value="10">Oct</option>
        <option value="11">Nov</option>
        <option value="12" selected="">Dec</option>
      </select
     ><input class="form-control datepicker" type="text" name="year" size="4" maxlength="4" value="2015"
    </div>
  </body>
</html>
```

![Screenshot](https://github.com/MEAN-stack/Datepicker/blob/master/date4.png)

You can see that the input elements have no space between them. This is deliberate; I think it makes the datepicker look neater, at least it does if I sharpen the corners of the elements as I have done here.

It's actually a bit fiddly to remove the gap between the input elements while preserving the indentation in the HTML, keeping the source code neat and readable. I have achieved this by moving the closing &gt; angle bracket to the next line, but there are several other ways to achieve the same effect described here https://css-tricks.com/fighting-the-space-between-inline-block-elements/ 

I have used `type="text"` for the two `<input>` elements. I tried `type="number"` but it gave me less control over the width of the element. Fortunately Angular will allow me to perform the validation on the user's input, so it's not a problem.

## Step 2 - Specifying the date format

Since I am trying to keep things simple I will only support a few options here:

<pre>yyyy</pre>
4 digits year e.g. 2015
<pre>yy</pre>
2 digits year e.g. 15
<pre>MMMM</pre>
full name of a month e.g. April
<pre>MMM</pre>
short name of a month e.g. Apr
<pre>MM</pre>
numeric month e.g. 04
<pre>dd</pre>
numeric day e.g. 28

## Step 3 - Create the directive

This is my first crack at the datepicker directive. Not everything is working yet.

You can see a demo here: http://mean-stack.github.io/datepicker/datepicker1.html

I'll give the complete HTML below, with some comments:

```HTML
<html ng-app="datepickerApp">
  <head>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.9/angular.js"></script>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.css">
    <style>
      .datepicker {
        border-radius:0;
        width: auto;
        display: inline-block;
      }
    </style>
```

We start by including Angular and Bootstrap
The `datepicker` class sharpens the boxes and makes the datepicker more compact

```HTML
    <script type="text/template" id="datepickerTemplate">
      <input ng-if="settings.showDay" ng-model="date.day" class="form-control datepicker" type="text" size="2" maxlength="2"
     ><select ng-if="settings.showMonth" ng-model="date.month" class="form-control datepicker" name="month" ng-options="month as month for month in months"></select
     ><input ng-if="settings.showYear" ng-model="date.year" class="form-control datepicker" type="text" name="year" size="4" maxlength="4">
    </script>
```

This is the html template for the datepicker directive. It refers to some objects defined in the directive's scope: `settings` and `date`.
Remember that there is no space between the day, month, and year elements.

```HTML
    <script>
      angular.module("datepickerApp", [])
      .directive("myDatepicker", function() {
        return {
          scope: {
            dt: "=value"	  
          },
```

This is the directive. There is quite a lot of code so I'll describe it in small pieces.
The first bit declares that the directive has its own scope containing a Date object named `dt` which is bound to an attribute named `value`

```HTML
          link: function(scope, element, attrs) {
            // initialize dateFormat to a default value
            var dateFormat = 'ddMMyyyy'
            
            // if the HTML element specifying this directive has a `format` attribute then use it
            if (attrs['format']) {
              dateFormat = attrs['format']
            }
            // initialize the settings object
            scope.settings = {
              showDay: false,
              showMonth: false,
              showYear: false
            }
            // parse the date format to figure out which elements to display
            scope.settings.showDay = /dd/.test(dateFormat)
            scope.settings.showMonth = /MM/.test(dateFormat)
            scope.settings.showYear = /yy/.test(dateFormat)

            // create an array of values to populate the month selection control
            scope.months = []
            if (/MMMM/.test(scope.dateFormat)) {
              scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            }
            else if (/MMM/.test(scope.dateFormat)) {
              scope.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            }
            else if (/MM/.test(scope.dateFormat)) {
              scope.months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
            }
            
            // initialize the date object which contains the values from the datepicker elements
            scope.date = {
              day: scope.dt.getDate(),
              month: scope.months[scope.dt.getMonth()],
              year: scope.dt.getFullYear()
            }

            // create the watchers which watch for changes in the values from the datepicker elements
            // if a value changes then update the scope dt object
	    scope.$watch('date.day', function(newValue) {
              scope.dt.setDate(newValue)
            });
            
            scope.$watch('date.month', function(newValue) {
              for (var i=0; i<scope.months.length; i++) {
                if (newValue == scope.months[i]){
                  scope.dt.setMonth(i)
                }
              }
            });
            
            scope.$watch('date.year', function(newValue) {
              scope.dt.setFullYear(newValue)
            });
	  },
```

The link function does most of the work. I have included comments in the code to explain what it does

```HTML
          template: function() {
            return angular.element(document.querySelector("#datepickerTemplate")).html()
          }
        }
      })
```

This last part of the directive specifies the template HTML

```HTML
      .controller("datepickerCtrl", function($scope) {
        $scope.dateValue = new Date()
      })
    </script>
  </head>
```
The controller only has to initialize the `Date` object which is bound to the dt variable in the directive's scope 

```HTML
  <body ng-controller="datepickerCtrl">
    <div my-datepicker format="ddMMMyyyy" value="dateValue" class="form-group" style="margin: 20px;"></div>
    <div style="margin: 20px;">
      <span>{{dateValue.toDateString()}}</span>
    </div>
  </body>
</html>
```

The HTML body specifies `datepickerCtrl` as its controller. It contains the datepicker and displays a string representation of the date.

## Step 4 - Two-way binding

I want to demonstrate the two-way binding between the `dateValue` variable in the controller's scope and the `dt` variable in the directive's scope.
I will create two datepickers which represent the month in different formats, but share the same date, and I'll add a button and a controller behaviour to increment the date by one day.

I am expecting to see the following functionality in the app:
* Changing the date in either datepicker will update the string representation of the date
* Clicking the button will add one day to the date and update both controls 
* Both datepickers stay in sync with each other

You can see a demo here: http://mean-stack.github.io/datepicker/datepicker2.html

Here are the changes I made:

```HTML
...
  var updateElements = function(dateVal) {
    scope.date.day = dateVal.getDate()
    scope.date.month = scope.months[dateVal.getMonth()]
    scope.date.year = dateVal.getFullYear()
  }

  scope.date = {
    day: scope.dt.getDate(),
    month: scope.months[scope.dt.getMonth()],
    year: scope.dt.getFullYear()
  }

  //watchers
  scope.$watch('date.day', function(newValue) {
    console.log('day changed to '+newValue)
    scope.dt.setDate(newValue)
    updateElements(scope.dt)
  });

  scope.$watch('date.month', function(newValue) {
    console.log('month changed to '+newValue)
    for (var i=0; i<scope.months.length; i++) {
      if (newValue == scope.months[i]){
        scope.dt.setMonth(i)
      }
   }
   updateElements(scope.dt)
 })

scope.$watch('date.year', function(newValue) {
  console.log('year changed to '+newValue)
  scope.dt.setFullYear(newValue)
  updateElements(scope.dt)
})
			
scope.$watch('dt', function(newValue) {
  console.log('dt changed to '+newValue.toDateString())
  updateElements(newValue)
})
...
```

I have added a function to watch for changes to `dt` on the directive's scope (for example, when the user clicks the button to add a day to the date). In the watcher I call the `updateElements` function to update the values of the datepicker elements which represent the day, month, and year.

```HTML
...
  .controller("datepickerCtrl", function($scope, $interval) {
    $scope.dateValue = new Date()

    $scope.incDate = function() {
      var t = $scope.dateValue.getTime()
      t += 24*60*60*1000
      $scope.dateValue = new Date(t)
    }
  })
```

In the controller I have added a behaviour - a function which will be called when the button is clicked to add one day to the date

```HTML
...
  <body ng-controller="datepickerCtrl">
    <div my-datepicker format="ddMMMyyyy" value="dateValue" class="form-group" style="margin: 20px;"></div>
    <div my-datepicker format="ddMMyy" value="dateValue" class="form-group" style="margin: 20px;"></div>
	<div style="margin: 20px;">
	  <span>{{dateValue.toDateString()}}</span>
	</div>
    <button class="btn" ng-click="incDate()" style="margin-left: 20px">Date++</button>
  </body>
</html>
```

In the HTML I have added a second datepicker, this one with a numeric representation of the month.
Both datepickers are bound to the same dateValue
Finally, I added a button to allow the user to increase the date.

Mostly it all works as expected, but for some reason if I use one the datepicker input elements to change the day (or month or year) the other datepicker doesn't change. The data values do change for each datepicker, but the views don't update :(

At first I thought this was just a bug, or a minor problem which could be fixed by calling `scope.$apply()` in the watch function. Now I'm not so sure. I think I will have to refactor the code to use a second `myDatepickerInputElement` directive, and requiring this directive in the `myDatepicker` directive. 

I'll come back to this later...

## Step 5 - Quick dates

First, I'm going to implement quick dates outside the directive using a simple controller behaviour.

You can see a demo here: http://mean-stack.github.io/datepicker/datepicker3.html

There are no changes to the directive. Here are the changes to the controller and the HTML:

```HTML
  <script>
  ...
  .controller("datepickerCtrl", function($scope) {
    $scope.dateValue = new Date()

    $scope.quickDates = [
      {date: new Date(0), description: 'epoch'},
      {date: new Date(), description: 'today'},
      {date: new Date("October 13, 2014 11:13:00"), description: 'October 13, 2014'}
    ]

    $scope.change = function() {
      if ($scope.quickDateValue && $scope.quickDateValue.date) {
        $scope.dateValue = $scope.quickDateValue.date
      }
    }
  })
  </script>
  </head>
  <body ng-controller="datepickerCtrl">
    <div my-datepicker format="ddMMMyyyy" value="dateValue" class="form-group" style="margin: 20px;"></div>
    <select ng-model="quickDateValue" ng-change="change()" class="form-control datepicker" ng-options="date.description for date in quickDates" style="margin: 20px;">
      <option value="">Quick Dates</option>
    </select>
 	<div style="margin: 20px;">
	  <span><strong>Selected date:</strong> {{dateValue.toDateString()}}</span>
	</div>
  </body>
</html>
```

This works really well but it doesn't look very good. I want the new `select` element to be adjacent to the other datepicker elements. I can think of a couple of ways to achieve this. I'll demonstrate both ways in the following two sections.

## Step 6 - Transclusion

In AngularJS transclusion means inserting one part of an HTML document into another by reference. In the context of directives it means allowing a directive to wrap arbitrary HTML content. In our case the `myDatepicker` directive will wrap the quick dates `select` element.

You can see a demo here:

This is how the HTML looks:

```HTML
...
  <body ng-controller="datepickerCtrl">
    <div my-datepicker format="ddMMMyyyy" value="dateValue" class="form-group" style="margin: 20px;">
      <select ng-model="extra.quickDateValue" ng-change="change()" class="form-control datepicker" ng-options="date.description for date in quickDates">
        <option value="">Quick Dates</option>
      </select>
    </div>
    <div style="margin: 20px;">
	  <span><strong>Selected date:</strong> {{dateValue.toDateString()}}</span>
	</div>
  </body>
...
```

All I have done is to move the `select` element inside the datepicker. I also had to make a change to the definition of `quickDateValue` in the scope. It's not generally good practice to define `ng-model` values directly on the scope, due to problems which arise due to JavaScript's prototypal inheritance. Basically, the rule is: "If you are using `ng-model` then you have to have a dot in there somewhere".
