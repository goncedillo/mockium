const logger = require("../../../lib/utils/console-logger");
const asciify = require("asciify-image");

jest.mock("asciify-image");

afterAll(() => {
  jest.restoreAllMocks();
});

describe("Print current feature", () => {
  it("should have a method to print it", () => {
    expect(typeof logger.printCurrentFeature === "function").toBe(true);
  });

  it("should print the message", () => {
    const spy = jest.spyOn(console, "log");
    const target = "message test";

    logger.printCurrentFeature(target);

    expect(spy.mock.calls[0][0].search(target)).toBeTruthy();
  });

  it("should print the feature", () => {
    const spy = jest.spyOn(console, "log");
    const target = "feature test";

    logger.printCurrentFeature(null, target);

    expect(spy.mock.calls[0][0].search(target)).toBeTruthy();
  });

  it("should print the description", () => {
    const spy = jest.spyOn(console, "log");
    const target = "description test";

    logger.printCurrentFeature(null, null, target);

    expect(spy.mock.calls[0][0].search(target)).toBeTruthy();
  });

  it("should print the default message when no description is given", () => {
    const spy = jest.spyOn(console, "log");
    const target = "-no description-";

    logger.printCurrentFeature();

    expect(spy.mock.calls[0][0].search(target)).toBeTruthy();
  });
});

describe("print when server is started", () => {
  it("should have a method to print it", () => {
    expect(typeof logger.printServerStarted === "function");
  });

  it("should print message when it is given", () => {
    const spy = jest.spyOn(console, "log");
    const target = "message test";

    logger.printServerStarted(target);

    expect(spy.mock.calls[0][0].search(target)).toBeTruthy();
  });

  it("should print port when it is given", () => {
    const spy = jest.spyOn(console, "log");
    const target = "port test";

    logger.printServerStarted(null, target);

    expect(spy.mock.calls[0][0].search(target)).toBeTruthy();
  });
});

describe("print when reload by file changed", () => {
  it("should have a method to print it", () => {
    expect(typeof logger.printReloadServerByFileChange === "function");
  });

  it("should print filename when it is given", () => {
    const spy = jest.spyOn(console, "log");
    const target = "filename test";

    logger.printReloadServerByFileChange(target);

    expect(spy.mock.calls[0][0].search(target)).toBeTruthy();
  });
});

describe("print when feature has changed", () => {
  it("should have a method to print it", () => {
    expect(typeof logger.printFeatureChanged === "function");
  });

  it("should print url when it is given", () => {
    const spy = jest.spyOn(console, "log");
    const target = "message test";

    logger.printFeatureChanged(target);

    expect(spy.mock.calls[0][0].search(target)).toBeTruthy();
  });

  it("should print feature when it is given", () => {
    const spy = jest.spyOn(console, "log");
    const target = "feature test";

    logger.printFeatureChanged(null, target);

    expect(spy.mock.calls[0][0].search(target)).toBeTruthy();
  });
});

describe("print ascii image", () => {
  it("should have a method to print it", () => {
    expect(typeof logger.printImageByUrl === "function");
  });

  it("should print ascii image by url", async () => {
    const spy = jest.spyOn(console, "log");
    const target = "url test";

    await logger.printImageByUrl(target);

    expect(asciify.mock.calls[0][0]).toEqual(target);
  });
});

describe("print feature description", () => {
  it("should have a method to print it", () => {
    expect(typeof logger.printFeatureDescription === "function");
  });

  it("should print description when it is given", () => {
    const spy = jest.spyOn(console, "log");
    const target = "description test";

    logger.printFeatureDescription(target);

    expect(spy.mock.calls[0][0].search(target)).toBeTruthy();
  });
});
