angular.module("datepickerTemplate", [])
.run(["$templateCache", function($templateCache) {
  $templateCache.put('dayTemplate', '<input ng-model-options="{ updateOn: \'blur\' }" ng-model="date.day" class="form-control datepicker" type="text" size="2" maxlength="2">')
  $templateCache.put('monthTemplate', '<select ng-model="date.month" class="form-control datepicker" name="month" ng-options="month as month for month in months"></select>')
  $templateCache.put('yearTemplate', '<input ng-model-options="{ updateOn: \'blur\' }" ng-model="date.year" class="form-control datepicker" type="text" name="year" size="4" maxlength="4">')
  $templateCache.put('quickDatesTemplate', '<select ng-if="settings.showQuickDates" ng-model="date.quickDateValue" ng-change="change()" class="form-control datepicker" ng-options="date.description for date in quickDates"><option value="">Quick Dates</option></select>')
}])
angular.module("datepicker", ["datepickerTemplate"])
.directive("myDatepicker", function($templateCache) {
  return {
    scope: {
      dt: "=value",
      quickDates: "=quickDates",
      dtMin: "=minDate",
      dtMax: "=maxDate"
    },
    link: function(scope, element, attrs) {
    
      var isValid = function(date) {
        if (scope.dtMin) {
          if (date.getTime() < scope.dtMin.getTime()) {
            return false
          }
        }
        if (scope.dtMax) {
          if (date.getTime() > scope.dtMax.getTime()) {
            return false
          }
        }
        return true
      }

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
      if (dateFormat !== 'empty') {
        scope.settings.showFullYear = /yyyy/.test(dateFormat)
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
      scope.$watch('date.day', function(newValue, oldValue) {
      console.log('day changed')
        var d = new Date(scope.dt.getTime())
        d.setDate(newValue)
        if (isValid(d)) {
          scope.dt.setDate(newValue)
        }
        updateElements(scope.dt)
        refreshQuickDates()
      });

      scope.$watch('date.month', function(newValue, oldValue) {
        var d = new Date(scope.dt.getTime())
        for (var i=0; i<scope.months.length; i++) {
          if (newValue == scope.months[i]){
            d.setMonth(i)
          }
        }
        if (isValid(d)) {
          scope.dt.setTime(d.getTime())
        }
        updateElements(scope.dt)
        refreshQuickDates()
      })

      scope.$watch('date.year', function(newValue, oldValue) {
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
        var d = new Date(scope.dt.getTime())
        d.setFullYear(newYear)
        if (isValid(d)) {
          scope.dt.setFullYear(newYear)
        }
        updateElements(scope.dt)
        refreshQuickDates()
      })
			
      scope.$watch('dt', function(newValue, oldValue) {
        if (!isValid(newValue)) {
          scope.dt.setTime(oldValue.getTime())
        }
        updateElements(newValue)
        refreshQuickDates()
      }, true) // 'true' here means watch date by value rather than reference

      scope.change = function() {
        if (scope.date.quickDateValue && scope.date.quickDateValue.date) {
          if (isValid(scope.date.quickDateValue.date)) {
            scope.dt.setTime(scope.date.quickDateValue.date.getTime())
            updateElements(scope.dt)
          }
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
