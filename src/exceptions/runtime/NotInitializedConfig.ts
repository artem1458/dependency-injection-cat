export class NotInitializedConfig extends Error {
    name = 'NotInitializedConfigException'
    message = 'Trying to use Not initialized config in the context';
}
