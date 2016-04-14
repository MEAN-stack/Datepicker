# Datepicker

There are a couple of places in my web application the user needs to enter a date, and optionally, a time.
Use cases are:

 * Date of birth - time not required, but date could be many years in the past.
 * Card expiry date - only month and year required.
 * Auction end date - limited to dates from now to 10 days in the future, optionally include a time.

In all cases it should be possible to set min and max allowed dates.
