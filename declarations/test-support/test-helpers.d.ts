import { keyEvent } from './key-event.ts';
type KeyEventArgs = Parameters<typeof keyEvent>;
export declare function mouseDown(keyCombo?: string): Promise<void>;
export declare function mouseUp(keyCombo?: string): Promise<void>;
export declare function keyDown(keyCombo?: string): Promise<void>;
export declare function keyDownWithElement(keyCombo: string | undefined, element?: KeyEventArgs[2], eventOptions?: KeyEventArgs[3]): Promise<void>;
export declare function keyUp(keyCombo?: string): Promise<void>;
export declare function keyPress(keyCombo?: string): Promise<void>;
export declare function touchStart(keyCombo?: string): Promise<void>;
export declare function touchEnd(keyCombo?: string): Promise<void>;
export {};
//# sourceMappingURL=test-helpers.d.ts.map