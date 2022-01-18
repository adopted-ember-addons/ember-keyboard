import { AttrNode, Block, BlockStatement, ElementNode, MustacheStatement, Node, Program, TextNode, PartialStatement, ConcatStatement, MustacheCommentStatement, CommentStatement, ElementModifierStatement, Expression, PathExpression, SubExpression, Hash, HashPair, Literal, StringLiteral, BooleanLiteral, NumberLiteral, UndefinedLiteral, NullLiteral, TopLevelStatement, Template } from '../types/nodes';
export interface PrinterOptions {
    entityEncoding: 'transformed' | 'raw';
    /**
     * Used to override the mechanism of printing a given AST.Node.
     *
     * This will generally only be useful to source -> source codemods
     * where you would like to specialize/override the way a given node is
     * printed (e.g. you would like to preserve as much of the original
     * formatting as possible).
     *
     * When the provided override returns undefined, the default built in printing
     * will be done for the AST.Node.
     *
     * @param ast the ast node to be printed
     * @param options the options specified during the print() invocation
     */
    override?(ast: Node, options: PrinterOptions): void | string;
}
export default class Printer {
    private buffer;
    private options;
    constructor(options: PrinterOptions);
    handledByOverride(node: Node, ensureLeadingWhitespace?: boolean): boolean;
    Node(node: Node): void;
    Expression(expression: Expression): void;
    Literal(literal: Literal): void;
    TopLevelStatement(statement: TopLevelStatement): void;
    Block(block: Block | Program | Template): void;
    TopLevelStatements(statements: TopLevelStatement[]): void;
    ElementNode(el: ElementNode): void;
    OpenElementNode(el: ElementNode): void;
    CloseElementNode(el: ElementNode): void;
    AttrNode(attr: AttrNode): void;
    AttrNodeValue(value: AttrNode['value']): void;
    TextNode(text: TextNode, isAttr?: boolean): void;
    MustacheStatement(mustache: MustacheStatement): void;
    BlockStatement(block: BlockStatement): void;
    BlockParams(blockParams: string[]): void;
    PartialStatement(partial: PartialStatement): void;
    ConcatStatement(concat: ConcatStatement): void;
    MustacheCommentStatement(comment: MustacheCommentStatement): void;
    ElementModifierStatement(mod: ElementModifierStatement): void;
    CommentStatement(comment: CommentStatement): void;
    PathExpression(path: PathExpression): void;
    SubExpression(sexp: SubExpression): void;
    Params(params: Expression[]): void;
    Hash(hash: Hash): void;
    HashPair(pair: HashPair): void;
    StringLiteral(str: StringLiteral): void;
    BooleanLiteral(bool: BooleanLiteral): void;
    NumberLiteral(number: NumberLiteral): void;
    UndefinedLiteral(node: UndefinedLiteral): void;
    NullLiteral(node: NullLiteral): void;
    print(node: Node): string;
}
//# sourceMappingURL=printer.d.ts.map