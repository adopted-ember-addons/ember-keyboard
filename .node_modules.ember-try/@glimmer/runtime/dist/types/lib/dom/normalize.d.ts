import { SimpleNode, SimpleDocumentFragment } from '@simple-dom/interface';
export interface SafeString {
    toHTML(): string;
}
export declare type Insertion = CautiousInsertion | TrustingInsertion;
export declare type CautiousInsertion = string | SafeString | SimpleNode;
export declare type TrustingInsertion = string | SimpleNode;
export declare function normalizeStringValue(value: unknown): string;
export declare function normalizeTrustedValue(value: unknown): TrustingInsertion;
export declare function shouldCoerce(value: unknown): boolean;
export declare function isEmpty(value: unknown): boolean;
export declare function isSafeString(value: unknown): value is SafeString;
export declare function isNode(value: unknown): value is SimpleNode;
export declare function isFragment(value: unknown): value is SimpleDocumentFragment;
export declare function isString(value: unknown): value is string;
//# sourceMappingURL=normalize.d.ts.map