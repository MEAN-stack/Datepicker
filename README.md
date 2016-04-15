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

## <pre>&lt;input&gt;</pre>&nbsp;or&nbsp;<pre>&lt;select&gt;</pre>
