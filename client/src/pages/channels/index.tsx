import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Tab, TabContainer } from "@/components/layout/Tab";
import { Button } from "@/components/ui/button";
import { API_URL, CHANNELS_API_URL } from "@/lib/consts/app";
import useGet from "@/lib/hooks/use-get";
import { useGlobalContext } from "@/store/GlobalContext";
import { useEffect, useLayoutEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Channel, OrderResponse } from "./types";

const Channels = () => {
  const { selectedRestaurant } = useGlobalContext();
  const [activeTab, setActiveTab] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  const [swiggyOrders, setSwiggyOrders] = useState<OrderResponse>();
  const [zomatoOrders, setZomatoOrders] = useState<OrderResponse>();

  const {
    data: channelData,
    getData,
    loading,
    refresh,
  } = useGet<{
    data: Channel;
    message: string;
  }>({ showToast: false });

  useEffect(() => {
    if (selectedRestaurant) {
      getData(
        `${API_URL}/channels?restaurantId=${selectedRestaurant.uniqueId}`
      );
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    if (activeTab === 1) {
      const fetchSwiggyOrders = async () => {
        try {
          const res = await fetch(`${CHANNELS_API_URL}/api/v1/swiggy/orders`, {
            
            method: "GET",
            headers: {
               'ngrok-skip-browser-warning': 'true',
              "Content-Type": "application/json",
            },
          });
          const data = await res.json();
          setSwiggyOrders(data);
        } catch (error) {
          console.error(error);
        }
      };
      if (channelData?.data?.swiggyRestaurantId) {
        fetchSwiggyOrders();
      }
    }
    if (activeTab === 2) {
      const fetchZomatoOrders = async () => {
        try {
          const res = await fetch(`${CHANNELS_API_URL}/api/v1/zomato/orders`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await res.json();
          setZomatoOrders(data);
        } catch (error) {
          console.error(error);
        }
      };
      if (channelData?.data?.zomatoRestaurantId) {
        fetchZomatoOrders();
      }
    }
  }, [activeTab, channelData]);

  useLayoutEffect(() => {
    if (searchParams.get("tab")) {
      setActiveTab(Number(searchParams.get("tab")));
    }
  }, [searchParams]);
  return (
    <FlexContainer variant="column-start" gap="2xl">
      <ActionArea
        heading="Manage"
        subheading="Channels"
        title="Manage your channels"
        showButton
        buttonHref="/channels/config"
        buttonText="Configure Channels"
      />
      <TabContainer>
        <Tab
          title="Swiggy Orders"
          isActiveTab={activeTab === 1}
          onClick={() => {
            setSearchParams({ tab: "1" });
          }}
        />
        <Tab
          title="Zomato Orders"
          isActiveTab={activeTab === 2}
          onClick={() => {
            setSearchParams({ tab: "2" });
          }}
        />
      </TabContainer>
      {activeTab === 1 && (
        <FlexContainer variant="column-start">
          {swiggyOrders?.restaurantData?.[0]?.orders?.length === 0 ? (
            <div>No Orders</div>
          ) : null}
          {swiggyOrders?.restaurantData.map((order) => (
            <FlexContainer key={order?.restaurantId} variant="column-start">
              {order?.orders.map((obj) => (
                <FlexContainer key={obj?.order_id} variant="column-start">
                  <div>{obj?.order_id}</div>
                  <div>Customer Name: {obj?.customer?.customer_name}</div>
                  {obj?.cart?.items?.map((item) => (
                    <FlexContainer key={item?.item_id} variant="column-start">
                      <div>Name: {item?.name}</div>
                      <div>Quantity: {item?.quantity}</div>
                    </FlexContainer>
                  ))}
                  <div>Order Total: {obj?.bill}</div>
                  <Button
                    onClick={() => {
                      fetch(
                        `${CHANNELS_API_URL}/api/v1/swiggy/orders/accept?order_id=${obj?.order_id}`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                        }
                      );
                    }}
                  >
                    Accept
                  </Button>
                </FlexContainer>
              ))}
            </FlexContainer>
          ))}
        </FlexContainer>
      )}
      {activeTab === 2 && (
        <FlexContainer variant="column-start">
          {zomatoOrders?.restaurantData?.[0]?.orders?.length === 0 ? (
            <div>No Orders</div>
          ) : null}
          {zomatoOrders?.restaurantData.map((order) => (
            <FlexContainer key={order?.restaurantId} variant="column-start">
              {order?.orders.map((obj) => (
                <FlexContainer key={obj?.order_id} variant="column-start">
                  <div>{obj?.order_id}</div>
                  <div>Customer Name: {obj?.customer?.customer_name}</div>
                  {obj?.cart?.items?.map((item) => (
                    <FlexContainer key={item?.item_id} variant="column-start">
                      <div>Name: {item?.name}</div>
                      <div>Quantity: {item?.quantity}</div>
                    </FlexContainer>
                  ))}
                  <div>Order Total: {obj?.bill}</div>
                  <Button
                    onClick={() => {
                      fetch(
                        `${CHANNELS_API_URL}/api/v1/zomato/orders/accept?order_id=${obj?.order_id}`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                        }
                      );
                    }}
                  >
                    Accept
                  </Button>
                </FlexContainer>
              ))}
            </FlexContainer>
          ))}
        </FlexContainer>
      )}
    </FlexContainer>
  );
};
export default Channels;
