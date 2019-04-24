const EventEmitter = require("events");
const MockiumManager = require("../../lib/MockiumManager");
const PromptingEvent = require("../../lib/utils/PromptingEvents");
const ServerEvent = require("../../lib/server/ServerEvent");
const logger = require("../../lib/utils/console-logger");

const clearTerminal = require("../../lib/cli/clear-terminal");
jest.mock("../../lib/cli/clear-terminal");

const Websocket = require("ws");
jest.mock("ws");

const configFake = {
  mockiumFolder: ".",
  featuresFolder: "features",
  extension: "feature",
  base: "base",
  serverPort: 5000,
  socketPort: 5001
};

afterAll(() => {
  jest.unmock("ws");
  jest.unmock("../../lib/cli/clear-terminal");
});

describe("Setting prompting module", () => {
  let promptingFake;
  let manager;

  beforeEach(() => {
    promptingFake = {
      on: jest.fn()
    };
    manager = new MockiumManager();
    manager.prompting = promptingFake;
  });

  afterEach(() => {
    promptingFake.on.mockRestore();
  });

  it("should listen for menu selection", () => {
    expect(
      promptingFake.on.mock.calls.find(
        c => c[0] === PromptingEvent.MAIN_MENU_SELECTED
      )
    ).toBeTruthy();
  });

  it("should listen for feature selected", () => {
    expect(
      promptingFake.on.mock.calls.find(
        c => c[0] === PromptingEvent.FEATURE_MENU_SELECTED
      )
    ).toBeTruthy();
  });

  it("should go to the selectred feature when prompting advices it", () => {
    const customManager = new MockiumManager();
    const customPrompting = new EventEmitter();

    customManager.goToFeatureSelected = jest.fn();
    customManager.prompting = customPrompting;

    customPrompting.emit(PromptingEvent.FEATURE_MENU_SELECTED);

    expect(customManager.goToFeatureSelected).toHaveBeenCalled();

    customManager.goToFeatureSelected.mockRestore();
  });
});

describe("Connecting with socket server", () => {
  let promptingFake;
  let manager;
  let currentWS;
  let messagesFake;

  beforeEach(() => {
    promptingFake = {
      on: () => {},
      getMainMenu: () => {}
    };

    messagesFake = {
      MAIN_MENU_MESSAGE: "MAIN"
    };

    jest.useFakeTimers();

    manager = new MockiumManager({ socketPort: 100 }, [], messagesFake);
    manager.prompting = promptingFake;
    manager.connect();

    jest.runAllTimers();

    currentWS = Websocket.mock.instances[Websocket.mock.instances.length - 1];
  });

  it("should connect with the given port in config", () => {
    const constructorCall = Websocket.mock.calls[0][0];

    expect(constructorCall.split("localhost:")[1]).toEqual("100");
  });

  it("should clear terminal when open connection", () => {
    currentWS.onopen();

    expect(clearTerminal).toHaveBeenCalled();
  });

  it("should show main menu after open connection", () => {
    manager.goToMainMenu = jest.fn();

    currentWS.onopen();

    expect(manager.goToMainMenu).toHaveBeenCalled();

    manager.goToMainMenu.mockRestore();
  });

  it("should close connection when an error ocurred", () => {
    currentWS.onerror();

    expect(currentWS.close).toHaveBeenCalled();
  });

  it("should try to reconnect after 1s when connection is closed", () => {
    currentWS.onclose();

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
  });
});

describe("Reconnection", () => {
  let manager;

  beforeEach(() => {
    manager = new MockiumManager();
    manager.connect = jest.fn();

    jest.useFakeTimers();
  });

  afterEach(() => {
    manager.connect.mockRestore();
  });

  it("should call to connect again if it has tried less than 5 tries", () => {
    manager.connect();

    jest.runAllTimers();

    Websocket.mock.instances[Websocket.mock.instances.length - 1].onclose();

    expect(manager.connect).toHaveBeenCalled();
  });

  it("should not call to connect again if it has tried more than 5 tries", () => {
    manager.connect();

    manager.reconnect();
    jest.runAllTimers();

    manager.reconnect();
    jest.runAllTimers();

    manager.reconnect();
    jest.runAllTimers();

    manager.reconnect();
    jest.runAllTimers();

    manager.reconnect();
    jest.runAllTimers();

    manager.reconnect();
    jest.runAllTimers();

    expect(manager.connect).toHaveBeenCalledTimes(5);
  });
});

describe("Heading to main menu", () => {
  let promptingFake;
  let manager;
  let messagesFake;

  beforeEach(() => {
    logger.printCurrentFeature = jest.fn();

    messagesFake = {
      MAIN_MENU_MESSAGE: "MAIN"
    };
    promptingFake = {
      on: () => {},
      getMainMenu: jest.fn()
    };
    manager = new MockiumManager(
      configFake,
      [{ name: "foo", description: "" }],
      messagesFake
    );
  });

  afterEach(() => {
    logger.printCurrentFeature.mockRestore();
  });

  it("should ask for main menu to prompting", () => {
    manager.prompting = promptingFake;

    manager.goToMainMenu();

    expect(promptingFake.getMainMenu).toHaveBeenCalledWith(
      messagesFake.MAIN_MENU_MESSAGE
    );
  });

  it("should log the feature message when feature is selected", () => {
    manager.prompting = promptingFake;

    manager.connect();
    jest.runAllTimers();

    manager.goToFeatureSelected("foo");

    expect(logger.printCurrentFeature).toHaveBeenCalled();
  });

  it("should not log the feature message when feature is selected", () => {
    manager.prompting = promptingFake;
    manager.connect();

    manager.goToMainMenu();

    expect(logger.printCurrentFeature).not.toHaveBeenCalled();
  });
});

describe("goToSection function", () => {
  let manager;
  let optionFake;
  let goFake;

  beforeEach(() => {
    goFake = jest.fn();
    manager = new MockiumManager();
    optionFake = {
      go: goFake
    };
  });

  afterEach(() => {
    clearTerminal.mockRestore();
  });

  it("should be a class method", () => {
    expect(typeof manager.goToSection === "function").toBe(true);
  });

  it("should clear the terminal", () => {
    manager.goToSection();

    expect(clearTerminal).toHaveBeenCalled();
  });

  it("should not call go function if option is not given", () => {
    manager.goToSection();

    expect(goFake).not.toHaveBeenCalled();
  });

  it("should not call go function if it is not given", () => {
    manager.goToSection({});

    expect(goFake).not.toHaveBeenCalled();
  });

  it("should not call go function if it is not a function", () => {
    optionFake.go = "";

    manager.goToSection(optionFake);

    expect(goFake).not.toHaveBeenCalled();
  });

  it("should call go function if it is a given function", () => {
    manager.goToSection(optionFake);

    expect(goFake).toHaveBeenCalled();
  });
});

describe("Going to choose feature", () => {
  let manager;
  let messages;

  beforeEach(() => {
    messages = {
      FEATURES_MESSAGE: "msg"
    };
    manager = new MockiumManager({}, [], messages);
  });

  it("should have a class method", () => {
    expect(typeof manager.goToFeatureSelection === "function");
  });

  it("should get features menu", () => {
    const promptingFake = {
      on: () => {},
      getFeaturesMenu: jest.fn()
    };

    manager.prompting = promptingFake;
    manager.goToFeatureSelection();

    expect(promptingFake.getFeaturesMenu).toHaveBeenCalledWith(
      messages.FEATURES_MESSAGE
    );
  });
});

describe("Feature has been selected", () => {
  let manager;
  let feature;

  beforeEach(() => {
    feature = "foo";

    const messages = {
      MAIN_MENU_MESSAGE: "main"
    };
    const features = [{ name: feature }];

    manager = new MockiumManager(configFake, features, messages);

    manager.prompting = {
      getMainMenu: () => {},
      on: () => {}
    };

    manager.goToMainMenu = jest.fn();

    manager.connect();
    jest.runAllTimers();
    manager.goToFeatureSelected(feature);
  });

  afterEach(() => {
    manager.goToMainMenu.mockRestore();
  });

  it("should dispatch event with the given feature", () => {
    const event = JSON.stringify({ type: "FEATURE", name: feature });

    expect(
      Websocket.mock.instances[Websocket.mock.instances.length - 1].send
    ).toHaveBeenCalledWith(event);
  });

  it("should clear terminal", () => {
    expect(clearTerminal).toHaveBeenCalled();
  });

  it("should reset to main menu", () => {
    expect(manager.goToMainMenu).toHaveBeenCalled();
  });
});

describe("Emit end signal", () => {
  let manager;

  beforeEach(() => {
    manager = new MockiumManager(configFake);

    manager.prompting = {
      getMainMenu: () => {},
      on: () => {}
    };

    manager.connect();
    jest.runAllTimers();
  });

  it("should broadcast finish signal", () => {
    const finishEvent = JSON.stringify({
      type: ServerEvent.SERVER_FORCE_FINISH
    });

    const currentWs =
      Websocket.mock.instances[Websocket.mock.instances.length - 1];

    manager.broadcastEndSignal();

    expect(currentWs.send).toHaveBeenCalledWith(finishEvent);
  });
});

describe("Testing features updating", () => {
  let manager;
  let promptingMockUpdate;

  beforeEach(() => {
    manager = new MockiumManager(configFake);

    promptingMockUpdate = jest.fn();

    manager.prompting = {
      getMainMenu: () => {},
      on: () => {},
      updateFeatures: promptingMockUpdate
    };

    manager.connect();
    jest.runAllTimers();
  });

  afterEach(() => {
    promptingMockUpdate.mockRestore();
  });

  it("should update promptter with new features", () => {
    const features = ["foo", "bar"];

    manager.updateFeatures(features);

    expect(promptingMockUpdate).toHaveBeenCalledWith(
      features,
      expect.any(Function)
    );
  });
});

describe("Testing WS message handling", () => {
  let manager;
  beforeEach(() => {
    manager = new MockiumManager(configFake);

    manager.updateFeatures = jest.fn();
  });

  afterEach(() => {
    manager.updateFeatures.mockRestore();
  });

  it("should update features when it receives a FILES event", () => {
    const payload = {
      data: JSON.stringify({ type: "FILES" })
    };

    manager.handleWSMessage(payload);

    expect(manager.updateFeatures).toHaveBeenCalled();
  });

  it("should do nothing by default", () => {
    const payload = {
      data: JSON.stringify({ type: "" })
    };

    expect(manager.handleWSMessage(payload)).toBeUndefined();
  });
});
