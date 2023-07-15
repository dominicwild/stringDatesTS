import dateCalculator, { DateOperation } from "./dateCalculator";

const now = new Date("2020-05-01");
jest
    .useFakeTimers()
    .setSystemTime(now);


describe('Date Calculator Tests', function () {

  describe("Acceptance Test", () => {
    it.each<[DateOperation, string]>([
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

    it.each<[string, DateOperation]>([
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

  it.each<[DateOperation, string]>([
    ["now", "2020-05-01T00:00:00.000Z"],
  ])
  ("Operation %s gives date %s", (opString: DateOperation, expectedDateString) => {
    const date = dateCalculator.parse(opString);
    const expectedDate = new Date(Date.parse(expectedDateString));
    expect(date).toEqual(expectedDate)
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