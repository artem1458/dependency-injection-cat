import { TestConfiguration } from './testConfiguration';

export const disableFailOnNotInitializedContainerAccess = (): void => {
    TestConfiguration.failOnNotConfiguredContainer = false;
};
