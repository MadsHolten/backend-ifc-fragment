const {ConvertIfcToFragments} = require("../dist/bundle.js");

async function main() {
    const result = await ConvertIfcToFragments("test.ifc");
    console.log(result);
}

main();
