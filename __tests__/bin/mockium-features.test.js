const program = require("commander");
const MockiumManager = require("../../lib/MockiumManager");
const featuresLoader = require("../../lib/utils/features-loader");
const processKiller = require("../../lib/utils/process-killer");
const Prompting = require("../../lib/Prompting");
const mockiumFeatures = require("../../bin/mockium-features");
const optionsManager = require("../../lib/cli/options-manager");

jest.mock("commander", () => ({
  option() {
    return this;
  },
  parse: () => {}
}));

jest.mock("../../lib/cli/resources", () => ({
  getResourcesFromPath: () => {}
}));

jest.mock("../../lib/MockiumManager");
jest.mock("../../lib/utils/features-loader", () => ({
  load: jest
    .fn()
    .mockImplementation((serverFolder, folder, extractor, extension) => {
      extractor();
      return Promise.resolve([{ name: "c" }]);
    })
}));
jest.mock("../../lib/utils/process-killer");
jest.mock("../../lib/Prompting");

const mockConnectFn = jest.fn().mockImplementation(() => {});
const mockGoFeature = jest.fn();

beforeAll(() => {
  MockiumManager.mockImplementation(() => ({
    connect: mockConnectFn,
    goToFeatureSelection: mockGoFeature
  }));
});

afterAll(() => {
  jest.unmock("commander");
  jest.unmock("../../lib/MockiumManager");
  jest.unmock("../../lib/utils/features-loader");
  jest.unmock("../../lib/utils/process-killer");
  jest.unmock("../../lib/Prompting");
  jest.unmock("../../lib/cli/resources");
  jest.unmock("../../lib/cli/options-manager");
});

describe("Testing Mockium features", () => {
  let processOnFn;
  let killFn;

  beforeEach(() => {
    processOnFn = jest.fn().mockImplementation((ev, cb) => cb());
    killFn = jest.fn().mockImplementation(() => {});

    processKiller.mockImplementation(() => {});

    process.on = processOnFn;
    process.kill = killFn;
  });

  afterEach(() => {
    processKiller.mockRestore();
    process.on.mockRestore();
    process.kill.mockRestore();
  });

  it("should connect manager", async () => {
    await mockiumFeatures();

    expect(mockConnectFn).toHaveBeenCalled();
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

    expect(mockGoFeature).toHaveBeenCalled();
  });

  it("should show error when something is wrong with files", async () => {
    optionsManager.setErrorsInCommon = jest.fn().mockImplementation(() => {});
    featuresLoader.load = jest
      .fn()
      .mockImplementation(() => Promise.reject(new Error("Fail")));

    await mockiumFeatures();

    expect(optionsManager.setErrorsInCommon).toHaveBeenCalled();

    featuresLoader.load.mockRestore();
    optionsManager.setErrorsInCommon.mockRestore();
  });
});
