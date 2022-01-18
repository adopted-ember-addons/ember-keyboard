export { default as install } from './install';
interface SetupOptions {
    getRootElement?: () => Element | null;
}
export declare function setup(assert: Assert, options?: SetupOptions): void;
