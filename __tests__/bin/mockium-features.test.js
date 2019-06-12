const program = require("commander");
const mockiumFeatures = require("../../bin/mockium-features");
const MockiumManager = require("../../lib/MockiumManager");
let featuresLoader = require("../../lib/utils/features-loader");
const processKiller = require("../../lib/utils/process-killer");
const Prompting = require("../../lib/Prompting");

jest.mock("commander", () => ({
  option() {
    return this;
  },
  parse: () => {}
}));

jest.mock("../../lib/MockiumManager");
jest.mock("../../lib/utils/features-loader");
jest.mock("../../lib/utils/process-killer");
jest.mock("../../lib/Prompting");

afterAll(() => {
  jest.unmock("commander");
  jest.unmock("../../lib/MockiumManager");
  jest.unmock("../../lib/utils/features-loader");
  jest.unmock("../../lib/utils/process-killer");
  jest.unmock("../../lib/Prompting");
});

describe("Testing Mockium features", () => {
  let connectFn;
  let processOnFn;
  let goToFeatureSelectionFn;
  let killFn;

  beforeEach(() => {
    connectFn = jest.fn().mockImplementation(() => {});
    processOnFn = jest.fn().mockImplementation((ev, cb) => cb());
    goToFeatureSelectionFn = jest.fn();
    killFn = jest.fn().mockImplementation(() => {});

    MockiumManager.mockImplementation(() => ({
      connect: connectFn,
      goToFeatureSelection: goToFeatureSelectionFn
    }));

    featuresLoader.load = jest.fn().mockReturnValue([1]);

    processKiller.mockImplementation(() => {});

    process.on = processOnFn;
    process.kill = killFn;
  });

  afterEach(() => {
    MockiumManager.mockRestore();
    featuresLoader.load.mockRestore();
    processKiller.mockRestore();
    process.on.mockRestore();
    process.kill.mockRestore();
  });

  it("should connect manager", async () => {
    await mockiumFeatures();

    expect(connectFn).toHaveBeenCalled();
  });

  it("should listen to disconnect event", async () => {
    await mockiumFeatures();

    expect(processOnFn).toHaveBeenCalledWith(
      "disconnect",
      expect.any(Function)
    );
  });

  it("should listen to disconnect event", async () => {
    await mockiumFeatures();

    expect(processOnFn).toHaveBeenCalledWith("SIGINT", expect.any(Function));
  });

  it("should listen to disconnect event", async () => {
    await mockiumFeatures();

    expect(processOnFn).toHaveBeenCalledWith("SIGTERM", expect.any(Function));
  });

  it("should send go functions to menu options", async () => {
    Prompting.mockImplementation((f, options) =>
      options.forEach(opt => opt.go())
    );

    await mockiumFeatures();

    expect(goToFeatureSelectionFn).toHaveBeenCalled();
  });
});
