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

    return operations.reduce((dateResult, operation) => {
      const operator = operation.charAt(0);
      const unit = operation.charAt(operation.length - 1)
      const operand = +operation.substring(1, operation.length - 1)

      if (operator === "+") {
        if (unit === "d") {
          dateResult.setDate(dateResult.getDate() + operand)
        }
      }

      if (operator === "-") {
        if (unit === "d") {
          dateResult.setDate(dateResult.getDate() - operand)
        }
      }

      return dateResult
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

export default new DateCalculator();