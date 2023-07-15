# Date Calculator

We want to be able easily construct dates using a shorthand syntax that looks like `'now-1d/d'`. You
might have seen something like this before if you've used Elasticsearch range queries. Please create
two functions, one called `parse` which will take a string like the above and return a date, and
another called `stringify` which will take a date, and return a string like the above.

Things to know:

- Please don't use any date or time related libraries
- All times are in UTC
- Follow the process you would if implementing this in real life

### Signatures

```ts
type DateString = String;

type DateFunctions = {
  parse(datestring: DateString): Date
  stringify(date: Date): DateString
}
```

## Glossary

### Units

This is an exhaustive list of units of time:

```
d day
M month
y year
h hour
m minute
s second
w week
```

### Operators

This is an exhaustive list of operators:

```
- subtract
+ add
/{unit} round to closest unit
```

## Examples

Given the current date and time is `2020-05-01T00:00:00.000Z`:

```
now-1y/y  -> 2019-01-01T00:00:00.000Z - now minus one year rounded to the nearest year
now/y     -> 2020-01-01T00:00:00.000Z - now rounded to the nearest year
now-1d    -> 2020-04-30T00:00:00.000Z - now minus 1 day
now+1d    -> 2020-05-02T00:00:00.000Z - now add 1 day
now-4d-4h -> 2020-04-26T20:00:00.000Z - now minus four days and four hours
```