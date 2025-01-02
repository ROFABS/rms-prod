import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

const cache = new Map<string, Map<string, any>>();

interface UseGetOptions {
  showToast?: boolean;
  headers?: Record<string, string>;
  disableCache?: boolean;
}

interface Messages {
  loading?: string;
  success?: string;
  failure?: string;
}

function useGet<T>({
  showToast = true,
  headers = {},
  disableCache = false,
}: UseGetOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getData = async (
    url: string,
    tag: string = "default",
    messages: Messages = {}
  ) => {
    setLoading(true);
    let loading_toast;
    let tagCache = cache.get(tag);
    if (tagCache && tagCache.has(url)) {
      setData(tagCache.get(url));
      setLoading(false);
    } else {
      if (showToast) {
        loading_toast = toast.loading(messages?.loading || "Loading...");
      }
      try {
        const response = await axios.get<T>(url, { headers });
        setData(response.data);
        if (!disableCache) {
          if (!tagCache) {
            tagCache = new Map<string, any>();
            cache.set(tag, tagCache);
          }
          tagCache.set(url, response.data);
        }
        if (showToast) {
          toast.success(messages?.success || "Data loaded successfully");
        }
      } catch (error: any) {
        setError(
          new Error(
            error?.response?.data?.message ||
              error?.response?.data?.error ||
              "An error occurred"
          )
        );
        if (showToast) {
          toast.error(
            messages.failure ||
              error?.response?.data?.message ||
              "An error occurred"
          );
        }
      } finally {
        setLoading(false);
        if (showToast && loading_toast) {
          toast.dismiss(loading_toast);
        }
      }
    }
  };

  const refresh = async (
    tag: string,
    messages: Messages = {},
    samePage = true
  ) => {
    setLoading(true);
    let loading_toast;
    if (showToast) {
      loading_toast = toast.loading(messages?.loading || "Refreshing...");
    }
    try {
      // Ensure a tag is provided
      if (!tag) {
        throw new Error("Tag is required for refreshing data");
      }

      // Attempt to retrieve the tag cache
      const tagCache = cache.get(tag);
      if (!tagCache) {
        throw new Error(`No cache found for tag: ${tag}`);
      }

      // Attempt to fetch data for the first URL associated with the tag
      const urlToFetch = Array.from(tagCache.keys())[0];
      if (!urlToFetch) {
        throw new Error(`No URL found for the provided tag: ${tag}`);
      }

      const response = await axios.get(urlToFetch, { headers });
      if (samePage) {
        setData(response.data);
      }

      // Update the tag cache with the new data
      // tagCache.set(tag, response.data);
      const newTagCache = new Map();
      newTagCache.set(urlToFetch, response.data);
      cache.set(tag, newTagCache);
      if (showToast) {
        toast.success(messages?.success || "Data refreshed successfully");
      }
    } catch (error: any) {
      setError(new Error(error?.message || "An error occurred during refresh"));
      if (showToast) {
        toast.error(
          messages.failure ||
            error?.message ||
            "An error occurred during refresh"
        );
      }
    } finally {
      setLoading(false);
      if (showToast && loading_toast) {
        toast.dismiss(loading_toast);
      }
    }
  };

  const invalidateCache = (tag: string, showToast: boolean = false) => {
    cache.delete(tag);
    if (showToast) {
      toast.success("Cache invalidated successfully");
    }
  };

  return { data, error, loading, getData, refresh, invalidateCache };
}

export default useGet;
