# Datepicker

## Table of Contents
- [Introduction](#introduction)
- [HTML5](#html5)
- [Angular UI Bootstrap](#angular-ui-bootstrap)
- [My datepicker](#my-datepicker)
- [input or select?](#inputorselect-)
- [Quick Dates](#quick-dates)
- [Step 1 - HTML and CSS](#step-1---html-and-css)
- [Step 2 - Specifying the date format](#step-2---specifying-the-date-format)
- [Step 3 - Create the Directive](#step-3---create-the-directive)
- [Step 4 - Two-way binding](#step-4---two-way-binding)
- [Step 5 - Quick Dates](#step-5---quick-dates)
- [Step 6 - Transclusion](#step-6---transclusion)
- [Step 7 - Built-in quick dates](#step-7---built-in-quick-dates)
- [Step 8 - Two-way binding revisited](#step-8---two-way-binding-revisited)
- [Step 9 - A proper implementation of the format attribute](#step-9---a-proper-implementation-of-the-format-attribute)
- [Step 10 - Reuse](#step-10---reuse)
- [Step 11 - Unit testing](#step-11---unit-testing)
- [Step 12 - End-to-end testing](#step-12---end-to-end-testing)

## Introduction
There are a couple of places in my web application the user needs to enter a date, and optionally, a time.
Use cases are:

 * Date of birth - time not required, but date could be many years in the past.
 * Card expiry date - only month and year required.
 * Auction end date - limited to dates from now to 10 days in the future, optionally include a time.

In all cases it should be possible to set min and max allowed dates.
The control doesn't need to be fancy, just configurable, and simple to use.
And I want to avoid any posible confusion over day/month.

### Demo
If you just want to see the end result there are demo pages here:

http://mean-stack.github.io/datepicker/datepicker8.html

And the source code is here:

https://github.com/MEAN-stack/MEAN-stack.github.io/blob/master/datepicker/datepicker8.html


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

### ...The fix

I just read this article: http://teropa.info/blog/2014/01/26/the-three-watch-depths-of-angularjs.html

Now I know how to fix the problem with the two datepickers staying in sync, and also why the problem doesn't manifest itself with a single datepicker:
It just happens that when I wrote the `incDate()` function I had it create a new Date object each time:

```JavaScript
    $scope.incDate = function() {
      var t = $scope.dateValue.getTime()
      t += 24*60*60*1000
      $scope.dateValue = new Date(t)
    }
```

Had I written it like this:

```JavaScript
    $scope.incDate = function() {
      var t = $scope.dateValue.getTime()
      t += 24*60*60*1000
      $scope.dateValue.setTime(t)
    }
```

then clicking the button would not have triggered the watcher, and neither date control would have updated.
The fix is simply to use a deeper level of watcher - an equality watcher - like this:

```JavaScript
  scope.$watch('dt', function(newValue) {
    console.log('dt changed to '+newValue.toDateString())
    updateElements(newValue)
  }, true)
```

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

You can see a demo here: http://mean-stack.github.io/datepicker/datepicker4.html

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

All I have done is to move the `select` element inside the datepicker. I also had to make a change to the definition of `quickDateValue` in the scope. It's not generally good practice to define `ng-model` values directly on the scope, due to problems which arise due to JavaScript's prototypal inheritance. Basically, the rule is: <b>If you are using `ng-model` then you have to have a dot in there somewhere".</b>

Here's the controller:

```JavaScript
  .controller("datepickerCtrl", function($scope) {
    $scope.dateValue = new Date()

    $scope.quickDates = [
      {date: new Date(0), description: 'epoch'},
      {date: new Date(), description: 'today'},
      {date: new Date("October 13, 2014 11:13:00"), description: 'October 13, 2014'}
    ]
        
    $scope.extra = {
      quickDateValue: null
    }
        
    $scope.change = function() {
      if ($scope.extra.quickDateValue && $scope.extra.quickDateValue.date) {
        $scope.dateValue = $scope.extra.quickDateValue.date
      }
    }
  })
```

There are two simple changes to the directive which make transclusion happen:

The first is to add this line to the object returned by the directive's factory function:
```JavaScript
transclude: true
```

The second is to specify where in the directive's template the transclusion should occur:

```HTML
  <script type="text/template" id="datepickerTemplate">
    <input ng-if="settings.showDay" ng-model="date.day" class="form-control datepicker" type="text" size="2" maxlength="2"
   ><select ng-if="settings.showMonth" ng-model="date.month" class="form-control datepicker" name="month" ng-options="month as month for month in months"></select
   ><input ng-if="settings.showYear" ng-model="date.year" class="form-control datepicker" type="text" name="year" size="4" maxlength="4"
   ><span ng-transclude style="position: relative; left:-4px;"></span>
 </script>
```

You can see that I added a `span` element at the end of the template to wrap the transcluded content. I tried to make sure that there would be no space between the elements but Angular's compiler adds some space, so I styled the element to compensate.

## Step 7 - Built-in quick dates

One of the problems with the quick date examples above is that I want the quick date selection to reset itself to showing "Quick Dates" if the user changes the date using one of the other elements. That's actually quite hard to do.
Also, I really like the quick dates feature, so I'm going to try building it into the myDatepicker directive.

As per usual, you can see a demo here: http://mean-stack.github.io/datepicker/datepicker5.html

and the complete HTML is here:

```HTML
<!DOCTYPE html>
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
	<script type="text/template" id="datepickerTemplate">
	  <input ng-if="settings.showDay" ng-model="date.day" class="form-control datepicker" type="text" size="2" maxlength="2"
	 ><select ng-if="settings.showMonth" ng-model="date.month" class="form-control datepicker" name="month" ng-options="month as month for month in months"></select
     ><input ng-if="settings.showYear" ng-model="date.year" class="form-control datepicker" type="text" name="year" size="4" maxlength="4"
     ><select ng-if="settings.showQuickDates" ng-model="date.quickDateValue" ng-change="change()" class="form-control datepicker" ng-options="date.description for date in quickDates">
        <option value="">Quick Dates</option>
      </select>
    </script>
	<script>
      angular.module("datepickerApp", [])
	  .directive("myDatepicker", function() {
	    return {
          scope: {
            dt: "=value",
            quickDates: "=quickDates"            
	      },
		  link: function(scope, element, attrs) {
		    var dateFormat = 'ddMMyyyy'
		    if (attrs['format']) {
			  dateFormat = attrs['format']
			}
			scope.settings = {
		      showDay: false,
		      showMonth: false,
		      showYear: false,
              showQuickDates: false
		    }
            scope.settings.showDay = /dd/.test(dateFormat)
            scope.settings.showMonth = /MM/.test(dateFormat)
            scope.settings.showYear = /yy/.test(dateFormat)
            if (scope.quickDates) {
              scope.settings.showQuickDates = true
            }
			  
            scope.months = []
			if (/MMMM/.test(dateFormat)) {
			 scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
			}
			else if (/MMM/.test(dateFormat)) {
			  scope.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
			}
			else if (/MM/.test(dateFormat)) {
			  scope.months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
			}

			var updateElements = function(dateVal) {
		      scope.date.day = dateVal.getDate()
		      scope.date.month = scope.months[dateVal.getMonth()]
		      scope.date.year = dateVal.getFullYear()
            }
			
            // Reset the quick dates selection to "Quick Dates" if the date has been changed via one of the other controls  
            var refreshQuickDates = function() {
              if (scope.date.quickDateValue) {
                if (scope.dt.getTime() !== scope.date.quickDateValue.date.getTime()) {
                  scope.date.quickDateValue = null
                }
              }
            }
            
			scope.date = {
			  day: scope.dt.getDate(),
			  month: scope.months[scope.dt.getMonth()],
			  year: scope.dt.getFullYear(),
              quickDateValue: null
			}

	        //watchers
			scope.$watch('date.day', function(newValue) {
			  scope.dt.setDate(newValue)
			  updateElements(scope.dt)
              refreshQuickDates()
	        });

			scope.$watch('date.month', function(newValue) {
  			  for (var i=0; i<scope.months.length; i++) {
			    if (newValue == scope.months[i]){
				  scope.dt.setMonth(i)
				}
			  }
			  updateElements(scope.dt)
              refreshQuickDates()
	        })

			scope.$watch('date.year', function(newValue) {
			  scope.dt.setFullYear(newValue)
			  updateElements(scope.dt)
              refreshQuickDates()
	        })
			
			scope.$watch('dt', function(newValue) {
			  updateElements(newValue)
              refreshQuickDates()
			})

            scope.change = function() {
              if (scope.date.quickDateValue && scope.date.quickDateValue.date) {
                scope.dt.setTime(scope.date.quickDateValue.date.getTime())
                updateElements(scope.dt)
              }
            }
          },
		  template: function() {
		    return angular.element(document.querySelector("#datepickerTemplate")).html()
		  }
        }
	  })
	  .controller("datepickerCtrl", function($scope) {
		$scope.dateValue = new Date()

        $scope.quickDates = [
          {date: new Date(0), description: 'epoch'},
          {date: new Date(), description: 'today'},
          {date: new Date("October 13, 2014 11:13:00"), description: 'October 13, 2014'}
        ]
	  })
	</script>
  </head>
  <body ng-controller="datepickerCtrl">
    <div my-datepicker format="ddMMMyyyy" quick-dates="quickDates" value="dateValue" class="form-group" style="margin: 20px;"></div>
    <div style="margin: 20px;">
	  <span><strong>Selected date:</strong> {{dateValue.toDateString()}}</span>
	</div>
  </body>
</html>
```

## Step 8 - Two-way binding revisited

Now that my datepicker is working well, I want to revisit the problem I described at the end of Step 4.
I think the issue is that Angular's digest loop is not picking up changes to the date represented by date object. It will only notice when the actual object changes.

In terms of code:

```JavaScript
  dt.setTime(someNewValue)    // Angular doesn't see the change
  dt = new Date(someNewValue) // Angular does see the change
```

I am going to make some changes to the datepicker sampl so that it uses a numeric timestamp rather than a Date object to represent the date.

Here's the demo: http://mean-stack.github.io/datepicker/datepicker6.html

And here's the code:

```HTML
<!DOCTYPE html>
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
    <script type="text/template" id="datepickerTemplate">
      <input ng-if="settings.showDay" ng-model="date.day" class="form-control datepicker" type="text" size="2" maxlength="2"
     ><select ng-if="settings.showMonth" ng-model="date.month" class="form-control datepicker" name="month" ng-options="month as month for month in months"></select
     ><input ng-if="settings.showYear" ng-model="date.year" class="form-control datepicker" type="text" name="year" size="4" maxlength="4"
     ><select ng-if="settings.showQuickDates" ng-model="date.quickDateValue" ng-change="change()" class="form-control datepicker" ng-options="date.description for date in quickDates">
        <option value="">Quick Dates</option>
      </select>
    </script>
    <script>
      angular.module("datepickerApp", [])
      .directive("myDatepicker", function() {
        return {
          scope: {
            dt: "=value",
            quickDates: "=quickDates"            
          },
          link: function(scope, element, attrs) {
            var dateFormat = 'ddMMyyyy'
            if (attrs['format']) {
              dateFormat = attrs['format']
            }
            scope.settings = {
              showDay: false,
              showMonth: false,
              showYear: false,
              showQuickDates: false
            }
            scope.settings.showDay = /dd/.test(dateFormat)
            scope.settings.showMonth = /MM/.test(dateFormat)
            scope.settings.showYear = /yy/.test(dateFormat)
            if (scope.quickDates) {
              scope.settings.showQuickDates = true
            }
		  
            scope.months = []
            if (/MMMM/.test(dateFormat)) {
              scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            }
            else if (/MMM/.test(dateFormat)) {
              scope.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            }
            else if (/MM/.test(dateFormat)) {
              scope.months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
            }

            var updateElements = function(dateVal) {
              scope.date.day = new Date(dateVal).getDate()
              scope.date.month = scope.months[new Date(dateVal).getMonth()]
              scope.date.year = new Date(dateVal).getFullYear()
            }
			
            // Reset the quick dates selection to "Quick Dates" if the date has been changed via one of the other controls  
            var refreshQuickDates = function() {
              if (scope.date.quickDateValue) {
                if (scope.dt !== scope.date.quickDateValue.date) {
                  scope.date.quickDateValue = null
                }
              }
            }
            
            scope.date = {
              day: new Date(scope.dt).getDate(),
              month: scope.months[new Date(scope.dt).getMonth()],
              year: new Date(scope.dt).getFullYear(),
              quickDateValue: null
            }

            //watchers
            scope.$watch('date.day', function(newValue) {
              var d = new Date(scope.dt)
              d.setDate(newValue)
              scope.dt = d.getTime()
              updateElements(scope.dt)
              refreshQuickDates()
            });

            scope.$watch('date.month', function(newValue) {
              for (var i=0; i<scope.months.length; i++) {
                if (newValue == scope.months[i]) {
                  var d = new Date(scope.dt)
                  d.setMonth(i)
                  scope.dt = d.getTime()
                }
              }
              updateElements(scope.dt)
              refreshQuickDates()
            })

            scope.$watch('date.year', function(newValue) {
              var d = new Date(scope.dt)
              d.setFullYear(newValue)
              scope.dt = d.getTime()
              updateElements(scope.dt)
              refreshQuickDates()
            })

            scope.$watch('dt', function(newValue) {
              updateElements(newValue)
              refreshQuickDates()
            })

            scope.change = function() {
              if (scope.date.quickDateValue) {
                scope.dt = scope.date.quickDateValue.date
                updateElements(scope.dt)
              }
            }
          },
          template: function() {
            return angular.element(document.querySelector("#datepickerTemplate")).html()
          }
        }
      })
      .controller("datepickerCtrl", function($scope) {
        $scope.dateValue = new Date().getTime()

        $scope.incDate = function() {
          $scope.dateValue += 24*60*60*1000
        }

        $scope.dateString = function() {
          return new Date($scope.dateValue).toDateString()
        }
        
        $scope.quickDates = [
          {date: 0, description: 'epoch'},
          {date: new Date().getTime(), description: 'today'},
          {date: new Date("October 13, 2014 11:13:00").getTime(), description: 'October 13, 2014'}
        ]
      })
    </script>
  </head>
  <body ng-controller="datepickerCtrl">
    <div my-datepicker format="ddMMMyyyy" quick-dates="quickDates" value="dateValue" class="form-group" style="margin: 20px;"></div>
    <div my-datepicker format="ddMMyy" value="dateValue" class="form-group" style="margin: 20px;"></div>
    <div style="margin: 20px;">
      <span><strong>Selected date:</strong> {{dateString()}}</span>
    </div>
    <button class="btn" ng-click="incDate()" style="margin-left: 20px">Date++</button>
  </body>
</html>
```

## Step 9 - A proper implementation of the format attribute

Remember that part of the original spec was that the format attribute could be used to arrange the elements of the datepicker. For example like this:

```HTML
<div my-datepicker format="MM/yy">
```

![Screenshot](https://github.com/MEAN-stack/Datepicker/blob/master/date2.png)

Below, I'll describe the changes I made to achieve this. There is a demo here:

http://mean-stack.github.io/datepicker/datepicker8.html

First I need to deal with two-digit representation of year. This is a pain to implement and I don't recommend its use. The problem is the ambiguity over the century - does `50` mean `1950` or `2050` or something else? The only reason for supporting this feature is that credit card expiry dates are often shown this way. I have used the convention that 70 .. 99 means 1970 .. 1999, whereas 00 ..69 means 2000 ..2069

Next I need to split out the directive template into its separate elements and write a template function which parses the format string:

```HTML
  <script type="text/template" id="datepickerDayTemplate">
    <input ng-model="date.day" class="form-control datepicker" type="text" size="2" maxlength="2">
  </script>
  <script type="text/template" id="datepickerMonthTemplate">
    <select ng-model="date.month" class="form-control datepicker" name="month" ng-options="month as month for month in months"></select>
  </script>
  <script type="text/template" id="datepickerYearTemplate">
    <input ng-model="date.year" class="form-control datepicker" type="text" name="year" size="4" maxlength="4">
  </script>
  <script type="text/template" id="datepickerQuickDatesTemplate">
    <select ng-if="settings.showQuickDates" ng-model="date.quickDateValue" ng-change="change()" class="form-control datepicker" ng-options="date.description for date in quickDates">
      <option value="">Quick Dates</option>
    </select>
  </script>
```

```JavaScript
    template: function(elem, attrs) {
      var dateFormat = 'ddMMyyyy'
      if (attrs['format']) {
        if (attrs['format']==='empty') {
          dateFormat = ""
        }
        else {
          dateFormat = attrs['format']
       }
      }
      var template = ""
      var showDay = /dd/.test(dateFormat)
      var showMonth = /MM/.test(dateFormat)
      var showYear = /yy/.test(dateFormat)
            
      // parse the dateFormat string to produce the template
      var arr = dateFormat.split('')
      var i = 0
      var cur = ''
      var next = ''
           
      while (i<arr.length) {
      cur = arr[i]
        if (i<arr.length-1) {
          next = arr[i+1]
        }
        else {
          next = ''
        }
        switch (cur) {
          case 'd':
            if (next == 'd') {
              i++
              while (arr[i+1]=='d') {
                i++
              }
              template += angular.element(document.querySelector("#datepickerDayTemplate")).html().trim()
            }
            else {
              template += 'd'
            }
            break;
          case 'M':
            if (next == 'M') {
              i++
              while (arr[i+1]=='M') {
                i++
              }
              template += angular.element(document.querySelector("#datepickerMonthTemplate")).html().trim()
            }
            else {
              template += 'M'
            }
            break;
          case 'y':
            if (next == 'y') {
              i++
              while (arr[i+1]=='y') {
                i++
              }
              template += angular.element(document.querySelector("#datepickerYearTemplate")).html().trim()
            }
            else {
              template += 'y'
            }
            break;
          default:
            template += arr[i]
            break;
        }
        i++
      }
      template += angular.element(document.querySelector("#datepickerQuickDatesTemplate")).html().trim()
      return template
    }
```

## Step 10 - Reuse

In order to make this control really useful I am going to package it up in a separate file: datepicker.js

I'll also simplify things a little by writing the directive's template elements into Angular's template cache.

As usual, there's a demo here: 

http://mean-stack.github.io/datepicker/datepicker9.html

Here's <b>datepicker.js</b>:

```JavaScript
angular.module("datepickerTemplate", [])
.run(["$templateCache", function($templateCache) {
  $templateCache.put('dayTemplate', '<input ng-model="date.day" class="form-control datepicker" type="text" size="2" maxlength="2">')
  $templateCache.put('monthTemplate', '<select ng-model="date.month" class="form-control datepicker" name="month" ng-options="month as month for month in months"></select>')
  $templateCache.put('yearTemplate', '<input ng-model="date.year" class="form-control datepicker" type="text" name="year" size="4" maxlength="4">')
  $templateCache.put('quickDatesTemplate', '<select ng-if="settings.showQuickDates" ng-model="date.quickDateValue" ng-change="change()" class="form-control datepicker" ng-options="date.description for date in quickDates"><option value="">Quick Dates</option></select>')
}])
angular.module("datepicker", ["datepickerTemplate"])
.directive("myDatepicker", function($templateCache) {
  return {
    scope: {
      dt: "=value",
      quickDates: "=quickDates"            
    },
    link: function(scope, element, attrs) {
      var dateFormat = 'ddMMyyyy'
      if (attrs['format']) {
        dateFormat = attrs['format']
      }
      scope.settings = {
        showQuickDates: false,
        showFullYear: true
      }
      if (scope.quickDates) {
        scope.settings.showQuickDates = true
      }
      scope.settings.showFullYear = /yyyy/.test(dateFormat)

      scope.months = []
      if (/MMMM/.test(dateFormat)) {
        scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      }
      else if (/MMM/.test(dateFormat)) {
        scope.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      }
      else if (/MM/.test(dateFormat)) {
        scope.months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
      }

      var updateElements = function(dateVal) {
        scope.date.day = dateVal.getDate()
        scope.date.month = scope.months[dateVal.getMonth()]
        scope.date.year = dateVal.getFullYear()
        if (!scope.settings.showFullYear) {
          scope.date.year %= 100 
        }
      }
		
      // Reset the quick dates selection to "Quick Dates" if the date has been changed via one of the other controls  
      var refreshQuickDates = function() {
        if (scope.date.quickDateValue) {
          if (scope.dt.getTime() !== scope.date.quickDateValue.date.getTime()) {
            scope.date.quickDateValue = null
          }
        }
      }
            
      scope.date = {
        day: scope.dt.getDate(),
        month: scope.months[scope.dt.getMonth()],
        year: scope.dt.getFullYear(),
        quickDateValue: null
      }
      if (!scope.settings.showFullYear) {
        scope.date.year %= 100 
      }

      //watchers
      scope.$watch('date.day', function(newValue) {
        scope.dt.setDate(newValue)
        updateElements(scope.dt)
        refreshQuickDates()
      });

      scope.$watch('date.month', function(newValue) {
        for (var i=0; i<scope.months.length; i++) {
          if (newValue == scope.months[i]){
            scope.dt.setMonth(i)
          }
        }
        updateElements(scope.dt)
        refreshQuickDates()
      })

      scope.$watch('date.year', function(newValue) {
        var newYear = newValue*1
        if (!scope.settings.showFullYear) {
        // assume that values >= 70 are 20th century
        if (newYear>=70) {
          newYear += 1900
        }
        else {
          newYear += 2000
        }
      }
      scope.dt.setFullYear(newYear)
        updateElements(scope.dt)
        refreshQuickDates()
      })
			
      scope.$watch('dt', function(newValue) {
        updateElements(newValue)
        refreshQuickDates()
      }, true) // 'true' here means watch date by value rather than reference

      scope.change = function() {
        if (scope.date.quickDateValue && scope.date.quickDateValue.date) {
          scope.dt.setTime(scope.date.quickDateValue.date.getTime())
          updateElements(scope.dt)
        }
      }
    },
    template: function(elem, attrs) {
      var dateFormat = 'ddMMyyyy'
      if (attrs['format']) {
        if (attrs['format']==='empty') {
          dateFormat = ""
        }
        else {
          dateFormat = attrs['format']
        }
      }
      var template = ""
      var showDay = /dd/.test(dateFormat)
      var showMonth = /MM/.test(dateFormat)
      var showYear = /yy/.test(dateFormat)
            
      // parse the dateFormat string to produce the template
      var arr = dateFormat.split('')
      var i = 0
      var cur = ''
      var next = ''
            
      while (i<arr.length) {
        cur = arr[i]
        if (i<arr.length-1) {
          next = arr[i+1]
        }
        else {
          next = ''
        }
        switch (cur) {
        case 'd':
          if (next == 'd') {
            i++
            while (arr[i+1]=='d') {
              i++
            }
            template += $templateCache.get('dayTemplate').trim()
          }
          else {
            template += 'd'
          }
          break;

        case 'M':
          if (next == 'M') {
            i++
            while (arr[i+1]=='M') {
              i++
            }
            template += $templateCache.get('monthTemplate').trim()
          }
          else {
            template += 'M'
          }
          break;
 
        case 'y':
          if (next == 'y') {
            i++
            while (arr[i+1]=='y') {
              i++
            }
            template += $templateCache.get('yearTemplate').trim()
          }
          else {
            template += 'y'
          }
          break;

        default:
          template += arr[i]
          break;
        }
        i++
      }
      template += $templateCache.get('quickDatesTemplate').trim()
      return template
    }
  }
})
```

And here's the HTML which includes the controller:

```HTML
<!DOCTYPE html>
<html ng-app="datepickerApp">
  <head>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.9/angular.js"></script>
    <script src="datepicker.js"></script>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.css">
	<style>
   	.datepicker {
	  border-radius:0;
	  width: auto;
	  display: inline-block;
	}
	</style>
	<script>
      angular.module("datepickerApp", ["datepicker"])
      .controller("datepickerCtrl", function($scope) {
		$scope.dateValue = new Date()

        $scope.incDate = function() {
          $scope.dateValue.setTime($scope.dateValue.getTime() + 24*60*60*1000)
        }

        $scope.quickDates = [
          {date: new Date(0), description: 'epoch'},
          {date: new Date(), description: 'today'},
          {date: new Date("October 13, 2014 11:13:00"), description: 'October 13, 2014'}
        ]
	  })
	</script>
  </head>
  <body ng-controller="datepickerCtrl">
    <div class="form-group">
      <label class="col-sm-2 control-label">format=&quot;ddMMyyyy&quot;</label>
      <div class="col-sm-10">
        <div my-datepicker format="ddMMyyyy" quick-dates="quickDates" value="dateValue" class="form-group" style="font-size: 1.5em;"></div>
      </div>
    </div>
    <div class="form-group">
      <label class="col-sm-2 control-label">format=&quot;ddMMMyyyy&quot;</label>
      <div class="col-sm-10">
        <div my-datepicker format="ddMMMyyyy" value="dateValue" class="form-group" style="font-size: 1.5em;"></div>
      </div>
    </div>
    <div class="form-group">
      <label class="col-sm-2 control-label">format=&quot;ddMMMMyyyy&quot;</label>
      <div class="col-sm-10">
        <div my-datepicker format="ddMMMMyyyy" value="dateValue" class="form-group" style="font-size: 1.5em;"></div>
      </div>
    </div>
    <div class="form-group">
      <label class="col-sm-2 control-label">format=&quot;MM / yy&quot;</label>
      <div class="col-sm-10">
        <div my-datepicker format="MM / yy" value="dateValue" class="form-group" style="font-size: 1.5em;"></div>
      </div>
    </div>
    <div class="form-group">
      <label class="col-sm-2 control-label">format=&quot;yyyy-MM-dd&quot;</label>
      <div class="col-sm-10">
        <div my-datepicker format="yyyy-MM-dd" value="dateValue" class="form-group" style="font-size: 1.5em;"></div>
      </div>
    </div>
    <div class="form-group">
      <label class="col-sm-2 control-label">format=&quot;empty&quot;</label>
      <div class="col-sm-10">
        <div my-datepicker format="empty" quick-dates="quickDates" value="dateValue" class="form-group" style="font-size: 1.5em;"></div>
      </div>
    </div>
    <div style="margin: 20px;">
	  <span><strong>Selected date:</strong> {{dateValue.toDateString()}}</span>
	</div>
    <button class="btn" ng-click="incDate()" style="margin-left: 20px">Date++</button>
  </body>
</html>
```

## Step 11 - Unit Testing

Now that I have my directive in its own JavaScript file, I can move on to the last step - unit testing.

I don't want to discuss the merits of unit testing here - I'll just say that it is only one aspect of testing, which sits alongside scripted end-to-end testing, peer review, manual testing in various web browsers and devices, etc.

I'm using karma as the runner and Jasmine as the framework.

Here's my attempt at unit testing the directive:

```JavaScript
describe("Datepicker directive tests: ", function() {
  var mockScope
  var compileService
  
  beforeEach(angular.mock.module("datepicker"))

  beforeEach(angular.mock.inject(function($rootScope, $compile) {
    mockScope = $rootScope.$new()
    compileService = $compile
    mockScope.dateValue = new Date()
    mockScope.quickDates = [
      {date: new Date("July 13, 1961 00:00:00"), description: 'My birthday'},
      {date: new Date(0), description: 'epoch'},
      {date: new Date(), description: 'today'},
      {date: new Date("Dec 31, 2099 23:59:59"), description: 'End of the century'}
    ]
  }))

  it("Generates default datepicker elements", function(){
    var compileFn = compileService("<div my-datepicker value='dateValue'></div>")
    var elem = compileFn(mockScope)
    mockScope.$digest()
    expect(elem.children().length).toEqual(3)
    expect(elem.children().eq(1).children().length).toEqual(12)
    expect(elem.children().eq(1).find("option").eq(0).text()).toEqual('01')
    expect(elem.children().eq(1).find("option").eq(11).text()).toEqual('12')
  })

  it("Generates datepicker elements for format ddMMMMyyyy", function(){
    var compileFn = compileService("<div my-datepicker format='ddMMMMyyyy' value='dateValue'></div>")
    var elem = compileFn(mockScope)
    mockScope.$digest()
    expect(elem.text()).toEqual('JanuaryFebruaryMarchAprilMayJuneJulyAugustSeptemberOctoberNovemberDecember')
    expect(elem.children().length).toEqual(3)
    expect(elem.children().eq(1).children().length).toEqual(12)
    expect(elem.children().eq(1).find("option").eq(0).text()).toEqual('January')
    expect(elem.children().eq(1).find("option").eq(11).text()).toEqual('December')
  })

  it("Generates datepicker elements for format MM/dd/yyyy", function(){
    var compileFn = compileService("<div my-datepicker format='MM/dd/yyyy' value='dateValue'></div>")
    var elem = compileFn(mockScope)
    mockScope.$digest()
    expect(elem.text()).toEqual('010203040506070809101112//')
    expect(elem.children().length).toEqual(3)
    expect(elem.children().eq(0).children().length).toEqual(12)
    expect(elem.children().eq(0).find("option").eq(0).text()).toEqual('01')
    expect(elem.children().eq(0).find("option").eq(11).text()).toEqual('12')
  })

  it("Generates quick dates", function(){
    var compileFn = compileService("<div my-datepicker format='ddMMyyyy' quick-dates='quickDates' value='dateValue'></div>")
    var elem = compileFn(mockScope)
    mockScope.$digest()
    expect(elem.children().length).toEqual(4)
    expect(elem.children().eq(3).children().length).toEqual(5)
    expect(elem.children().eq(3).find("option").eq(0).text()).toEqual('Quick Dates')
    expect(elem.children().eq(3).find("option").eq(1).text()).toEqual('My birthday')
    expect(elem.children().eq(3).find("option").eq(2).text()).toEqual('epoch')
    expect(elem.children().eq(3).find("option").eq(3).text()).toEqual('today')
    expect(elem.children().eq(3).find("option").eq(4).text()).toEqual('End of the century')
  })

  it("Generates quick dates with empty format", function(){
    var compileFn = compileService("<div my-datepicker format='empty' quick-dates='quickDates' value='dateValue'></div>")
    var elem = compileFn(mockScope)
    mockScope.$digest()
    expect(elem.children().length).toEqual(1)
    expect(elem.children().eq(0).children().length).toEqual(5)
    expect(elem.children().eq(0).find("option").eq(0).text()).toEqual('Quick Dates')
    expect(elem.children().eq(0).find("option").eq(1).text()).toEqual('My birthday')
    expect(elem.children().eq(0).find("option").eq(2).text()).toEqual('epoch')
    expect(elem.children().eq(0).find("option").eq(3).text()).toEqual('today')
    expect(elem.children().eq(0).find("option").eq(4).text()).toEqual('End of the century')
  })
})
```

## Step 12 - End-to-end testing

Here are some end-to-end tests which I use to test the various interactions between the directive and controller.

To run these tests you would need to set up a webserver to serve angular.js, datepicker.js, and the html page (datepicker9.html). I have used a local node.js server listening on port 3000.

You will also need to install protractor (the test runner), mocha (the framework), and chai (an assertion library). The steps are something like:

```
npm install protractor
./node_modules/.bin/webdriver-manager update
npm install mocha
npm install chai
```

And you'll need a config file for protractor <b>protractor.conf.js</b>:

```JavaScript
exports.config = {
  framework: 'mocha',
  specs: [
    'test/e2e/**/*.spec.js'
  ],
  mochaOpts: {
    enableTimeouts: false
  }
}
```

Here are the tests:
```JavaScript
var expect = require('chai').expect

describe('datepicker', function() {
  it('initialises the date to today', function() {
  
    var today = new Date()
    var dayVal = "" + today.getDate()
    
    browser.get('http://localhost:3000/datepicker9.html')
    
    var days = element.all(by.model('date.day'))
    days.count().then(function(count){
      expect(count).to.equal(4)
    })
    for (var i=0; i<4; i++) {
      days.get(i).getAttribute('value').then(function(value) {
        expect(value).to.equal(dayVal)
      })
    }
  })
  
  it('increments the date', function() {
  
    var now = new Date().getTime()
    var tomorrow = new Date(now+24*60*60*1000)
    var dayVal = "" + tomorrow.getDate()
    
    browser.get('http://localhost:3000/datepicker9.html')
    element(by.css('#incDate')).click()
    
    var days = element.all(by.model('date.day'))
    for (var i=0; i<4; i++) {
      days.get(i).getAttribute('value').then(function(value) {
        expect(value).to.equal(dayVal)
      })
    }
  })
  
  it('selects a quick date', function() {
  
    var epoch = new Date(0)
    var dayVal = "" + epoch.getDate() // '1' obviously!
    
    browser.get('http://localhost:3000/datepicker9.html')
    element.all(by.cssContainingText('option', 'epoch')).first().click();
    
    var days = element.all(by.model('date.day'))
    for (var i=0; i<4; i++) {
      days.get(i).getAttribute('value').then(function(value) {
        expect(value).to.equal(dayVal)
      })
    }
  })

  it('changes the day', function() {
  
    browser.get('http://localhost:3000/datepicker9.html')
    var el = element.all(by.model('date.day')).first()
    var ctrlA = protractor.Key.chord(protractor.Key.CONTROL, "a");
    el.sendKeys(ctrlA).sendKeys('23')
    
    var days = element.all(by.model('date.day'))
    for (var i=0; i<4; i++) {
      days.get(i).getAttribute('value').then(function(value) {
        expect(value).to.equal('23')
      })
    }
  })
})
```
