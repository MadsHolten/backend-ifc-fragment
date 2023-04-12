import { IfcFragmentLoader } from './ifc-fragment-loader';
import { Serializer } from 'bim-fragment';
const fs = require('fs');
const archiver = require('archiver');
function zipDirectory(sourceDir, outPath) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(outPath);
    return new Promise((resolve, reject) => {
        archive
            .directory(sourceDir, false)
            .on('error', (err) => reject(err))
            .pipe(stream);
        stream.on('close', () => resolve());
        archive.finalize();
    });
}
export async function ConvertIfcToFragments(ifcURL) {
    // const ifcURL = process.argv[2];
    console.log(`Reading IFC file: ${ifcURL}`);
    const loader = new IfcFragmentLoader();
    const data = fs.readFileSync(ifcURL);
    console.log(`File successfully read. Starting file conversion to fragments...`);
    const result = await loader.load(data);
    console.log(`File successfully converted to fragments. Saving files...`);
    const outputName = ifcURL.replace(".ifc", ".zip");
    if (fs.existsSync(outputName)) {
        fs.rmSync(outputName, { recursive: true, force: true });
    }
    const tempDir = "./temp";
    fs.mkdirSync(tempDir);
    const serializer = new Serializer();
    const file = serializer.export(result.fragments);
    fs.appendFileSync(`${tempDir}/model.frag`, file);
    fs.appendFileSync(`${tempDir}/properties.json`, JSON.stringify(result.properties));
    fs.appendFileSync(`${tempDir}/levels-relationship.json`, JSON.stringify(result.levelRelationships));
    fs.appendFileSync(`${tempDir}/model-types.json`, JSON.stringify(result.itemTypes));
    fs.appendFileSync(`${tempDir}/all-types.json`, JSON.stringify(result.allTypes));
    fs.appendFileSync(`${tempDir}/levels-properties.json`, JSON.stringify(result.floorsProperties));
    fs.appendFileSync(`${tempDir}/coordination-matrix.json`, JSON.stringify(result.coordinationMatrix));
    fs.appendFileSync(`${tempDir}/bounding-boxes-opaque.json`, JSON.stringify(result.boundingBoxes));
    fs.appendFileSync(`${tempDir}/bounding-boxes-transparent.json`, JSON.stringify(result.transparentBoundingBoxes));
    fs.appendFileSync(`${tempDir}/express-fragment-map.json`, JSON.stringify(result.expressIDFragmentIDMap));
    await zipDirectory(`${tempDir}`, outputName);
    console.log(`File successfully saved!`);
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
    const propsValues = Object.values(result.properties);
    const ifcProject = propsValues.find((prop) => prop.type === 103090709);
    if (!ifcProject) {
        throw new Error("Ifc project not found");
    }
    const modelId = ifcProject.GlobalId.value ? ifcProject.GlobalId.value : ifcProject.GlobalId;
    return { file: outputName, modelId };
}
//# sourceMappingURL=index.js.map