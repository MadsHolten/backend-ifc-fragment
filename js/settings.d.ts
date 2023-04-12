import * as WEBIFC from "web-ifc";
/** Configuration of the IFC-fragment conversion. */
export declare class Settings {
    /** Categories that always will be instanced. */
    instancedCategories: Set<number>;
    /** Whether to extract the IFC properties into a JSON. */
    includeProperties: boolean;
    /** Generate the geometry for categories that are not included by default. */
    optionalCategories: number[];
    /** Path of the WASM for [web-ifc](https://github.com/ifcjs/web-ifc). */
    wasm: {
        path: string;
        absolute: boolean;
    };
    /** Loader settings for [web-ifc](https://github.com/ifcjs/web-ifc). */
    webIfc: WEBIFC.LoaderSettings;
    constructor();
}
