import * as THREE from 'three';
import { Fragment } from 'bim-fragment/fragment';
import * as WEBIFC from 'web-ifc';

declare class FragmentGroup extends THREE.Group {
    fragments: Fragment[];
    levelRelationships: any;
    allTypes: any;
    itemTypes: any;
    floorsProperties: any;
    coordinationMatrix: any;
    boundingBoxes: any;
    properties: any;
    transparentBoundingBoxes: any;
    expressIDFragmentIDMap: any;
}

/** Configuration of the IFC-fragment conversion. */
declare class Settings {
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

/**
 * Reads all the geometry of the IFC file and generates a set of
 * [fragments](https://github.com/ifcjs/fragment).
 */
declare class IfcFragmentLoader {
    /** Configuration of the IFC-fragment conversion. */
    settings: Settings;
    private _webIfc;
    private _items;
    private _materials;
    private readonly _geometry;
    private readonly _converter;
    dispose(): void;
    /** Loads the IFC file and converts it to a set of fragments. */
    load(buffer: ArrayBuffer): Promise<FragmentGroup>;
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

declare function ConvertIfcToFragmentsBinary(buffer: Buffer): Promise<Uint8Array>;
declare function ConvertIfcToFragments(ifcURL: string): Promise<{
    file: string;
    modelId: any;
}>;

export { ConvertIfcToFragments, ConvertIfcToFragmentsBinary, IfcFragmentLoader };
