const PromptingEvents = require("../../../lib/utils/PromptingEvents");

describe("Testing events", () => {
  it("should have a MAIN_MENU_SELECTED event", () => {
    expect(PromptingEvents.MAIN_MENU_SELECTED).toBeTruthy();
  });

  it("should have a FEATURE_MENU_SELECTED event", () => {
    expect(PromptingEvents.FEATURE_MENU_SELECTED).toBeTruthy();
  });
});
