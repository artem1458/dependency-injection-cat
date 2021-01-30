import { shuffle } from 'lodash';

export const random = {
    nextString(): string {
        return Math.random().toString(36).substring(2);
    },
    listOfString(count = 5): string[] {
        return Array(count).fill('').map(this.nextString);
    },
    shuffle,
};
