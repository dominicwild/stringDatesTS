export type DateOperation = "now" | `now${string}`;


type DateFunctions = {
  parse(dateString: DateOperation): Date
  stringify(date: Date): DateOperation
}

class DateCalculator implements DateFunctions {

  parse(dateString: DateOperation): Date {
    const now = new Date(Date.now());
    if (dateString === "now") {
      return now;
    }

    if (dateString === "now+1d") {
      return new Date(now.setDate(now.getDate() + 1))
    }

    if (dateString === "now-1d") {
      return new Date(now.setDate(now.getDate() - 1))
    }

    return new Date();
  }

  stringify(date: Date): DateOperation {
    return "now-testOp";
  }

}

export default new DateCalculator();