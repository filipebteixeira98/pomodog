/** @type {import('prettier').Config} */
module.exports = {
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  importOrder: [
    "<BUILTIN_MODULES>",
    "",
    "^react$",
    "^react-native$",
    "<THIRD_PARTY_MODULES>",
    "",
    "^#",
  ],
  importOrderTypeScriptVersion: "6.0.0",
  // Side-effect imports (CSS, registration and test entrypoints) remain in place.
  importOrderSafeSideEffects: [],
};
