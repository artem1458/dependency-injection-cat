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
        const regexp = new RegExp(`${START_PATH_TOKEN}${escapeRegExp(path)}${END_PATH_TOKEN}`, 'g');
        const matches = type.match(regexp) || [];
        const transformed = matches.map(it => it.slice(1, -1));

        if (transformed.length > 0) {
            console.log(chalk.bgRed(`Some types defined in diconfig files, but we can handle it. ${transformed.join(', ')}`));
        }
    });
}
