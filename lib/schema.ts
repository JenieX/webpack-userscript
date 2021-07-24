import { JSONSchema7 } from 'json-schema';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const schema: JSONSchema7 = require('./schema.json');

export function getUserscriptOptionSchema(): JSONSchema7 {
  return Object.assign({}, schema, {
    $ref: '#/definitions/UserscriptOptions',
  });
}

export function getHeaderSchema(): JSONSchema7 {
  return Object.assign({}, schema, {
    $ref: '#/definitions/Header',
  });
}
