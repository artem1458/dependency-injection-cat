import ts from 'typescript';
import { isExtendsCatContext } from './utils/isExtendsCatContext';
import { registerBeans } from './registerBeans';

export default (program: ts.Program): ts.TransformerFactory<ts.SourceFile> => {
    return context => sourceFile => {
        const visitor = (node: ts.Node): ts.Node => {
            if (isExtendsCatContext(node, program)) {
                registerBeans(node, program);
                return node;
            }

            return ts.visitEachChild(node, visitor, context);
        };

        return ts.visitNode(sourceFile, visitor);
    };
};
