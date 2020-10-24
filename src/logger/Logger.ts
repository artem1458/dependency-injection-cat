import chalk from 'chalk';

export class Logger {
    static logError(message: string): void {
        console.log(chalk.bgRed);
    }

    static logWarning(message: string): void {
        console.log(chalk.bgYellow);
    }
}
