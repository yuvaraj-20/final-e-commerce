// src/hooks/usePaginated.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../lib/apiClient';

/**
 * usePaginated - reusable hook for paginated API endpoints
 *
 * @param {string} url - API endpoint (e.g. '/api/products')
 * @param {Array} deps - other hook dependencies that should trigger a refetch (e.g. [searchQuery])
 * @param {object} options - optional config:
 *    - initialPage (number) default: 1
 *    - pageSize (number) default: 12
 *    - params (object) extra query params to send with every request
 *    - cache (boolean) whether to cache responses in-memory (default: true)
 *
 * Returns: { data, meta, loading, error, fetchPage, refresh }
 */
export default function usePaginated(url, deps = [], options = {}) {
  const {
    initialPage = 1,
    pageSize = 12,
    params: extraParams = {},
    cache = true,
  } = options;

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({
    current_page: initialPage,
    last_page: 1,
    per_page: pageSize,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // keep the latest params/page for refresh
  const lastRef = useRef({ page: initialPage, params: extraParams });

  // small in-memory cache keyed by URL+params+page
  const cacheRef = useRef(new Map());

  // AbortController ref to cancel inflight requests
  const controllerRef = useRef(null);

  // build cache key helper
  const makeKey = useCallback((page, params) => {
    try {
      return `${url}|p=${page}|${JSON.stringify(params || {})}|ps=${pageSize}`;
    } catch (e) {
      // fallback if params not serializable
      return `${url}|p=${page}|ps=${pageSize}`;
    }
  }, [url, pageSize]);

  // fetch function
  const fetchPage = useCallback(async (page = initialPage, params = {}) => {
    const mergedParams = { ...extraParams, ...params };
    lastRef.current = { page, params: mergedParams };

    const key = makeKey(page, mergedParams);
    if (cache && cacheRef.current.has(key)) {
      const cached = cacheRef.current.get(key);
      setData(cached.data || []);
      setMeta(cached.meta || { current_page: page, last_page: 1 });
      setError(null);
      return cached;
    }

    // cancel previous request if any
    if (controllerRef.current) {
      try { controllerRef.current.abort(); } catch (e) {}
    }
    controllerRef.current = new AbortController();
    const signal = controllerRef.current.signal;

    setLoading(true);
    setError(null);

    try {
      const res = await api.get(url, {
        params: { page, per_page: pageSize, ...mergedParams },
        signal,
      });

      // Laravel-style pagination: { data: [...], meta: { ... } } OR direct array
      const payload = res.data;

      let items = [];
      let pagination = null;

      if (Array.isArray(payload)) {
        items = payload;
        pagination = { current_page: page, last_page: 1, per_page: pageSize, total: payload.length };
      } else if (payload && payload.data) {
        items = payload.data;
        // some backends put pagination in `meta` or have top-level current_page / last_page
        pagination = payload.meta || {
          current_page: payload.current_page || page,
          last_page: payload.last_page || 1,
          per_page: payload.per_page || pageSize,
          total: payload.total || (Array.isArray(payload.data) ? payload.data.length : 0),
        };
      } else {
        // unknown shape, attempt to use payload as items
        items = payload;
        pagination = { current_page: page, last_page: 1, per_page: pageSize, total: Array.isArray(payload) ? payload.length : 0 };
      }

      setData(items || []);
      setMeta(pagination || { current_page: page, last_page: 1 });

      // store in cache
      if (cache) {
        cacheRef.current.set(key, { data: items, meta: pagination });
        // optionally limit cache size (not implemented here)
      }

      setLoading(false);
      return { data: items, meta: pagination };
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        // fetch was aborted — ignore
        return;
      }
      setError(err.response?.data?.message || err.message || 'Failed to fetch');
      setLoading(false);
      throw err;
    }
  }, [url, extraParams, initialPage, pageSize, cache, makeKey]);

  // refresh convenience - re-fetch last page with last params
  const refresh = useCallback(() => {
    const { page, params } = lastRef.current || { page: initialPage, params: extraParams };
    return fetchPage(page, params);
  }, [fetchPage, initialPage, extraParams]);

  // initial load and re-run on deps changes
  useEffect(() => {
    // reset page to initialPage on deps change
    lastRef.current = { page: initialPage, params: extraParams };
    fetchPage(initialPage).catch(() => {/* handled by hook state */});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps); // intentionally only deps, options controlled above

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        try { controllerRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  return {
    data,
    meta,
    loading,
    error,
    fetchPage,
    refresh,
    // small helpers:
    currentPage: meta.current_page || initialPage,
    lastPage: meta.last_page || 1,
  };
}
