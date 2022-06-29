import { useEffect, useState, DependencyList } from 'react'
import { useAsyncRetry } from 'react-use'

/**
 * enhance useAsyncRetry so that it exposes the setValue function
 */
function useAsync<T>(
  asyncFn: () => Promise<T>, 
  deps: DependencyList = [],
) {
  const [value, setValue] = useState<T>();

  const { retry, loading, error, value: resValue } = useAsyncRetry<T>(
    asyncFn,
    deps
  );

  useEffect(() => {
    setValue(resValue);
  }, [resValue]);

  return { retry, loading, error, value, setValue };
}

export default useAsync;
