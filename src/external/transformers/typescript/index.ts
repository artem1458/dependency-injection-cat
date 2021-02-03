import ts, { factory } from 'typescript';
import { IDiConfig, initDiConfig } from '../config';
import { runCompile } from '../../../internal/runCompile';
import { isContainerAccess } from '../../../internal/ts-helpers/container/isContainerAccess';
import { replaceContainerCall } from '../../../internal/ts-helpers/container/replaceContainerCall';
import { removeDIImportsFromStatements } from '../../../internal/ts-helpers/removeDIImports';

console.log(`
__/\\\\\\\\\\\\\\\\\\\\\\\\_____/\\\\\\\\\\\\\\\\\\\\\\______________________/\\\\\\\\\\\\\\\\\\_____/\\\\\\\\\\\\\\\\\\_____/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_        
 _\\/\\\\\\////////\\\\\\__\\/////\\\\\\///____________________/\\\\\\////////____/\\\\\\\\\\\\\\\\\\\\\\\\\\__\\///////\\\\\\/////__       
  _\\/\\\\\\______\\//\\\\\\_____\\/\\\\\\_____________________/\\\\\\/____________/\\\\\\/////////\\\\\\_______\\/\\\\\\_______      
   _\\/\\\\\\_______\\/\\\\\\_____\\/\\\\\\______/\\\\\\\\\\\\\\\\\\\\\\__/\\\\\\_____________\\/\\\\\\_______\\/\\\\\\_______\\/\\\\\\_______     
    _\\/\\\\\\_______\\/\\\\\\_____\\/\\\\\\_____\\///////////__\\/\\\\\\_____________\\/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_______\\/\\\\\\_______    
     _\\/\\\\\\_______\\/\\\\\\_____\\/\\\\\\___________________\\//\\\\\\____________\\/\\\\\\/////////\\\\\\_______\\/\\\\\\_______   
      _\\/\\\\\\_______/\\\\\\______\\/\\\\\\____________________\\///\\\\\\__________\\/\\\\\\_______\\/\\\\\\_______\\/\\\\\\_______  
       _\\/\\\\\\\\\\\\\\\\\\\\\\\\/____/\\\\\\\\\\\\\\\\\\\\\\__________________\\////\\\\\\\\\\\\\\\\\\_\\/\\\\\\_______\\/\\\\\\_______\\/\\\\\\_______ 
        _\\////////////_____\\///////////______________________\\/////////__\\///________\\///________\\///________
`);

export default (program: ts.Program, config?: IDiConfig): ts.TransformerFactory<ts.SourceFile> => {
    initDiConfig(config);
    runCompile();

    return context => {
        return sourceFile => {
            const importsToAdd: ts.ImportDeclaration[] = [];
            let hasContainerAccess = false;

            const visitor: ts.Visitor = (node => {
                if (isContainerAccess(node)) {
                    hasContainerAccess = true;
                    return replaceContainerCall(node, importsToAdd);
                }

                return ts.visitEachChild(node, visitor, context);
            });

            const newSourceFile = ts.visitNode(sourceFile, visitor);
            const filteredStatements = hasContainerAccess ?
                removeDIImportsFromStatements(newSourceFile.statements)
                : newSourceFile.statements;

            return factory.updateSourceFile(
                sourceFile,
                [
                    ...importsToAdd,
                    ...filteredStatements,
                ],
                sourceFile.isDeclarationFile,
                sourceFile.referencedFiles,
                undefined,
                sourceFile.hasNoDefaultLib,
                undefined,
            );
        };
    };
};
