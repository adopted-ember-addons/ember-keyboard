import { Tag } from './validators';
export declare let beginTrackingTransaction: undefined | ((debuggingContext?: string | false, deprecate?: boolean) => void);
export declare let endTrackingTransaction: undefined | (() => void);
export declare let runInTrackingTransaction: undefined | (<T>(fn: () => T, debuggingContext?: string | false) => T);
export declare let deprecateMutationsInTrackingTransaction: undefined | ((fn: () => void) => void);
export declare let resetTrackingTransaction: undefined | (() => string);
export declare let setTrackingTransactionEnv: undefined | ((env: {
    assert?(message: string): void;
    deprecate?(message: string): void;
    debugMessage?(obj?: unknown, keyName?: string): string;
}) => void);
export declare let assertTagNotConsumed: undefined | (<T>(tag: Tag, obj?: T, keyName?: keyof T | string | symbol) => void);
export declare let markTagAsConsumed: undefined | ((_tag: Tag) => void);
export declare let logTrackingStack: undefined | ((transaction?: Transaction) => string);
interface Transaction {
    parent: Transaction | null;
    debugLabel?: string;
    deprecate: boolean;
}
export {};
//# sourceMappingURL=debug.d.ts.map