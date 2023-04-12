import * as WEBIFC from "web-ifc";
import * as THREE from "three";
export class Units {
    constructor() {
        this.factor = 1;
        this.complement = 1;
    }
    apply(matrix) {
        const scale = this.getScaleMatrix();
        const result = scale.multiply(matrix);
        matrix.copy(result);
    }
    setUp(webIfc) {
        var _a;
        this.factor = 1;
        const lengthUnits = this.getLengthUnits(webIfc);
        if (lengthUnits.Name.value === "FOOT") {
            this.factor = 0.3048;
        }
        else if (((_a = lengthUnits.Prefix) === null || _a === void 0 ? void 0 : _a.value) === "MILLI") {
            this.complement = 0.001;
        }
    }
    getLengthUnits(webIfc) {
        const allUnits = webIfc.GetLineIDsWithType(0, WEBIFC.IFCUNITASSIGNMENT);
        const units = allUnits.get(0);
        const unitsProps = webIfc.GetLine(0, units);
        const lengthUnitsID = unitsProps.Units[0].value;
        return webIfc.GetLine(0, lengthUnitsID);
    }
    getScaleMatrix() {
        return new THREE.Matrix4().fromArray([
            this.factor,
            0,
            0,
            0,
            0,
            this.factor,
            0,
            0,
            0,
            0,
            this.factor,
            0,
            0,
            0,
            0,
            1,
        ]);
    }
}
//# sourceMappingURL=units.js.map