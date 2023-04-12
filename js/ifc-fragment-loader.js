import * as WEBIFC from "web-ifc";
import { Settings } from "./settings";
import { Geometry } from "./geometry";
import { DataConverter } from "./data-converter";
/**
 * Reads all the geometry of the IFC file and generates a set of
 * [fragments](https://github.com/ifcjs/fragment).
 */
export class IfcFragmentLoader {
    constructor() {
        /** Configuration of the IFC-fragment conversion. */
        this.settings = new Settings();
        this._webIfc = new WEBIFC.IfcAPI();
        this._items = {};
        this._materials = {};
        this._geometry = new Geometry(this._webIfc, this._items, this._materials);
        this._converter = new DataConverter(this._items, this._materials, this.settings);
    }
    dispose() {
        this.disposeWebIfc();
        this.disposeMaterials();
        this.disposeItems();
        this._geometry.cleanUp();
        this._geometry = null;
        this._converter.cleanUp();
        this._converter = null;
    }
    /** Loads the IFC file and converts it to a set of fragments. */
    async load(buffer) {
        await this.initializeWebIfc();
        const data = new Uint8Array(buffer);
        this._webIfc.OpenModel(data, this.settings.webIfc);
        return this.loadAllGeometry();
    }
    async initializeWebIfc() {
        const { path, absolute } = this.settings.wasm;
        this._webIfc.SetWasmPath(path, absolute);
        console.log(path, absolute);
        await this._webIfc.Init();
    }
    async loadAllGeometry() {
        await this.loadAllCategories();
        const model = await this._converter.generateFragmentData(this._webIfc);
        this.cleanUp();
        return model;
    }
    async loadAllCategories() {
        this._converter.setupCategories(this._webIfc);
        this.loadOptionalCategories();
        await this.setupVoids();
        await this.loadMainCategories();
    }
    async loadMainCategories() {
        this._webIfc.StreamAllMeshes(0, (mesh) => {
            this._geometry.streamMesh(this._webIfc, mesh);
        });
    }
    async setupVoids() {
        const voids = this._webIfc.GetLineIDsWithType(0, WEBIFC.IFCRELVOIDSELEMENT);
        const props = this._webIfc.properties;
        const size = voids.size();
        for (let i = 0; i < size; i++) {
            const voidsProperties = await props.getItemProperties(0, voids.get(i));
            const voidID = voidsProperties.RelatingBuildingElement.value;
            this._geometry.addVoid(voidID);
        }
    }
    loadOptionalCategories() {
        // Some categories (like IfcSpace) need to be set explicitly
        const optionals = this.settings.optionalCategories;
        const callback = (mesh) => {
            this._geometry.streamMesh(this._webIfc, mesh);
        };
        this._webIfc.StreamAllMeshesWithTypes(0, optionals, callback);
    }
    cleanUp() {
        this.resetWebIfc();
        this._geometry.cleanUp();
        this._converter.cleanUp();
        this.resetObject(this._items);
        this.resetObject(this._materials);
    }
    resetWebIfc() {
        this.disposeWebIfc();
        this._webIfc = new WEBIFC.IfcAPI();
    }
    resetObject(object) {
        const keys = Object.keys(object);
        for (const key of keys) {
            delete object[key];
        }
    }
    disposeWebIfc() {
        this._webIfc = null;
    }
    disposeMaterials() {
        for (const materialID in this._materials) {
            this._materials[materialID].dispose();
        }
    }
    disposeItems() {
        for (const geometryID in this._items) {
            const geometriesByMat = this._items[geometryID].geometriesByMaterial;
            for (const matID in geometriesByMat) {
                for (const geom of geometriesByMat[matID]) {
                    geom.dispose();
                }
            }
        }
    }
}
//# sourceMappingURL=ifc-fragment-loader.js.map