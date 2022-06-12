import ts from 'typescript';
import LineColumn from 'line-column';
import { ErrorCode } from './ErrorCode';
import { NamedClassDeclaration } from '../../core/ts-helpers/types';
import { unquoteString } from '../../core/utils/unquoteString';

export abstract class AbstractCompilationError {
    public abstract code: ErrorCode
    public abstract description: string
    public readonly position: [start: number, end: number];
    public readonly contextDetails: IContextDetails | null;
    public readonly filePath: string;

    public constructor(
        public details: string | null,
        node: ts.Node,
        contextNode: NamedClassDeclaration | null
    ) {
        this.position = this.getNodePosition(node);
        this.filePath = node.getSourceFile().fileName;
        this.contextDetails = this.getContextDetails(contextNode);
    }

    private getNodePosition(node: ts.Node): typeof this.position {
        const sourceFileText = node.getSourceFile().text;
        const lengthBeforeNode = sourceFileText.slice(0, node.getStart()).length;
        const actualPosition = sourceFileText.slice(node.getStart()).search(/\S+/) + lengthBeforeNode;
        const columnFinder = LineColumn(sourceFileText);
        const result = columnFinder.fromIndex(actualPosition) ?? { col: 0, line: 0 };

        return [result.line, result.col];
    }

    private getContextDetails(contextNode: NamedClassDeclaration | null): IContextDetails | null {
        if (contextNode === null) {
            return null;
        }

        return {
            name: unquoteString(contextNode.name.getText()),
            path: contextNode.getSourceFile().fileName,
            position: this.getNodePosition(contextNode.name),
        };
    }
}

export interface IContextDetails {
    name: string;
    path: string;
    position: [start: number, end: number];
}
