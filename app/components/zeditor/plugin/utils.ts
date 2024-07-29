import _ from 'lodash';
import { useMemo, useRef } from 'react';

export const useDebounce = <T extends (...args: never[]) => void>(
  fn: T, ms: number, maxWait: number
) => {
  const funcRef = useRef<T | null>(null);
  funcRef.current = fn;

  return useMemo(
    () => _.debounce(
      (...args: Parameters<T>) => {
        if (funcRef.current) { funcRef.current(...args); }
      },
      ms,
      { maxWait },
    ),
    [ms, maxWait],
  );
};