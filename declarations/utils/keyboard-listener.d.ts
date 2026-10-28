export default class KeyboardListener {
    type: string;
    altKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    metaKey: boolean;
    keyOrCode?: string;
    platform: string;
    constructor(platform?: string);
    static parse(s: string, platform?: string): KeyboardListener;
    createMatchingKeyboardEvent(opts?: KeyboardEventInit): KeyboardEvent;
}
//# sourceMappingURL=keyboard-listener.d.ts.map