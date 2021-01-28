import ts from 'typescript';
import LineColumn from 'line-column';

export const getPositionOfNode = (node: ts.Node): [number, number] => {
    const sourceFileText = node.getSourceFile().text;
    const lengthBeforeNode = sourceFileText.slice(0, node.pos).length;
    const actualPosition = sourceFileText.slice(node.pos).search(/\S+/) + lengthBeforeNode;
    const columnFinder = LineColumn(sourceFileText);
    const result = columnFinder.fromIndex(actualPosition) ?? { col: 0, line: 0 };

    return [result.line, result.col];
};
