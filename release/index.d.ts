import { SourceMap as MSSourceMap } from 'magic-string';
import { Node, Parser, Options } from 'acorn';
export declare const JSXParser: typeof Parser;
export interface TransformResult {
    code: string;
    map?: MSSourceMap;
}
export declare function parse(code: string, options?: Options): Node;
export interface SourceMap {
    version: number;
    file: string;
    sources: string[];
    sourcesContent: string[];
    names: string[];
    mappings: string;
}
export interface TransformOption {
    jsxFile?: string;
    jsFile?: string;
    parser?: typeof parse;
    map?: SourceMap;
}
export declare function transform(code: TransformResult | string, { map, jsxFile, jsFile, parser }?: TransformOption): TransformResult;
export default transform;
