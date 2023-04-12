import * as WEBIFC from "web-ifc";

/** Configuration of the IFC-fragment conversion. */
export class Settings {
  /** Categories that always will be instanced. */
  instancedCategories = new Set<number>();

  /** Whether to extract the IFC properties into a JSON. */
  includeProperties = true;

  /** Generate the geometry for categories that are not included by default. */
  optionalCategories: number[] = [WEBIFC.IFCSPACE];

  /** Path of the WASM for [web-ifc](https://github.com/ifcjs/web-ifc). */
  wasm = {
    path: "",
    absolute: false,
  };

  /** Loader settings for [web-ifc](https://github.com/ifcjs/web-ifc). */
  webIfc: WEBIFC.LoaderSettings = {
    COORDINATE_TO_ORIGIN: true,
    USE_FAST_BOOLS: true,
  };

  constructor() {
    this.instancedCategories.add(WEBIFC.IFCFURNISHINGELEMENT);
    this.instancedCategories.add(WEBIFC.IFCWINDOW);
    this.instancedCategories.add(WEBIFC.IFCDOOR);
  }
}
