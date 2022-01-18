import SourceMapConcat from 'fast-sourcemap-concat';
export default class MeasureConcat {
    private name;
    private concat;
    private baseDir;
    stats: {
        [filename: string]: number;
    };
    constructor(name: string, concat: SourceMapConcat, baseDir: string);
    addFile(filename: string): void;
    addSpace(contents: string): void;
    end(): Promise<void>;
}
