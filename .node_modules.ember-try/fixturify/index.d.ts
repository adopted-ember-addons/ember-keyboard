import { IMinimatch } from 'minimatch';
declare namespace fixturify {
    /**
     A recursive JSON representation of a directory. This representation includes
     both files, their contents and directories which can contain both files and
     directories.
  
     ```ts
      const files : DirJSON = {
        'index.js': 'content',
        'foo.txt': 'content',
        'folder': {
          'index.js': 'content',
          'apple.js': 'content',
          'other-folder': { }
        },
      }
      ```
   */
    interface DirJSON {
        [filename: string]: DirJSON | string | null;
    }
    interface Options {
        include?: (IMinimatch | string)[];
        exclude?: (IMinimatch | string)[];
        ignoreEmptyDirs?: boolean;
    }
    function readSync(dir: string, options?: Options, relativeRoot?: string): DirJSON;
    function writeSync(dir: string, obj: DirJSON): void;
}
export = fixturify;
