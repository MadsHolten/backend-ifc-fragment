import { IfcElements } from "./ifc-elements-map";
export class IfcCategories {
    getAll(webIfc, modelID) {
        const elementsCategories = {};
        const categoriesIDs = this.getCategories();
        for (let i = 0; i < categoriesIDs.length; i++) {
            const element = categoriesIDs[i];
            const lines = webIfc.GetLineIDsWithType(modelID, element);
            const size = lines.size();
            for (let i = 0; i < size; i++) {
                elementsCategories[lines.get(i)] = element;
            }
        }
        return elementsCategories;
    }
    getCategories() {
        const elements = Object.keys(IfcElements).map((e) => parseInt(e, 10));
        return elements;
    }
}
//# sourceMappingURL=ifc-categories.js.map