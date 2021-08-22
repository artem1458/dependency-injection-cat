type TBeforeDestruct = PropertyDecorator & MethodDecorator;

export const BeforeDestruct: TBeforeDestruct = () => {
    throw new Error('Trying to use @BeforeDestruct without configured di-container, or not in context-class');
};
