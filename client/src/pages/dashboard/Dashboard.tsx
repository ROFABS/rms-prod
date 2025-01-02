import FlexContainer from "@/components/layout/FlexContainer";
import Loader from "@/components/layout/Loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_TAGS } from "@/lib/consts/API_TAGS";
import { API_URL } from "@/lib/consts/app";
import useGet from "@/lib/hooks/use-get";
import { cn, formatProduct } from "@/lib/utils";
import { useGlobalContext } from "@/store/GlobalContext";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Restaurant } from "../ksr/config/types";

const Dashboard = () => {
  const { user, selectedRestaurant } = useGlobalContext();
  const navigate = useNavigate();
  const {
    data: restaurantData,
    error: restaurantError,
    loading: restaurantLoading,
    getData: getRestaurantData,
  } = useGet<Restaurant[]>({ showToast: false });

  useEffect(() => {
    if (selectedRestaurant) {
      getRestaurantData(
        `${API_URL}/ksr/restaurants?groupId=${user?.groupUniqueId}&includeTables=true`,
        API_TAGS.GET_RESTAURANTS
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant]);
  useEffect(() => {
    if (!user?.dayStarted) {
      navigate("/day-close");
    }
  }, [user]);
  return (
    <FlexContainer variant="column-start" className="p-2.5" gap="xl">
      {restaurantError && <p>{restaurantError.message}</p>}
      <FlexContainer variant="row-end">
        <Link to={"stats"}>
          <Button variant={"link"}>View Stats</Button>
        </Link>
      </FlexContainer>
      {restaurantLoading && (
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5">
          {[...Array(15)].map((_, index) => {
            return (
              // multiple skeleton
              <div
                className="p-5 text-center bg-white border rounded-xl shadow-lg border-zinc-300 font-medium"
                key={index}
              >
                {/* single skeleton */}
                <div className="animate-pulse flex flex-col gap-3">
                  <div className="flex justify-between">
                    <div className="w-1/4 h-4 bg-gray-200 rounded-md"></div>
                    <div className="w-1/4 h-4 bg-gray-200 rounded-md"></div>
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded-md"></div>
                  <div className="w-full h-4 bg-gray-200 rounded-md"></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!restaurantLoading && (
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5">
          {restaurantData?.map((restaurant) => {
            return restaurant.tables.map((table) => {
              return (
                <Link
                  key={table.uniqueId}
                  className="relative"
                  to={`/ksr/create-order?tableId=${table.uniqueId}&typeOfSale=dine-in&tableNumber="${table.tableNumber}"`}
                >
                  <div
                    className="px-10 py-10 text-center bg-white border rounded-xl shadow-lg border-zinc-300 font-medium"
                    key={table.uniqueId}
                  >
                    {table.tableNumber === 0
                      ? `N/A`
                      : `Table ${table.tableNumber}`}
                  </div>
                  <Badge
                    variant={
                      table.status === "occupied" ? "destructive" : "default"
                    }
                    className={cn(
                      "absolute top-2 right-2",
                      table.status === "available" &&
                        "bg-green-500 hover:bg-green-600"
                    )}
                  >
                    {table.status}
                  </Badge>
                </Link>
              );
            });
          })}
        </div>
      )}
    </FlexContainer>
  );
};

export default Dashboard;
