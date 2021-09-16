import * as R from 'ramda';
import { Action, LinkIdPathSegment } from '../types';
import { setAnswers } from './action';
import { getExistingValueProperty } from './transform-initial-state';

interface SimplifiedResponseItem<T> {
  linkId: string;
  answer?: {
    item?: T[];
    [value: string]: any;
  }[];
  item?: T[];
}

const appendItemToPath = <T extends SimplifiedResponseItem<T>>(
  path: LinkIdPathSegment[],
  item?: T,
  index?: number
): LinkIdPathSegment[] =>
  item?.linkId
    ? [
        ...path,
        { linkId: item.linkId, ...(R.isNil(index) ? {} : { index: index }) },
      ]
    : [];

const extractSubItemsGroupedByLinkId = <T extends SimplifiedResponseItem<T>>(
  item: T
) => R.values(R.groupBy(R.prop('linkId'), item.item));

const indexedChain: <T, U>(
  f: (x: T, index: number) => U[],
  list: T[]
) => U[] = R.addIndex(R.chain) as any;

export const getInitActions = (
  path: LinkIdPathSegment[],
  parentIndex: number | undefined = undefined,
  index: number | undefined = undefined
) => <T extends SimplifiedResponseItem<T>>(item: T): Action[] => {
  const newPath = appendItemToPath(path, item, parentIndex);
  return Array.isArray(item?.answer)
    ? [
        setAnswers(newPath, R.map(getExistingValueProperty, item.answer)),
        ...indexedChain(
          (answer, subIndex) =>
            getInitActions(
              path,
              index,
              subIndex
            )({ ...item, answer: undefined, item: answer.item } as T),
          item.answer
        ),
      ]
    : Array.isArray(item?.item)
    ? R.chain(
        (itemsWithSameLinkId) =>
          R.prepend(
            setAnswers(
              appendItemToPath(newPath, itemsWithSameLinkId[0], index),
              R.repeat(undefined, itemsWithSameLinkId.length)
            ),
            indexedChain(
              (subItem, subIndex) =>
                getInitActions(newPath, index, subIndex)(subItem),
              itemsWithSameLinkId
            )
          ),
        extractSubItemsGroupedByLinkId(item)
      )
    : [];
};
