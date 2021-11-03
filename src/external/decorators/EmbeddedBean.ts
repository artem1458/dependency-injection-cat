type TEmbeddedBean = PropertyDecorator;

export const EmbeddedBean: TEmbeddedBean = () => {
    throw new Error('Trying to use @EmbeddedBean without configured di-container, or not in context-class');
};
