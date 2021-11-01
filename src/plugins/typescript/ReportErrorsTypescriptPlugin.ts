import ts from 'typescript';
import chalk from 'chalk';

console.log(chalk.yellow('ReportErrorsTypescriptPlugin is deprecated, please remove it from your tsconfig.json'));

export default (): ts.TransformerFactory<ts.SourceFile> => context => node => node;
