import { Settings } from "./settings";
/**
 * Reads all the geometry of the IFC file and generates a set of
 * [fragments](https://github.com/ifcjs/fragment).
 */
export declare class IfcFragmentLoader {
    /** Configuration of the IFC-fragment conversion. */
    settings: Settings;
    private _webIfc;
    private _items;
    private _materials;
    private readonly _geometry;
    private readonly _converter;
    dispose(): void;
    /** Loads the IFC file and converts it to a set of fragments. */
    load(buffer: ArrayBuffer): Promise<import("./base-types").FragmentGroup>;
    private initializeWebIfc;
    private loadAllGeometry;
    private loadAllCategories;
    private loadMainCategories;
    private setupVoids;
    private loadOptionalCategories;
    private cleanUp;
    private resetWebIfc;
    private resetObject;
    private disposeWebIfc;
    private disposeMaterials;
    private disposeItems;
}
