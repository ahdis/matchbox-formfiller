import * as R from 'ramda';
import { isNumber, isString } from 'util';

export const isNotNil = R.complement(R.isNil);
export const filterNotNil = R.filter<any, 'array'>(R.complement(R.isNil));

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
  R.pipe(
    getStatePathFromItemLinkIdPath,
    R.append(propertyName),
    R.lensPath
  );

export const getAnswersLensFromItemLinkIdPath = getPropertyLensFromItemLinkIdPath(
  'answers'
);
export const getAnswerOptionsLensFromItemLinkIdPath = getPropertyLensFromItemLinkIdPath(
  'answerOptions'
);
