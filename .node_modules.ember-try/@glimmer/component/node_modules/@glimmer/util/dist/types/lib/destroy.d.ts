import { Maybe, SymbolDestroyable, Destroyable, DestroySymbol } from '@glimmer/interfaces';
export declare const DESTROY: DestroySymbol;
export declare function isDestroyable(value: Maybe<object> | SymbolDestroyable): value is SymbolDestroyable;
export declare function isStringDestroyable(value: Maybe<Partial<Destroyable>>): value is Destroyable;
//# sourceMappingURL=destroy.d.ts.map