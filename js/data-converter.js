import * as THREE from "three";
import { GeometryUtils } from "bim-fragment/geometry-utils";
import { Fragment } from "bim-fragment/fragment";
import { IfcCategories, IfcCategoryMap, IfcJsonExporter, } from "./ifc";
import { SpatialStructure } from "./spatial-structure";
import { Units } from "./units";
import { FragmentGroup, } from "./base-types";
import { TransformHelper } from "./transform-helper";
export class DataConverter {
    constructor(items, materials, settings) {
        this._categories = {};
        this._model = new FragmentGroup();
        this._ifcCategories = new IfcCategories();
        this._uniqueItems = {};
        this._units = new Units();
        this._boundingBoxes = {};
        this._transparentBoundingBoxes = {};
        this._expressIDfragmentIDMap = {};
        this._transform = new TransformHelper();
        this._propertyExporter = new IfcJsonExporter();
        this._spatialTree = new SpatialStructure();
        this._items = items;
        this._materials = materials;
        this._settings = settings;
    }
    reset() {
        this._model = new FragmentGroup();
        this._uniqueItems = {};
        this._boundingBoxes = {};
        this._transparentBoundingBoxes = {};
    }
    cleanUp() {
        this._spatialTree.cleanUp();
        this._categories = {};
        this._model = new FragmentGroup();
        this._ifcCategories = new IfcCategories();
        this._uniqueItems = {};
        this._units = new Units();
        this._propertyExporter = new IfcJsonExporter();
    }
    setupCategories(webIfc) {
        this._categories = this._ifcCategories.getAll(webIfc, 0);
    }
    async generateFragmentData(webIfc) {
        await this._units.setUp(webIfc);
        await this._spatialTree.setupFloors(webIfc, this._units);
        this.processAllFragmentsData();
        this.processAllUniqueItems();
        await this.saveModelData(webIfc);
        return this._model;
    }
    async saveModelData(webIfc) {
        this._model.boundingBoxes = this._boundingBoxes;
        this._model.transparentBoundingBoxes = this._transparentBoundingBoxes;
        this._model.expressIDFragmentIDMap = this._expressIDfragmentIDMap;
        this._model.levelRelationships = this._spatialTree.itemsByFloor;
        this._model.floorsProperties = this._spatialTree.floorProperties;
        this._model.allTypes = IfcCategoryMap;
        this._model.itemTypes = this._categories;
        this._model.coordinationMatrix = this.getCoordinationMatrix(webIfc);
        this._model.properties = await this.getModelProperties(webIfc);
    }
    getCoordinationMatrix(webIfc) {
        const coordArray = webIfc.GetCoordinationMatrix(0);
        return new THREE.Matrix4().fromArray(coordArray);
    }
    async getModelProperties(webIfc) {
        if (!this._settings.includeProperties) {
            return {};
        }
        return new Promise((resolve) => {
            this._propertyExporter.propertiesSerialized.on((properties) => {
                resolve(properties);
            });
            this._propertyExporter.export(webIfc, 0);
        });
    }
    processAllFragmentsData() {
        const fragmentsData = Object.values(this._items);
        for (const data of fragmentsData) {
            this.processFragmentData(data);
        }
    }
    processFragmentData(data) {
        const id = data.instances[0].id;
        const categoryID = this._categories[id];
        // TODO: use settings.instanceLimit and implement merging many instances
        //  (e.g. for a model with thousands of objects that repeat 2 times)
        const isUnique = data.instances.length === 1;
        const isInstanced = this._settings.instancedCategories.has(categoryID);
        const noFloors = Object.keys(this._spatialTree.itemsByFloor).length === 0;
        if (!isUnique || isInstanced || noFloors) {
            this.processInstancedItems(data);
        }
        else {
            this.processMergedItems(data);
        }
    }
    processMergedItems(data) {
        for (const matID in data.geometriesByMaterial) {
            const instance = data.instances[0];
            const category = this._categories[instance.id];
            const level = this._spatialTree.itemsByFloor[instance.id];
            this.initializeItem(data, category, level, matID);
            this.applyTransformToMergedGeometries(data, category, level, matID);
        }
    }
    applyTransformToMergedGeometries(data, category, level, matID) {
        const geometries = data.geometriesByMaterial[matID];
        const instance = data.instances[0];
        this._units.apply(instance.matrix);
        for (const geometry of geometries) {
            geometry.userData.id = instance.id;
            this._uniqueItems[category][level][matID].geoms.push(geometry);
            geometry.applyMatrix4(instance.matrix);
        }
    }
    initializeItem(data, category, level, matID) {
        if (!this._uniqueItems[category]) {
            this._uniqueItems[category] = {};
        }
        if (!this._uniqueItems[category][level]) {
            this._uniqueItems[category][level] = {};
        }
        if (!this._uniqueItems[category][level][matID]) {
            this._uniqueItems[category][level][matID] = {
                geoms: [],
                hasVoids: data.instances[0].hasVoids,
            };
        }
    }
    processInstancedItems(data) {
        const fragment = this.createInstancedFragment(data);
        this.setFragmentInstances(data, fragment);
        fragment.mesh.updateMatrix();
        this._model.fragments.push(fragment);
        this._model.add(fragment.mesh);
        const materialIDs = Object.keys(data.geometriesByMaterial);
        const mats = materialIDs.map((id) => this._materials[id]);
        const matsTransparent = this.areMatsTransparent(mats);
        const isTransparent = matsTransparent || data.instances[0].hasVoids;
        const boxes = this.getBoxes(isTransparent);
        const baseHelper = this._transform.getHelper([fragment.mesh.geometry]);
        for (let i = 0; i < fragment.mesh.count; i++) {
            const instanceTransform = new THREE.Matrix4();
            const instanceHelper = new THREE.Object3D();
            fragment.getInstance(i, instanceTransform);
            instanceHelper.applyMatrix4(baseHelper.matrix);
            instanceHelper.applyMatrix4(instanceTransform);
            instanceHelper.updateMatrix();
            const id = fragment.getItemID(i, 0);
            boxes[id] = instanceHelper.matrix.elements;
            this._expressIDfragmentIDMap[id] = fragment.id;
        }
    }
    getBoxes(isTransparent) {
        const boxes = isTransparent
            ? this._transparentBoundingBoxes
            : this._boundingBoxes;
        return boxes;
    }
    areMatsTransparent(mats) {
        for (const mat of mats) {
            if (mat.transparent) {
                return true;
            }
        }
        return false;
    }
    setFragmentInstances(data, fragment) {
        for (let i = 0; i < data.instances.length; i++) {
            const instance = data.instances[i];
            this._units.apply(instance.matrix);
            fragment.setInstance(i, {
                ids: [instance.id.toString()],
                transform: instance.matrix,
            });
        }
    }
    createInstancedFragment(data) {
        const mats = this.getMaterials(data);
        const geoms = Object.values(data.geometriesByMaterial);
        const merged = GeometryUtils.merge(geoms);
        return new Fragment(merged, mats, data.instances.length);
    }
    getMaterials(data) {
        const mats = Object.keys(data.geometriesByMaterial).map((id) => this._materials[id]);
        return mats;
    }
    processAllUniqueItems() {
        const categories = Object.keys(this._uniqueItems);
        for (const categoryString of categories) {
            for (const levelString in this._uniqueItems[categoryString]) {
                const category = parseInt(categoryString, 10);
                const level = parseInt(levelString, 10);
                if (level !== undefined && category !== undefined) {
                    this.processUniqueItem(category, level);
                }
            }
        }
    }
    processUniqueItem(category, level) {
        const item = this._uniqueItems[category][level];
        if (!item)
            return;
        const geometriesData = Object.values(item);
        const geometries = geometriesData.map((geom) => geom.geoms);
        const { buffer, ids } = this.processIDsAndBuffer(geometries);
        const mats = this.getUniqueItemMaterial(category, level);
        const items = {};
        let hasVoids = false;
        for (const geometryGroup of geometriesData) {
            hasVoids = hasVoids || geometryGroup.hasVoids;
            for (const geom of geometryGroup.geoms) {
                const id = geom.userData.id;
                if (!items[id]) {
                    items[id] = [];
                }
                items[id].push(geom);
            }
        }
        const matsTransparent = this.areMatsTransparent(mats);
        const isTransparent = matsTransparent || hasVoids;
        const boxes = this.getBoxes(isTransparent);
        for (const id in items) {
            const geoms = items[id];
            const helper = this._transform.getHelper(geoms);
            boxes[id] = helper.matrix.elements;
        }
        const merged = GeometryUtils.merge(geometries);
        const mergedFragment = this.newMergedFragment(merged, buffer, mats, ids);
        this._model.fragments.push(mergedFragment);
        this._model.add(mergedFragment.mesh);
        for (const id in items) {
            this._expressIDfragmentIDMap[id] = mergedFragment.id;
        }
    }
    newMergedFragment(merged, buffer, mats, itemsIDs) {
        merged.setAttribute("blockID", new THREE.BufferAttribute(buffer, 1));
        const mergedFragment = new Fragment(merged, mats, 1);
        const ids = Array.from(itemsIDs).map((id) => id.toString());
        mergedFragment.setInstance(0, { ids, transform: new THREE.Matrix4() });
        return mergedFragment;
    }
    processBuffer(geometries, size) {
        const buffer = new Uint32Array(size);
        const data = this.getBufferTempData();
        for (const geometryGroup of geometries) {
            for (const geom of geometryGroup) {
                this.updateBufferIDs(data, geom);
                const size = geom.attributes.position.count;
                const currentBlockID = data.currentIDs.get(geom.userData.id);
                buffer.fill(currentBlockID, data.offset, data.offset + size);
                data.offset += size;
            }
        }
        return buffer;
    }
    updateBufferIDs(data, geom) {
        if (!data.currentIDs.has(geom.userData.id)) {
            data.currentIDs.set(geom.userData.id, data.blockID++);
        }
    }
    getBufferTempData() {
        return { currentIDs: new Map(), offset: 0, blockID: 0 };
    }
    processIDsAndBuffer(geometries) {
        let size = 0;
        const ids = new Set();
        for (const geometryGroup of geometries) {
            for (const geom of geometryGroup) {
                size += geom.attributes.position.count;
                ids.add(geom.userData.id);
            }
        }
        const buffer = this.processBuffer(geometries, size);
        return { buffer, ids };
    }
    getUniqueItemMaterial(category, level) {
        const mats = Object.keys(this._uniqueItems[category][level]).map((id) => this._materials[id]);
        return mats;
    }
}
//# sourceMappingURL=data-converter.js.map