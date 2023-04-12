export class SpatialStructure {
    constructor() {
        this.floorProperties = [];
        this.itemsByFloor = {};
    }
    async setupFloors(webIfc, units) {
        this.reset();
        const floors = await this.getFloors(webIfc);
        for (const floor of floors) {
            await this.getFloorProperties(webIfc, floor, units);
            this.saveFloorRelations(floor);
        }
    }
    cleanUp() {
        this.floorProperties = [];
        this.itemsByFloor = {};
    }
    reset() {
        this.floorProperties = [];
        this.itemsByFloor = {};
    }
    async getFloorProperties(webIfc, floor, units) {
        const id = floor.expressID;
        const properties = webIfc.properties;
        const props = await properties.getItemProperties(0, id, false);
        props.SceneHeight = await this.getHeight(props, webIfc, properties, units);
        this.floorProperties.push(props);
    }
    async getHeight(props, webIfc, properties, units) {
        const placementID = props.ObjectPlacement.value;
        const coordArray = webIfc.GetCoordinationMatrix(0);
        const coordHeight = coordArray[13] * units.factor;
        const placement = await properties.getItemProperties(0, placementID, true);
        return this.getPlacementHeight(placement, units) + coordHeight;
    }
    getPlacementHeight(placement, units) {
        var _a, _b;
        let value = 0;
        const heightCoords = (_b = (_a = placement.RelativePlacement) === null || _a === void 0 ? void 0 : _a.Location) === null || _b === void 0 ? void 0 : _b.Coordinates;
        if (heightCoords) {
            value += heightCoords[2].value * units.complement * units.factor;
        }
        if (placement.PlacementRelTo) {
            value += this.getPlacementHeight(placement.PlacementRelTo, units);
        }
        return value;
    }
    saveFloorRelations(floor) {
        for (const item of floor.children) {
            this.itemsByFloor[item.expressID] = floor.expressID;
            if (item.children.length) {
                for (const child of item.children) {
                    this.itemsByFloor[child.expressID] = floor.expressID;
                }
            }
        }
    }
    async getFloors(webIfc) {
        const project = await webIfc.properties.getSpatialStructure(0);
        // TODO: This is fixed from web-ifc 0.0.37
        // TODO: This fails with IFCs with uncommon spatial structure
        // @ts-ignore
        const floors = project.children[0].children[0].children;
        return floors;
    }
}
//# sourceMappingURL=spatial-structure.js.map