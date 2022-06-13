import ts from 'typescript';
import { MessageCode } from './MessageCode';
import { NamedClassDeclaration } from '../../core/ts-helpers/types';
import { unquoteString } from '../../core/utils/unquoteString';
import { getPositionOfNode, INodePosition } from '../../core/utils/getPositionOfNode';
import { MessageType } from './MessageType';

export abstract class AbstractCompilationMessage {
    public abstract code: MessageCode
    public abstract type: MessageType
    public abstract description: string
    public readonly position: INodePosition;
    public readonly contextDetails: IContextDetails | null;
    public readonly filePath: string;

    public constructor(
        public details: string | null,
        node: ts.Node,
        contextNode: NamedClassDeclaration | null
    ) {
        this.position = getPositionOfNode(node);
        this.filePath = node.getSourceFile().fileName;
        this.contextDetails = this.getContextDetails(contextNode);
    }

    private getContextDetails(contextNode: NamedClassDeclaration | null): IContextDetails | null {
        if (contextNode === null) {
            return null;
        }

        return {
            name: unquoteString(contextNode.name.getText()),
            path: contextNode.getSourceFile().fileName,
            namePosition: getPositionOfNode(contextNode.name),
        };
    }
}

export interface IContextDetails {
    name: string;
    path: string;
    namePosition: INodePosition;
}
