export const EmbeddedBean: PropertyDecorator = () => {
    throw new Error('Trying to use @EmbeddedBean without configured di-container, or not in context-class');
};
