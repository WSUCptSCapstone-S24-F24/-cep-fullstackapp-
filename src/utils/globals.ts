// src/utils/globals.ts
import { MutableRefObject } from 'react';

export let globalFocalLengthRef: MutableRefObject<number>;

export const setGlobalFocalLengthRef = (ref: MutableRefObject<number>) => {
  globalFocalLengthRef = ref;
};
