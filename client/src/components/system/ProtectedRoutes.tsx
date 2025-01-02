import { USBDevice, UsbNavigator } from "@/lib/printer/types";
import { Restaurant, Table } from "@/pages/ksr/config/types";
import { User } from "@/pages/users/types/user";
import { useGlobalContext } from "@/store/GlobalContext";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, Outlet, useNavigate } from "react-router-dom";

const SERVER_URL = import.meta.env.VITE_APP_API_URL;

// Utility function to handle session retrieval and validation
const getSessionData = async ({
  setUser,
  setSelectedRestaurant,
  setSelectedTables,
  setPropertyId,
}: {
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setSelectedRestaurant: React.Dispatch<
    React.SetStateAction<Restaurant | null>
  >;
  setSelectedTables: React.Dispatch<React.SetStateAction<Table[] | null>>;
  setPropertyId: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  try {
    const session = localStorage.getItem("_session");
    if (!session) {
      throw new Error("No session found");
    }

    const local_data = JSON.parse(session);
    if (!local_data || !local_data.token) {
      throw new Error("Invalid session data");
    }

    // Fetch user data using the actual API call
    const user = await fetchUserData(local_data.token);
    setUser(user);
    setPropertyId(user?.properties?.[0]);
    // let property;
    // try {
    //   property = await fetchPropertyData(
    //     local_data.token,
    //     local_data.groupUniqueId
    //   );
    //   setProperty(property?.data[0]);
    // } catch (error) {
    //   setProperty(null);
    // }
    try {
      const restaurant = await fetchRestaurantData(
        local_data.groupUniqueId,
        user?.properties?.[0]
      );
      const currentRestaurant = Array.isArray(restaurant)
        ? restaurant[0]
        : restaurant;
      setSelectedRestaurant(currentRestaurant);
      setSelectedTables(currentRestaurant.tables);
    } catch (error) {
      setSelectedRestaurant(null);
      setSelectedTables(null);
    }
    if (!user) {
      throw new Error("User not found");
    }

    return { isAuthenticated: true, user };
  } catch (error) {
    const err = error as Error & { message: string };
    console.error(err.message || "Failed to get session data");
    localStorage.removeItem("_session");
    return { isAuthenticated: false };
  }
};

// Function to fetch user data from the API
const fetchUserData = async (token: string) => {
  try {
    const response = await axios.get(`${SERVER_URL}/get-me`, {
      headers: { "x-auth": token },
    });
    const { data } = response.data;
    return data;
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    const err = error as Error & { response: { data: { message: string } } };
    if (err.response.data.message.includes("expired")) {
      toast.error("Session expired. Please login again.");
    }
    return null;
  }
};

// Function to fetch property data from the API
const fetchPropertyData = async (token: string, groupUniqueId: string) => {
  try {
    const response = await axios.get(
      `${SERVER_URL}/property/${groupUniqueId}`,
      {
        headers: { "x-auth": token },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch property data:", error);
    return null;
  }
};

const fetchRestaurantData = async (groupId: string, uniqueId: string) => {
  try {
    const response = await axios.get(
      `${SERVER_URL}/ksr/restaurants?groupId=${groupId}&uniqueId=${uniqueId}&includeTables=true`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch restaurant data:", error);
    return null;
  }
};

const checkPrinterConnection = async (
  setDevice: React.Dispatch<React.SetStateAction<USBDevice | null>>,
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  try {
    const localDevice = localStorage.getItem("printer");
    if (!localDevice) {
      throw new Error("No device found");
    }

    const storedDevice = JSON.parse(localDevice);
    const devices = await (
      navigator as unknown as UsbNavigator
    ).usb.getDevices();
    const device = devices.find(
      (d) => d.serialNumber === storedDevice.serialNumber
    );

    if (!device) {
      throw new Error("Device not connected");
    }

    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(0);
    setDevice(device);
    setIsConnected(true);
    setError(null);
  } catch (err) {
    const error = err as Error & { message: string };
    console.log(err, "printer error");
    setDevice(null);
    setIsConnected(false);
    setError(
      `${
        error.message.includes("No device selected")
          ? "Please connect a printer"
          : error.message
      }`
    );
  }
};

const ProtectedRoutes = () => {
  const {
    setUser,
    setPropertyId,
    propertyId,
    setSelectedRestaurant,
    setSelectedTables,
    setDevice,
    setIsConnected,
    setError,
  } = useGlobalContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const sessionData = await getSessionData({
        setUser,
        setSelectedRestaurant,
        setSelectedTables,
        setPropertyId,
      });
      setIsLoading(false);
      setIsAuthenticated(sessionData.isAuthenticated);
      console.log(sessionData, "sessionData");
      if (!sessionData.user.isOnboarded) {
        navigate("/onboarding");
      }
      if (
        sessionData.user.isOnboarded &&
        (sessionData.user.dayEnded || !sessionData.user.dayStarted)
      ) {
        navigate("/day-close");
      }
      await checkPrinterConnection(setDevice, setIsConnected, setError);
    };
    checkSession();
  }, []);

  if (isLoading === true) {
    return (
      <div className="fixed inset-0 w-full h-full z-[999] bg-white flex justify-center items-center">
        <div className="loader_custom"></div>
      </div>
    );
  }

  if (!isLoading && isAuthenticated) {
    return <Outlet />;
  } else if (!isLoading && !isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
};

export default ProtectedRoutes;
