import Plugin from 'broccoli-plugin';
import { Packager, Variant } from './packager';
import Stage from './stage';
interface BroccoliPackager<Options> {
    new (stage: Stage, variants: Variant[], options?: Options): Plugin;
}
export default function toBroccoliPlugin<Options>(packagerClass: Packager<Options>): BroccoliPackager<Options>;
export {};
