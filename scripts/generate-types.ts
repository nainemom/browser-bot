
import { createProgram, createParser, SchemaGenerator, createFormatter, Config, FunctionType, Definition, SubTypeFormatter, TypeFormatter } from "ts-json-schema-generator";
import fs from "fs";
import { BaseType } from "typescript";
import path from "path";

const config: Config = {
  path: path.resolve(__dirname, '../src/utils/browser/index.ts'),
  tsconfig: path.resolve(__dirname, '../tsconfig.json'),
  type: "*", // Or <type-name> if you want to generate schema for that one type only
  strictTuples: true,
};

const output_path = path.resolve(__dirname, '../types.json');

export class MyFunctionTypeFormatter implements SubTypeFormatter {
  // You can skip this line if you don't need childTypeFormatter
  public constructor(private childTypeFormatter: TypeFormatter) {}

  public supportsType(type: FunctionType): boolean {
      return type instanceof FunctionType;
  }

  public getDefinition(type: FunctionType): Definition {
      // Return a custom schema for the function property.
      return {
          type: "object",
          properties: {
              isFunction: {
                  type: "boolean",
                  const: true,
              },
          },
      };
  }

  // If this type does NOT HAVE children, generally all you need is:
  // @ts-ignore
  public getChildren(type: BaseType): BaseType[] {
      return [];
  }

  // However, if children ARE supported, you'll need something similar to
  // this (see src/TypeFormatter/{Array,Definition,etc}.ts for some examples):
  // public getChildren(type: FunctionType): BaseType[] {
  //     return []
  // }
}


// We configure the formatter an add our custom formatter to it.
const formatter = createFormatter(config, (fmt, circularReferenceTypeFormatter) => {
    // If your formatter DOES NOT support children, e.g. getChildren() { return [] }:
    // fmt.addTypeFormatter(new MyFunctionTypeFormatter());
    // If your formatter DOES support children, you'll need this reference too:
    // @ts-ignore
    fmt.addTypeFormatter(new MyFunctionTypeFormatter(circularReferenceTypeFormatter));
});

const program = createProgram(config);
const parser = createParser(program, config);
const generator = new SchemaGenerator(program, parser, formatter, config);
const schema = generator.createSchema(config.type);

const schemaString = JSON.stringify(schema, null, 2);
fs.writeFile(output_path, schemaString, (err) => {
    if (err) throw err;
});