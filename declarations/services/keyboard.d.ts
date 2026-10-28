import Service from '@ember/service';
import type { KeyboardResponder } from '../types.ts';
export default class KeyboardService extends Service {
    registeredResponders: Set<KeyboardResponder>;
    get activeResponders(): KeyboardResponder[];
    get sortedResponders(): KeyboardResponder[];
    get firstResponders(): KeyboardResponder[];
    get normalResponders(): KeyboardResponder[];
    _disableOnInput?: boolean;
    _listeners: string[];
    constructor(...args: ConstructorParameters<typeof Service>);
    willDestroy(): void;
    _respond(event: Event): void;
    register(responder: KeyboardResponder): void;
    unregister(responder: KeyboardResponder): void;
    keyDown(keyCombo?: string): string;
    keyPress(keyCombo?: string): string;
    keyUp(keyCombo?: string): string;
}
declare module '@ember/service' {
    interface Registry {
        keyboard: KeyboardService;
    }
}
//# sourceMappingURL=keyboard.d.ts.map