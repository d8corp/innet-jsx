import { SourceMap } from 'magic-string';
import { Node, Parser } from 'acorn';
export declare const JSXParser: typeof Parser;
export interface TransformResult {
    code: string;
    map: SourceMap;
}
export declare function parse(code: string): Node;
export declare function transform(code: string, filePath?: string, parser?: typeof parse): TransformResult;
export default transform;
