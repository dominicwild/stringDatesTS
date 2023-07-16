import errors from "./errors";

export type DateOperationCommand = "now" | `now${string}`;

type DateOperator = "+" | "-" | "/"
type DateQuantifier = "d" | "M" | "y" | "h" | "m" | "s" | "w"

type DateFunctions = {
  parse(dateString: DateOperationCommand): Date
  stringify(date: Date): DateOperationCommand
}

class DateCalculator implements DateFunctions {

  parse(dateString: DateOperationCommand): Date {
    const now = new Date(Date.now());
    if (dateString === "now") {
      return now;
    }

    if (!dateString.startsWith("now")) {
      throw new Error(errors.noNowFormat)
    }

    const operations = this.getOperationsFrom(dateString);

    return operations.reduce((dateResult, operationString) => {
      const dateOperation = new DateCommand(operationString)

      return dateOperation.apply(dateResult)
    }, new Date(Date.now()));
  }

  private getOperationsFrom(dateString: `now${string}`) {
    let operationsString = dateString.substring(3)

    if (operationsString == null) {
      throw new Error(errors.parseError(dateString))
    }

    let roundOperation: string | undefined
    if (operationsString.charAt(operationsString.length - 2) === "/") {
      roundOperation = operationsString.substring(operationsString.length - 2);
      operationsString = operationsString.substring(0, operationsString.length - 2)
    }

    const operations = operationsString.match(/[+\-/]\d+[dMyhmsw]/g) ?? []

    if (operations == null) {
      throw new Error(errors.parseError(dateString))
    }

    if (operationsString.length != this.totalCharsIn(operations)) {
      throw new Error(errors.parseError(dateString))
    }

    if (roundOperation !== undefined) {
      operations.push(roundOperation)
    }

    return operations
  }

  private totalCharsIn(operations: RegExpMatchArray) {
    return operations.reduce((count, opString) => count + opString.length, 0);
  }

  stringify(date: Date): DateOperationCommand {
    return "now-testOp";
  }

}

class DateCommand {
  private readonly _operator: DateOperator;
  private readonly _dateUnit: DateQuantifier;
  private readonly _operand: number;

  private readonly MS_IN_SECOND = 1000;
  private readonly MS_IN_MINUTE = this.MS_IN_SECOND * 60;
  private readonly MS_IN_HOUR = this.MS_IN_MINUTE * 60;
  private readonly MS_IN_A_DAY = this.MS_IN_HOUR * 24;

  constructor(operation: string) {
    this._operator = operation.charAt(0) as DateOperator
    this._dateUnit = operation.charAt(operation.length - 1) as DateQuantifier
    this._operand = +operation.substring(1, operation.length - 1)
  }

  private applyOperation(dateInMs: number): number {
    switch (this._operator) {
      case "+":
        if (this._dateUnit === "M") {
          const date = new Date(dateInMs);
          return new Date(dateInMs).setMonth(date.getMonth() + this._operand)
        }
        return dateInMs + this.operandInMs()
      case "-":
        if (this._dateUnit === "M") {
          const date = new Date(dateInMs);
          return new Date(dateInMs).setMonth(date.getMonth() - this._operand)
        }
        return dateInMs - this.operandInMs()
      case "/":
        return this.applyRoundOperation(dateInMs)
      default:
        throw new Error(`Unknown operator character '${this._operator}'`)
    }
  }

  private operandInMs() {
    let multiplier = 0;

    switch (this._dateUnit) {
      case "d":
        multiplier = this.MS_IN_A_DAY
        break;
      case "M":
        throw new Error("Can't determine millisecond of months")
      case "y":
        multiplier = this.MS_IN_A_DAY * 365
        break;
      case "h":
        multiplier = this.MS_IN_HOUR
        break;
      case "m":
        multiplier = this.MS_IN_MINUTE
        break;
      case "s":
        multiplier = this.MS_IN_SECOND
        break;
      case "w":
        multiplier = this.MS_IN_A_DAY * 7
        break;
    }

    return this._operand * multiplier;
  }

  apply(dateResult: Date): Date {
    let resultMs = this.applyOperation(dateResult.getTime());
    resultMs = this.applyLeapYears(dateResult, resultMs);

    return new Date(resultMs)
  }

  private applyLeapYears(dateResult: Date, resultMs: number) {
    if (this._operator !== "/" && this._dateUnit === "y") {
      let leapYearOffsetInMs = this.numberOfLeapYearsBetween(dateResult, new Date(resultMs)) * this.MS_IN_A_DAY;
      const resultDateYear = dateResult.getFullYear();
      switch (this._operator) {
        case "+":
          if (this.isLeapYear(resultDateYear) && dateResult.getMonth() > 2) {
            leapYearOffsetInMs -= this.MS_IN_A_DAY
          }
          resultMs += leapYearOffsetInMs
          break;
        case "-":
          if (this.isLeapYear(resultDateYear) && dateResult.getMonth() < 2) {
            leapYearOffsetInMs -= this.MS_IN_A_DAY
          }
          resultMs -= leapYearOffsetInMs
          break;
      }
    }
    return resultMs;
  }

  private numberOfLeapYearsBetween(date1: Date, date2: Date): number {
    const lowerYear = Math.min(date1.getFullYear(), date2.getFullYear())
    const higherYear = Math.max(date1.getFullYear(), date2.getFullYear())
    let leapYears = 0

    for (let year = lowerYear; year <= higherYear; year++) {
      if (this.isLeapYear(year)) {
        leapYears++
      }
    }

    return leapYears;
  }

  private isLeapYear(year: number) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  private applyRoundOperation(dateInMs: number): number {
    const dateAsDate = new Date(dateInMs)
    const currentDate = {
      year: dateAsDate.getUTCFullYear(),
      month: dateAsDate.getUTCMonth(),
      day: dateAsDate.getUTCDate(),
      hours: dateAsDate.getUTCHours(),
      minutes: dateAsDate.getUTCMinutes(),
      seconds: dateAsDate.getUTCSeconds()
    }

    switch (this._dateUnit) {
      case "d": {
        const upperBound = Date.UTC(currentDate.year, currentDate.month, currentDate.day + 1);
        const lowerBound = Date.UTC(currentDate.year, currentDate.month, currentDate.day);

        return this.roundDate(upperBound, dateInMs, lowerBound);
      }
      case "M": {
        const upperBound = Date.UTC(currentDate.year, currentDate.month + 1);
        const lowerBound = Date.UTC(currentDate.year, currentDate.month);

        return this.roundDate(upperBound, dateInMs, lowerBound);
      }
      case "y": {
        const upperBound = Date.UTC(currentDate.year + 1, 0);
        const lowerBound = Date.UTC(currentDate.year, 0);

        return this.roundDate(upperBound, dateInMs, lowerBound);
      }
      case "h": {
        const upperBound = Date.UTC(currentDate.year, currentDate.month, currentDate.day, currentDate.hours + 1);
        const lowerBound = Date.UTC(currentDate.year, currentDate.month, currentDate.day, currentDate.hours);

        return this.roundDate(upperBound, dateInMs, lowerBound);
      }
      case "m": {
        const upperBound = Date.UTC(currentDate.year, currentDate.month, currentDate.day, currentDate.hours, currentDate.minutes + 1);
        const lowerBound = Date.UTC(currentDate.year, currentDate.month, currentDate.day, currentDate.hours, currentDate.minutes);

        return this.roundDate(upperBound, dateInMs, lowerBound);
      }
      case "s": {
        const upperBound = Date.UTC(currentDate.year, currentDate.month, currentDate.day, currentDate.hours, currentDate.minutes, currentDate.seconds + 1);
        const lowerBound = Date.UTC(currentDate.year, currentDate.month, currentDate.day, currentDate.hours, currentDate.minutes, currentDate.seconds);

        return this.roundDate(upperBound, dateInMs, lowerBound);
      }
      case "w": {
        const dayOfWeek = (dateAsDate.getUTCDay() - 1) % 7
        const upperBound = Date.UTC(currentDate.year, currentDate.month, currentDate.day + (6 - dayOfWeek));
        const lowerBound = Date.UTC(currentDate.year, currentDate.month, currentDate.day - dayOfWeek);

        return this.roundDate(upperBound, dateInMs, lowerBound);
      }
    }

    return 0;
  }

  private roundDate(upperBound: number, dateInMs: number, lowerBound: number) {
    const upperBoundDiff = upperBound - dateInMs;
    const lowerBoundDiff = dateInMs - lowerBound;
    const minimumDistance = Math.min(upperBoundDiff, lowerBoundDiff)

    return minimumDistance === upperBoundDiff ? upperBound : lowerBound;
  }
}

export default new DateCalculator();