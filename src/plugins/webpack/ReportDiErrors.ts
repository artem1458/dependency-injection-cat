import chalk from 'chalk';

console.error(chalk.red('Warning: ReportDiErrorsPlugin is now deprecated new plugin will be used instead, please change plugin path from dependency-injection-cat/plugins/webpack/ReportDiErrors to dependency-injection-cat/plugins/webpack '));

import DICatWebpackPlugin from './';

export default DICatWebpackPlugin;
