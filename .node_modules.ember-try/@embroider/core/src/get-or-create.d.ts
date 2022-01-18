interface AbstractMap<K, V> {
    get(key: K): V | undefined;
    set(key: K, value: V): void;
}
export declare function getOrCreate<K, V>(map: AbstractMap<K, V>, key: K, construct: (key: K) => V): V;
export {};
