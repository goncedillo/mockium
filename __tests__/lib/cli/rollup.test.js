const rollup = require("rollup");
const rollupManager = require("../../../lib/cli/rollup");

describe("Testing bundle generator", () => {
  let rollupFn;
  let writeFn;

  beforeEach(() => {
    writeFn = jest.fn();
    rollupFn = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ write: writeFn }));

    rollup.rollup = rollupFn;
  });

  afterEach(() => {
    rollup.rollup.mockRestore();
  });

  it("should has a generate bundle method", () => {
    expect(typeof rollupManager.generateBundle === "function").toBe(true);
  });

  it("should create the bundle", async () => {
    await rollupManager.generateBundle();

    expect(rollupFn).toHaveBeenCalled();
  });

  it("should write the bundle", async () => {
    await rollupManager.generateBundle();

    expect(writeFn).toHaveBeenCalled();
  });
});
