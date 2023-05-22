const {ConvertIfcToFragments} = require("../dist/index.js");

async function main() {
    const result = await ConvertIfcToFragments("test.ifc");
    console.log(result);
}

main();
