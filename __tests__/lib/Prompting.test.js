"use strict";

const inquirer = require("inquirer");
const Prompting = require("../../lib/Prompting");
const PromptingEvent = require("../../lib/utils/PromptingEvents");

jest.mock("inquirer");

let prompting;
let BottomBarFn;
let updateBottomBarFn;

beforeAll(() => {
  const menuOptions = [
    {
      name: "Name one",
      value: "one"
    },
    {
      name: "Name two",
      value: "two"
    }
  ];

  updateBottomBarFn = jest.fn();

  BottomBarFn = jest.fn().mockImplementation(() => ({
    updateBottomBar: updateBottomBarFn
  }));

  inquirer.ui.BottomBar = BottomBarFn;

  prompting = new Prompting(["one", "two"], menuOptions);
});

afterAll(() => {
  inquirer.prompt.mockRestore();

  if (prompting.emit.mock) {
    prompting.emit.mockRestore();
  }

  inquirer.ui.BottomBar.mockRestore();
});

describe("Main Menu formation", () => {
  it("should prompt with the given message", () => {
    inquirer.prompt = jest
      .fn()
      .mockReturnValue({ [Prompting.mainMenuOptionKey]: "one" });

    const msg = "cutom message";

    prompting.getMainMenu(msg);

    const calls = inquirer.prompt.mock.calls;

    expect(calls[0][0][0].message).toEqual(msg);
  });

  it("should dispatch an event with the right selection", async () => {
    inquirer.prompt = jest.fn().mockResolvedValue({
      [Prompting.mainMenuOptionKey]: "one"
    });

    prompting.emit = jest.fn();

    await prompting.getMainMenu("");

    expect.assertions(2);
    expect(prompting.emit.mock.calls[0][0]).toEqual(
      PromptingEvent.MAIN_MENU_SELECTED
    );
    expect(prompting.emit.mock.calls[0][1]).toEqual({
      name: "Name one",
      value: "one"
    });
  });
});

describe("Listing features menu", () => {
  it("should prompt with the given message", () => {
    inquirer.prompt = jest
      .fn()
      .mockReturnValue({ [Prompting.featuresMenuOptionKey]: "one" });

    const msg = "cutom message";

    prompting.getFeaturesMenu(msg);

    const calls = inquirer.prompt.mock.calls;

    expect(calls[0][0][0].message).toEqual(msg);
  });

  it("should dispatch an event with the right selection", async () => {
    inquirer.prompt = jest.fn().mockResolvedValue({
      [Prompting.featuresMenuOptionKey]: "one"
    });

    prompting.emit = jest.fn();

    await prompting.getFeaturesMenu("");

    expect.assertions(2);
    expect(prompting.emit.mock.calls[0][0]).toEqual(
      PromptingEvent.FEATURE_MENU_SELECTED
    );
    expect(prompting.emit.mock.calls[0][1]).toEqual("one");
  });
});

describe("Testing update features", () => {
  it("should update CLI interface with given printer", () => {
    const spy = jest.fn();

    prompting.updateFeatures([], spy);

    expect(spy).toHaveBeenCalled();
  });

  it("should clean the message area after a time", () => {
    jest.useFakeTimers();

    prompting.updateFeatures([], () => {});

    jest.runAllTimers();

    expect(updateBottomBarFn).toHaveBeenCalled();
  });
});
