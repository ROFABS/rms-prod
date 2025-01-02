type StorageType = "session" | "local";
type UseStorageReturnValue = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => boolean;
  removeItem: (key: string) => boolean;
  clear: () => boolean;
};

const useStorage = (
  { storageType }: { storageType: StorageType } = { storageType: "session" },
): UseStorageReturnValue => {
  const storageKey = `${storageType}Storage`;

  const isBrowser: boolean = typeof window !== "undefined";

  const getItem = (key: string): string | null => {
    if (!isBrowser) return null;
    try {
      return (window as any)[storageKey].getItem(key);
    } catch (error) {
      console.error(`Error getting item from ${storageKey}:`, error);
      return null;
    }
  };

  const setItem = (key: string, value: string): boolean => {
    if (!isBrowser) return false;
    try {
      (window as any)[storageKey].setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting item in ${storageKey}:`, error);
      return false;
    }
  };

  const removeItem = (key: string): boolean => {
    if (!isBrowser) return false;
    try {
      (window as any)[storageKey].removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item from ${storageKey}:`, error);
      return false;
    }
  };

  const clear = (): boolean => {
    if (!isBrowser) return false;
    try {
      (window as any)[storageKey].clear();
      return true;
    } catch (error) {
      console.error(`Error clearing ${storageKey}:`, error);
      return false;
    }
  };

  return {
    getItem,
    setItem,
    removeItem,
    clear,
  };
};

export default useStorage;
