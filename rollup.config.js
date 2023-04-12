import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

// This creates the bundle used by the examples
export default {
  input: "js/index.js",
  output: {
    file: "./dist/bundle.js",
    format: "cjs",
    inlineDynamicImports: true,
  },
  plugins: [nodeResolve(), commonjs()],
};
