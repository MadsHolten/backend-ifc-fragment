import {nodeResolve} from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";

// This creates the bundle used by the examples
export default {
    input: "js/index.js",
    output: [
        {
            file: "./dist/bundle.js",
            format: "cjs",
            inlineDynamicImports: true,
        }, {
            file: "dist/bundle.d.ts",
            format: "es"
        }
    ],
    plugins: [nodeResolve(), commonjs(), dts()],
};
