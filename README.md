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

## &lt;input&gt;&nbsp;or&nbsp;&lt;select&gt;

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

## Step 1 HTML and CSS

As usual, I'm going to design and implement my control from the ground up, so I'll start with a piece of static HTML.
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
