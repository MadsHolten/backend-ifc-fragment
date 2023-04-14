/// <reference types="node" />
export * from "./ifc-fragment-loader";
export declare function ConvertIfcToFragmentsBinary(buffer: Buffer): Promise<Uint8Array>;
export declare function ConvertIfcToFragments(ifcURL: string): Promise<{
    file: string;
    modelId: any;
}>;
