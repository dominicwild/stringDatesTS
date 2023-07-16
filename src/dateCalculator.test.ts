import dateCalculator, { DateOperationCommand } from "./dateCalculator";
import errors from "./errors";

describe('Date Calculator Tests', function () {

  beforeEach(() => {
    const now = new Date("2020-05-01");
    jest
        .useFakeTimers()
        .setSystemTime(now);
  })

  afterEach(() => {
    jest.useRealTimers()
  })

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
      expect(date).toEqual(expectedDate)
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
      expect(operation).toEqual(expectedOp)
    })
  })

  it.each<[DateOperationCommand, string]>([
    ["now", "2020-05-01T00:00:00.000Z"],
    ["now+1d", "2020-05-02T00:00:00.000Z"],
    ["now-1d", "2020-04-30T00:00:00.000Z"],
    ["now+1y", "2021-05-01T00:00:00.000Z"],
    ["now-1y", "2019-05-01T00:00:00.000Z"],
    ["now+1h", "2020-05-01T01:00:00.000Z"],
    ["now-1h", "2020-04-30T23:00:00.000Z"],
    ["now+1s", "2020-05-01T00:00:01.000Z"],
    ["now-1s", "2020-04-30T23:59:59.000Z"],
    ["now+1m", "2020-05-01T00:01:00.000Z"],
    ["now-1m", "2020-04-30T23:59:00.000Z"],
    ["now+1M", "2020-06-01T00:00:00.000Z"],
    ["now-1M", "2020-04-01T00:00:00.000Z"],
    ["now+1w", "2020-05-08T00:00:00.000Z"],
    ["now-1w", "2020-04-24T00:00:00.000Z"],
    ["now-1d+1d", "2020-05-01T00:00:00.000Z"],
    ["now+1d/y", "2020-01-01T00:00:00.000Z"],
    ["now+100d/y", "2021-01-01T00:00:00.000Z"],
    ["now+1h/d", "2020-05-01T00:00:00.000Z"],
  ])
  ("Operation %s gives date %s", (opString: DateOperationCommand, expectedDateString) => {
    const date = dateCalculator.parse(opString);
    const expectedDate = new Date(Date.parse(expectedDateString));
    expect(date).toEqual(expectedDate)
  })

  it.each<[DateOperationCommand, string, string]>([
    ["now/y", "2020-05-01T00:00:00.000Z", "2020-01-01T00:00:00.000Z"],
    ["now/y", "2020-07-11T00:00:00.000Z", "2021-01-01T00:00:00.000Z"],
    ["now/d", "2020-05-05T13:00:00.000Z", "2020-05-06T00:00:00.000Z"],
    ["now/d", "2020-05-05T11:00:00.000Z", "2020-05-05T00:00:00.000Z"],
    ["now/M", "2020-07-22T00:00:00.000Z", "2020-08-01T00:00:00.000Z"],
    ["now/M", "2020-07-03T00:00:00.000Z", "2020-07-01T00:00:00.000Z"],
    ["now/h", "2020-07-01T15:44:00.000Z", "2020-07-01T16:00:00.000Z"],
    ["now/h", "2020-07-01T15:23:00.000Z", "2020-07-01T15:00:00.000Z"],
    ["now/m", "2020-07-01T00:22:45.000Z", "2020-07-01T00:23:00.000Z"],
    ["now/m", "2020-07-01T00:22:12.000Z", "2020-07-01T00:22:00.000Z"],
    ["now/s", "2020-07-01T00:00:25.600Z", "2020-07-01T00:00:26.000Z"],
    ["now/s", "2020-07-01T00:00:25.300Z", "2020-07-01T00:00:25.000Z"],
  ])
  ("%s rounds date to %s", (opString: DateOperationCommand, currentDateString, expectedDateString) => {
    const now = new Date(currentDateString);
    jest
        .useFakeTimers()
        .setSystemTime(now);
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