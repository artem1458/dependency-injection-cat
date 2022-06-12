import ts from 'typescript';
import { ErrorCode } from '../ErrorCode';
import { getPositionOfNode, INodePosition } from '../../core/utils/getPositionOfNode';

export abstract class AbstractTransformationError {
    public abstract code: ErrorCode
    public abstract description: string
    public readonly position: INodePosition;
    public readonly filePath: string;

    public constructor(
        public details: string | null,
        node: ts.Node,
    ) {
        this.position = getPositionOfNode(node);
        this.filePath = node.getSourceFile().fileName;
    }
}
