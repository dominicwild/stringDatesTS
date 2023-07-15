export type DateOperation = "now" | `now${string}`;


type DateFunctions = {
  parse(dateString: DateOperation): Date
  stringify(date: Date): DateOperation
}

class DateCalculator implements DateFunctions {

  parse(dateString: DateOperation): Date {
    return new Date(Date.now());
  }

  stringify(date: Date): DateOperation {
    return "now-testOp";
  }

}

export default new DateCalculator();