import chalk from 'chalk';
import { escapeRegExp } from 'lodash';
import { END_PATH_TOKEN, START_PATH_TOKEN } from '../parseTokens';
import { DiConfigRepository } from '../../di-config-repository';

const loggedTypes: Array<string> = [];

export function checkTypeForCorrectness(type: string) {
    if (loggedTypes.includes(type)) {
        return;
    }
    loggedTypes.push(type);

    DiConfigRepository.data.forEach(path => {
        const regexp = new RegExp(`${escapeRegExp(START_PATH_TOKEN)}(${escapeRegExp(path)})${escapeRegExp(END_PATH_TOKEN)}`);
        const matches = type.match(regexp) || [];
        const transformed = matches[1];

        if (transformed !== undefined) {
            console.log(chalk.bgRed(`Some types defined in diconfig file, but we can handle it. ${transformed}`));
        }
    });
}
