import {nodeResolve} from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from '@rollup/plugin-typescript';

// This creates the bundle used by the examples
export default {
    input: "src/index.ts",
    output: [
        {
            file: "./dist/index.js",
            format: "cjs",
            sourcemap: true,
            inlineDynamicImports: true,
        }
    ],
    plugins: [nodeResolve(), commonjs(), typescript()],
};
