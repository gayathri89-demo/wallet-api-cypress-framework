import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

Cypress.Commands.add("validateSchema", (schema, responseBody) => {
  const validate = ajv.compile(schema);
  const isValid = validate(responseBody);

  expect(isValid, JSON.stringify(validate.errors, null, 2)).to.be.true;
});