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

// adapted from https://stackoverflow.com/a/17415677/16231610
const pad = (num: number) => String(Math.floor(Math.abs(num))).padStart(2, '0');
export const toLocaleDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const toLocaleTime = (date: Date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
export function toLocaleDateTime(date) {
  const timeZoneOffset = -date.getTimezoneOffset();
  const sign = timeZoneOffset >= 0 ? '+' : '-';
  const timeZone = `${pad(timeZoneOffset / 60)}:${pad(timeZoneOffset % 60)}`;
  return `${toLocaleDate(date)}T${toLocaleTime(date)}${sign}${timeZone}`;
}
