const path = require("path");
const rollup = require("rollup");
const rollupMultientry = require("rollup-plugin-multi-entry");

function generateBundle(file, destinyPath) {
  return new Promise(async resolve => {
    const inputOps = {
      input: file
    };
    const outputOps = {
      format: "cjs",
      file: destinyPath,
      inlineDynamicImports: true,
      preserveModules: true,
      cache: false
    };

    const bundle = await rollup.rollup(inputOps);

    await bundle.write(outputOps);

    resolve(true);
  });
}

module.exports = { generateBundle };
