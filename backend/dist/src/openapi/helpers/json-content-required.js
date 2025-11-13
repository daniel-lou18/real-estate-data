import jsonContent from "./json-content";
const jsonContentRequired = (schema, description) => {
    return {
        ...jsonContent(schema, description),
        required: true,
    };
};
export default jsonContentRequired;
