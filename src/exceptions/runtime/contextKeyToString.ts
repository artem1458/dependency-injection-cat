export const contextKeyToString = (contextKey: any): string => {
    if (contextKey === undefined) {
        return '"undefined"';
    }

    if (contextKey === null) {
        return '"null"';
    }

    let stringifiedKey: string;

    try {
        stringifiedKey = JSON.stringify(contextKey);
    } catch (e) {
        try {
            stringifiedKey = `${contextKey}`;
        } catch (e) {
            stringifiedKey = '"NOT_SERIALIZABLE_KEY"';
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (global.Symbol && typeof contextKey === 'symbol') {
                if ((contextKey as Symbol).description) {
                    stringifiedKey = `"Symbol(${(contextKey as Symbol).description})"`;
                } else {
                    stringifiedKey = '"SYMBOL_WITHOUT_DESCRIPTION"';
                }
            }
        }
    }

    return stringifiedKey;
};
