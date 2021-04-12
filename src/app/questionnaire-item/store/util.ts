import * as R from 'ramda';

export const isNotNil = R.complement(R.isNil);
export const filterNotNil = R.filter<any, 'array'>(R.complement(R.isNil));

export const isDate = R.is(Date) as (object: any) => object is Date;

export const isNumber = (object: any): object is number =>
  typeof object === 'number';

export const isObject = (object: any): boolean =>
  object !== null && typeof object === 'object';

export const isString = (object: any): object is string =>
  typeof object === 'string';

export const toArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

export const toBoolean = (value: unknown): boolean => !!value;

export const toString = (value: unknown): string | undefined =>
  isString(value) ? value : undefined;

export const toNumber = (value: unknown): number | undefined =>
  isNumber(value) ? value : undefined;

export const getStatePathFromItemLinkIdPath: (
  itemLinkIdPath: string[]
) => string[] = R.reduce((path, linkId) => [...path, 'items', linkId], []);

const getPropertyLensFromItemLinkIdPath = (propertyName: string) =>
  R.pipe(getStatePathFromItemLinkIdPath, R.append(propertyName), R.lensPath);

export const getAnswersLensFromItemLinkIdPath = getPropertyLensFromItemLinkIdPath(
  'answers'
);
export const getAnswerOptionsLensFromItemLinkIdPath = getPropertyLensFromItemLinkIdPath(
  'answerOptions'
);
