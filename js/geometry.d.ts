import * as WEBIFC from "web-ifc";
import { IfcToFragmentItems, MaterialList } from "./base-types";
export declare class Geometry {
    private _referenceMatrix;
    private _isFirstMatrix;
    private _voids;
    private _geometriesByMaterial;
    private _webIfc;
    private readonly _items;
    private readonly _materials;
    constructor(webIfc: WEBIFC.IfcAPI, items: IfcToFragmentItems, materials: MaterialList);
    streamMesh(webifc: WEBIFC.IfcAPI, mesh: WEBIFC.FlatMesh): void;
    cleanUp(): void;
    addVoid(voidID: number): void;
    private reset;
    private getGeometryTransformation;
    private generateBufferGeometries;
    private saveGeometryInstances;
    private sortGeometriesByMaterials;
    private saveMaterials;
    private saveNewMaterial;
    private applyTransform;
    private getBufferGeometry;
    private getIndices;
    private getVertices;
    private constructGeometry;
    private static getMeshMatrix;
    private static getGeometryID;
}
