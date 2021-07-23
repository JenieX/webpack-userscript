import { Interpolable, Repeatable } from '..';

export type NamedValue<T> = Record<Interpolable, T>;
export type TagValue =
  | Repeatable<Interpolable>
  | boolean
  | NamedValue<unknown>
  | undefined;

export interface Header {
  name: Interpolable;
  version: Interpolable;

  namespace?: Interpolable;
  author?: Interpolable;
  description?: Interpolable;
  homepage?: Interpolable;
  homepageURL?: Interpolable;
  website?: Interpolable;
  source?: Interpolable;
  icon?: Interpolable;
  iconURL?: Interpolable;
  defaulticon?: Interpolable;
  icon64?: Interpolable;
  icon64URL?: Interpolable;
  updateURL?: Interpolable;
  downloadURL?: Interpolable;
  installURL?: Interpolable;
  supportURL?: Interpolable;
  include?: Repeatable<Interpolable>;
  match?: Repeatable<Interpolable>;
  exclude?: Repeatable<Interpolable>;
  require?: Repeatable<Interpolable>;
  resource?: NamedValue<Interpolable>;
  connect?: Repeatable<Interpolable>;
  grant?: Repeatable<Interpolable>;
  webRequest?: Interpolable;
  noframes?: boolean;
  unwrap?: boolean;
  antifeature?: NamedValue<Interpolable>;
  nocompat?: boolean | Interpolable;
  ['run-at']?:
    | 'document-start'
    | 'document-body'
    | 'document-end'
    | 'document-idle'
    | 'context-menu';

  [tag: string]: TagValue;
}
