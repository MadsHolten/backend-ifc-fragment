import * as WEBIFC from "web-ifc";
/** Configuration of the IFC-fragment conversion. */
export class Settings {
    constructor() {
        /** Categories that always will be instanced. */
        this.instancedCategories = new Set();
        /** Whether to extract the IFC properties into a JSON. */
        this.includeProperties = true;
        /** Generate the geometry for categories that are not included by default. */
        this.optionalCategories = [WEBIFC.IFCSPACE];
        /** Path of the WASM for [web-ifc](https://github.com/ifcjs/web-ifc). */
        this.wasm = {
            path: "",
            absolute: false,
        };
        /** Loader settings for [web-ifc](https://github.com/ifcjs/web-ifc). */
        this.webIfc = {
            COORDINATE_TO_ORIGIN: true,
            USE_FAST_BOOLS: true,
        };
        this.instancedCategories.add(WEBIFC.IFCFURNISHINGELEMENT);
        this.instancedCategories.add(WEBIFC.IFCWINDOW);
        this.instancedCategories.add(WEBIFC.IFCDOOR);
    }
}
//# sourceMappingURL=settings.js.map