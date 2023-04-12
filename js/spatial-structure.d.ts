import * as WEBIFC from "web-ifc";
import { IfcItemsCategories } from "./ifc";
import { Units } from "./units";
export declare class SpatialStructure {
    floorProperties: any[];
    itemsByFloor: IfcItemsCategories;
    setupFloors(webIfc: WEBIFC.IfcAPI, units: Units): Promise<void>;
    cleanUp(): void;
    private reset;
    private getFloorProperties;
    private getHeight;
    private getPlacementHeight;
    private saveFloorRelations;
    private getFloors;
}
