/// <reference types="node" />
import { JSDOM } from 'jsdom';
import { EmberHTML } from './ember-html';
export interface ImplicitAssetPaths {
    'implicit-scripts': string[];
    'implicit-test-scripts': string[];
    'implicit-styles': string[];
    'implicit-test-styles': string[];
}
interface BaseAsset {
    relativePath: string;
}
export interface OnDiskAsset extends BaseAsset {
    kind: 'on-disk';
    sourcePath: string;
    mtime: number;
    size: number;
}
export interface InMemoryAsset extends BaseAsset {
    kind: 'in-memory';
    source: string | Buffer;
}
export interface EmberAsset extends BaseAsset {
    kind: 'ember';
    sourcePath: string;
    mtime: number;
    size: number;
    includeTests: boolean;
    rootURL: string;
    prepare(dom: JSDOM): EmberHTML;
}
export declare type Asset = OnDiskAsset | InMemoryAsset | EmberAsset;
export {};
