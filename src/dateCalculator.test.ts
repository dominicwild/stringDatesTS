import dateCalculator, { DateOperationCommand } from "./dateCalculator";
import errors from "./errors";

const now = new Date("2020-05-01");
jest
    .useFakeTimers()
    .setSystemTime(now);


describe('Date Calculator Tests', function () {

  describe("Acceptance Test", () => {
    it.each<[DateOperationCommand, string]>([
      ["now-1y/y", "2019-01-01T00:00:00.000Z"],
      ["now/y", "2020-01-01T00:00:00.000Z"],
      ["now-1d", "2020-04-30T00:00:00.000Z"],
      ["now+1d", "2020-05-02T00:00:00.000Z"],
      ["now-4d-4h", "2020-04-26T20:00:00.000Z"],
    ])
    ("Operation %s gives date %s", (opString, expectedDateString) => {
      let date = dateCalculator.parse(opString);
      const expectedDate = new Date(Date.parse(expectedDateString));
      expect(date).toBe(expectedDate)
    })

    it.each<[string, DateOperationCommand]>([
      ["2019-01-01T00:00:00.000Z", "now-1y/y"],
      ["2020-01-01T00:00:00.000Z", "now/y"],
      ["2020-04-30T00:00:00.000Z", "now-1d"],
      ["2020-05-02T00:00:00.000Z", "now+1d"],
      ["2020-04-26T20:00:00.000Z", "now-4d-4h"],
    ])
    ("Stringify %s gives operation %s", (dateString, expectedOp) => {
      const dateInput = new Date(Date.parse(dateString));
      let operation = dateCalculator.stringify(dateInput);
      expect(operation).toBe(expectedOp)
    })
  })

  it.each<[DateOperationCommand, string]>([
    ["now", "2020-05-01T00:00:00.000Z"],
    ["now+1d", "2020-05-02T00:00:00.000Z"],
    ["now-1d", "2020-04-30T00:00:00.000Z"],
    ["now-1d+1d", "2020-05-01T00:00:00.000Z"],
  ])
  ("Operation %s gives date %s", (opString: DateOperationCommand, expectedDateString) => {
    const date = dateCalculator.parse(opString);
    const expectedDate = new Date(Date.parse(expectedDateString));
    expect(date).toEqual(expectedDate)
  })

  it("throws given date operation that doesn't start with now", () => {
    // @ts-ignore
    expect(() => dateCalculator.parse("randomString")).toThrow(errors.noNowFormat)
  })

  it.each<DateOperationCommand>([
    "now-1",
    "now-d",
    "now-12",
    "now-1543535",
    "now-1543y535",
    "now-y7",
    "now-y7y",
    "now-random",
    "now-1d+1d+5435yy-343d",
    "now-1d++1d",
    "now-1d+1d/yy",
    "now-1d/+231d/y",
  ])
  ("throws given invalid date operation '%s'", (opString) => {
    expect(() => dateCalculator.parse(opString)).toThrow(errors.parseError(opString))
  })

  // it.each([
  //   ["2019-01-01T00:00:00.000Z", "now-1y/y"],
  // ])
  // ("Stringify %s gives operation %s", (dateString, expectedOp) => {
  //   const dateInput = new Date(Date.parse(dateString));
  //   let operation = dateCalculator.stringify(dateInput);
  //   expect(operation).toBe(expectedOp)
  // })

});