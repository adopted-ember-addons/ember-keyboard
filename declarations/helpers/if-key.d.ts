export interface IfKeySignature {
    Args: {
        Positional: [keyCombo: string, callback: (event: KeyboardEvent) => void];
    };
    Return: (event: KeyboardEvent) => void;
}
/**
 * Returns a function that calls `callback` only when the event it receives
 * matches `keyCombo`.
 *
 * ```hbs
 * <input {{on "keydown" (if-key "Enter" this.submit)}} />
 * ```
 */
declare const ifKey: import("@ember/component/helper").FunctionBasedHelper<IfKeySignature>;
export default ifKey;
//# sourceMappingURL=if-key.d.ts.map