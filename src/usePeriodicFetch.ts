import { useRef, useEffect, useState, useCallback, DependencyList } from 'react'

export interface UpdateConfig {
  interval: number, 
  unit: "second" | "minute",
  quite?: boolean // whether to hide loading while updating
  backgroundFetch?: boolean // whether to fetch even if the page is inactive
}

/**
 * fetch data periodically to keep it fresh
 * @param fetchData
 * @param updateConfig
 * @param deps dependencies, fetchData will be executed immediately once this changes
 */
function usePeriodicFetch<T>(
  fetchData: () => Promise<T>,
  updateConfig: UpdateConfig,
  deps: DependencyList = []
) {

  const { interval, unit, quite = true, backgroundFetch = false  } = updateConfig;

  const memorizedFetchData = useCallback(fetchData, deps); // memorize it since useEffect depends on it

  /* state */

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T>();

  /* ref */

  const unmounted = useRef(false);
  const timerId = useRef(NaN);

  /* effects */

  useEffect(() => {
    return () => {
      unmounted.current = true
    }
  }, [])

  useEffect(() => {
    // wrapper of memorizedFetchData
    async function loadData(showLoading = !quite) {
      if (unmounted.current) return;
      if (showLoading) {
        setLoading(true)
      }
      try {
        const result = await memorizedFetchData();
        if (unmounted.current) return;
        setData(result);
      } catch (e) {
        console.error(e)
      } finally {
        if (unmounted.current) return
        setLoading(false)
      }
    }
    // recursive fetch
    const milliseconds = unit === "second" ? 1000 * interval : 60 * 1000 * interval;
    loadData(true).then(() => {
      timerId.current = window.setInterval(() => {
        if (!backgroundFetch && !document.hasFocus()) {
          return // early return
        }
        loadData();
      }, milliseconds);
    })
    // clean up timer
    return () => {
      window.clearInterval(timerId.current);
    }
  }, [memorizedFetchData, interval, unit, quite, backgroundFetch])

  /* return */

  return { loading, data, setData };
}

export default usePeriodicFetch;