import fs from 'fs';
import path from 'path';
import {
  Config,
  createFormatter,
  createParser,
  createProgram,
  SchemaGenerator,
} from 'ts-json-schema-generator';
import { AbsolutePathFormatter } from './formatters/absolute_path';

const rootDir = (...paths: string[]) => path.join(__dirname, '..', ...paths);
const distDir = (...paths: string[]) =>
  path.join(__dirname, '..', 'dist', ...paths);

const stringifySpaces = process.env.NODE_ENV === 'development' ? 2 : 0;

const config: Config = {
  tsconfig: rootDir('tsconfig-schema.json'),
  type: '*',
  jsDoc: 'none',
  topRef: false,
};

const program = createProgram(config);
const generator = new SchemaGenerator(
  program,
  createParser(program, config),
  createFormatter(config, (fmt) => {
    fmt.addTypeFormatter(new AbsolutePathFormatter());
  }),
  config,
);
const schema = generator.createSchema(config.type);

fs.mkdir(distDir(), { recursive: true }, (err) => {
  if (err) {
    throw err;
  }
  fs.writeFile(
    distDir('schema.json'),
    JSON.stringify(schema, null, stringifySpaces),
    (err) => {
      if (err) throw err;
    },
  );
});
