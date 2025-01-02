import { USBDevice } from "@/lib/printer/types";
import { Restaurant, Table } from "@/pages/ksr/config/types";
import { Property } from "@/pages/property/types/property";
import { User } from "@/pages/users/types/user";
import React, { createContext, ReactNode, useContext, useState } from "react";

// Define the shape of the global state
interface GlobalState {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  propertyId: string | null;
  setPropertyId: React.Dispatch<React.SetStateAction<string | null>>;
  device: USBDevice | null;
  setDevice: React.Dispatch<React.SetStateAction<USBDevice | null>>;
  isConnected: boolean;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  selectedRestaurant: Restaurant | null;
  setSelectedRestaurant: React.Dispatch<
    React.SetStateAction<Restaurant | null>
  >;
  selectedTables: Table[] | null;
  setSelectedTables: React.Dispatch<React.SetStateAction<Table[] | null>>;
}

// Create the context with a default value
const GlobalContext = createContext<GlobalState | undefined>(undefined);

// Create a provider component
export const GlobalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [device, setDevice] = useState<USBDevice | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [selectedTables, setSelectedTables] = useState<Table[] | null>(null);

  return (
    <GlobalContext.Provider
      value={{
        user,
        setUser,
        propertyId,
        setPropertyId,
        device,
        setDevice,
        isConnected,
        setIsConnected,
        error,
        setError,
        selectedRestaurant,
        setSelectedRestaurant,
        selectedTables,
        setSelectedTables,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook to use the GlobalContext
export const useGlobalContext = (): GlobalState => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
