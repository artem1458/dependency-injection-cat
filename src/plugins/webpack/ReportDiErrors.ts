import chalk from 'chalk';
import DICatWebpackPlugin from './';

console.error(chalk.red('Warning: ReportDiErrorsPlugin is now deprecated new plugin will be used instead, please change plugin path from dependency-injection-cat/plugins/webpack/ReportDiErrors to dependency-injection-cat/plugins/webpack '));

export default DICatWebpackPlugin;
