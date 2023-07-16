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
    const operationsString = dateString.substring(3)

    if (operationsString == null) {
      throw new Error(errors.parseError(dateString))
    }

    const operations = operationsString.match(/[+\-/]\d+[dMyhmsw]/g)

    if (operations == null) {
      throw new Error(errors.parseError(dateString))
    }

    if (operationsString.length != this.totalCharsIn(operations)) {
      throw new Error(errors.parseError(dateString))
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
        throw new Error("Not implemented yet")
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
    if (this._dateUnit === "y") {
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
        case "/":
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
}

export default new DateCalculator();