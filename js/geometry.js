import * as THREE from "three";
export class Geometry {
    constructor(webIfc, items, materials) {
        this._referenceMatrix = new THREE.Matrix4();
        this._isFirstMatrix = true;
        this._voids = new Set();
        this._geometriesByMaterial = {};
        this._items = {};
        this._webIfc = webIfc;
        this._items = items;
        this._materials = materials;
    }
    streamMesh(webifc, mesh) {
        this.reset(webifc);
        const geometryID = Geometry.getGeometryID(mesh);
        const isFirstInstanceOfThisGeometry = !this._items[geometryID];
        if (isFirstInstanceOfThisGeometry) {
            this.generateBufferGeometries(mesh, geometryID);
        }
        else {
            this.getGeometryTransformation(mesh, geometryID);
        }
    }
    cleanUp() {
        this._geometriesByMaterial = {};
        this._voids.clear();
    }
    addVoid(voidID) {
        this._voids.add(voidID);
    }
    reset(webifc) {
        this._geometriesByMaterial = {};
        this._referenceMatrix = new THREE.Matrix4();
        this._isFirstMatrix = true;
        this._webIfc = null;
        this._webIfc = webifc;
    }
    getGeometryTransformation(mesh, geometryID) {
        const referenceMatrix = this._items[geometryID].referenceMatrix;
        const geometryData = mesh.geometries.get(0);
        const transform = Geometry.getMeshMatrix(geometryData);
        transform.multiply(referenceMatrix);
        this._items[geometryID].instances.push({
            id: mesh.expressID,
            matrix: transform,
            hasVoids: this._voids.has(mesh.expressID),
        });
    }
    generateBufferGeometries(mesh, geometryID) {
        const size = mesh.geometries.size();
        for (let i = 0; i < size; i++) {
            const geometryData = mesh.geometries.get(i);
            const geometry = this.getBufferGeometry(geometryData.geometryExpressID);
            if (!geometry)
                return;
            this.applyTransform(geometryData, geometry);
            this.sortGeometriesByMaterials(geometryData, geometry);
        }
        this.saveGeometryInstances(geometryID, mesh);
    }
    saveGeometryInstances(geometryID, mesh) {
        this._items[geometryID] = {
            instances: [
                {
                    id: mesh.expressID,
                    matrix: new THREE.Matrix4(),
                    hasVoids: this._voids.has(mesh.expressID),
                },
            ],
            geometriesByMaterial: this._geometriesByMaterial,
            referenceMatrix: this._referenceMatrix,
        };
    }
    sortGeometriesByMaterials(geometryData, geometry) {
        const materialID = this.saveMaterials(geometryData);
        if (!this._geometriesByMaterial[materialID]) {
            this._geometriesByMaterial[materialID] = [geometry];
        }
        else {
            this._geometriesByMaterial[materialID].push(geometry);
        }
    }
    saveMaterials(geometryData) {
        const color = geometryData.color;
        const colorID = `${color.x}${color.y}${color.z}${color.w}`;
        const materialAlreadySaved = this._materials[colorID] !== undefined;
        if (!materialAlreadySaved) {
            this.saveNewMaterial(colorID, color);
        }
        return colorID;
    }
    saveNewMaterial(colorID, color) {
        this._materials[colorID] = new THREE.MeshLambertMaterial({
            color: new THREE.Color(color.x, color.y, color.z),
            transparent: color.w !== 1,
            opacity: color.w,
            side: THREE.DoubleSide,
        });
    }
    applyTransform(geometryData, geometry) {
        const matrix = Geometry.getMeshMatrix(geometryData);
        // We apply the tranformation only to the first geometry, and then
        // apply the inverse to the rest of the instances
        geometry.applyMatrix4(matrix);
        // We store this matrix to use it as a reference point. We'll apply this
        // later to the rest of the instances
        if (this._isFirstMatrix) {
            this._referenceMatrix = new THREE.Matrix4().copy(matrix).invert();
            this._isFirstMatrix = false;
        }
    }
    getBufferGeometry(expressID) {
        const geometry = this._webIfc.GetGeometry(0, expressID);
        const verts = this.getVertices(geometry);
        if (!verts.length)
            return null;
        const indices = this.getIndices(geometry);
        if (!indices.length)
            return null;
        const buffer = this.constructGeometry(verts, indices);
        // @ts-ignore
        geometry.delete();
        return buffer;
    }
    getIndices(geometryData) {
        const indices = this._webIfc.GetIndexArray(geometryData.GetIndexData(), geometryData.GetIndexDataSize());
        return indices;
    }
    getVertices(geometryData) {
        const verts = this._webIfc.GetVertexArray(geometryData.GetVertexData(), geometryData.GetVertexDataSize());
        return verts;
    }
    constructGeometry(vertexData, indexData) {
        const geometry = new THREE.BufferGeometry();
        const posFloats = new Float32Array(vertexData.length / 2);
        const normFloats = new Float32Array(vertexData.length / 2);
        for (let i = 0; i < vertexData.length; i += 6) {
            posFloats[i / 2] = vertexData[i];
            posFloats[i / 2 + 1] = vertexData[i + 1];
            posFloats[i / 2 + 2] = vertexData[i + 2];
            normFloats[i / 2] = vertexData[i + 3];
            normFloats[i / 2 + 1] = vertexData[i + 4];
            normFloats[i / 2 + 2] = vertexData[i + 5];
        }
        geometry.setAttribute("position", new THREE.BufferAttribute(posFloats, 3));
        geometry.setAttribute("normal", new THREE.BufferAttribute(normFloats, 3));
        geometry.setIndex(new THREE.BufferAttribute(indexData, 1));
        return geometry;
    }
    static getMeshMatrix(geometry) {
        const matrix = geometry.flatTransformation;
        const mat = new THREE.Matrix4();
        mat.fromArray(matrix);
        return mat;
    }
    static getGeometryID(mesh) {
        let result = "";
        const size = mesh.geometries.size();
        for (let i = 0; i < size; i++) {
            const placedGeometry = mesh.geometries.get(i);
            result += placedGeometry.geometryExpressID;
        }
        return result;
    }
}
//# sourceMappingURL=geometry.js.map