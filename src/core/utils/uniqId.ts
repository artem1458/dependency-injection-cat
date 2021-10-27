export const uniqId = (): string => 'xxxxxxxxyxxxxxxx'.replace(/[xy]/g, (symbol) => {
    const random = Math.random() * 16 | 0;

    return (symbol == 'x' ? random : (random & 0x3 | 0x8)).toString(16);
});
