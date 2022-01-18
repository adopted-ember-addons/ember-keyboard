import Options from './options';
export default function babelFilter(skipBabel: Required<Options>['skipBabel']): (filename: string) => boolean;
