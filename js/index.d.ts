export * from "./ifc-fragment-loader";
export declare function ConvertIfcToFragments(ifcURL: string): Promise<{
    file: string;
    modelId: any;
}>;
