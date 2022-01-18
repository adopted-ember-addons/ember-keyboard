interface DirJSON {
    [filename: string]: DirJSON | string;
}
declare class Project {
    pkg: any;
    files: DirJSON;
    readonly isDependency = true;
    private _dependencies;
    private _devDependencies;
    private _root;
    private _tmp;
    constructor(name: string, version?: string, cb?: (project: Project) => void, root?: string);
    readonly root: string;
    readonly baseDir: string;
    name: string;
    version: string;
    static fromJSON(json: DirJSON, name: string): Project;
    static fromDir(root: string, name?: string): Project;
    writeSync(root?: string): void;
    readSync(root?: string): void;
    addDependency(name: string | Project, version?: string, cb?: (project: Project) => void): Project;
    removeDependency(name: string): void;
    removeDevDependency(name: string): void;
    addDevDependency(name: string | Project, version?: string, cb?: (project: Project) => void): Project;
    dependencies(): Project[];
    devDependencies(): Project[];
    validate(): void;
    toJSON(): DirJSON;
    toJSON(key: string): DirJSON | string;
    clone(): Project;
    dispose(): void;
}
export = Project;
