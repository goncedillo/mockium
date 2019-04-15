const PromptingMessages = require("../../../lib/utils/PromptingMessages");

describe("Testing prompting messages", () => {
  it("should have a MAIN_MENU_MESSAGE message", () => {
    expect(PromptingMessages.MAIN_MENU_MESSAGE).toBeTruthy();
  });

  it("should have a FEATURES_MESSAGE message", () => {
    expect(PromptingMessages.FEATURES_MESSAGE).toBeTruthy();
  });
});
