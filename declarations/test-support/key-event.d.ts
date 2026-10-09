import { triggerEvent } from '@ember/test-helpers';
type Target = Parameters<typeof triggerEvent>[0];
export declare function keyEvent(keyCombo: string | undefined, type: string, element?: Target | Document, eventOptions?: Record<string, unknown>): Promise<void>;
export {};
//# sourceMappingURL=key-event.d.ts.map