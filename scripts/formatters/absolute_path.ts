import {
  BaseType,
  Definition,
  DefinitionType,
  FunctionType,
  SubTypeFormatter,
} from 'ts-json-schema-generator';

export class AbsolutePathFormatter implements SubTypeFormatter {
  public supportsType(type: DefinitionType): boolean {
    return type.getName() === 'AbsolutePath';
  }

  public getDefinition(type: FunctionType): Definition {
    return {
      type: 'string',
      absolutePath: true,
    } as Definition;
  }

  public getChildren(type: FunctionType): BaseType[] {
    return [];
  }
}
