import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Tab, TabContainer } from "@/components/layout/Tab";
import { Button } from "@/components/ui/button";
import { API_URL, CHANNELS_API_URL } from "@/lib/consts/app";
import useGet from "@/lib/hooks/use-get";
import { useGlobalContext } from "@/store/GlobalContext";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Channel, MenuItem } from "./types";

const ChannelMenuConfig = () => {
  const { selectedRestaurant } = useGlobalContext();
  const [activeTab, setActiveTab] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  const [swiggyMenu, setSwiggyMenu] = useState<MenuItem[]>([]);
  const [zomatoMenu, setZomatoMenu] = useState<MenuItem[]>([]);

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
      const fetchSwiggyMenu = async () => {
        try {
          const res = await fetch(`${CHANNELS_API_URL}/api/v1/swiggy/menu`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await res.json();
          setSwiggyMenu(data.menuItems);
        } catch (error) {
          console.error(error);
        }
      };
      if (channelData?.data?.swiggyRestaurantId) {
        fetchSwiggyMenu();
      }
    }
    if (activeTab === 2) {
      const fetchZomatoMenu = async () => {
        try {
          const res = await fetch(`${CHANNELS_API_URL}/api/v1/zomato/menu`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await res.json();
          setZomatoMenu(data.menuItems);
        } catch (error) {
          console.error(error);
        }
      };
      if (channelData?.data?.zomatoRestaurantId) {
        fetchZomatoMenu();
      }
    }
  }, [activeTab, channelData]);

  useEffect(() => {
    if (searchParams.get("tab")) {
      setActiveTab(Number(searchParams.get("tab")));
    }
  }, [searchParams]);

  return (
    <FlexContainer variant="column-start" gap="2xl">
      <ActionArea
        heading="Manage"
        subheading="Channels"
        title="Configure your channels' menus"
        showButton
        buttonHref="/channels/config"
        buttonText="Configure Channels"
      />
      <TabContainer>
        <Tab
          title="Swiggy Menu"
          isActiveTab={activeTab === 1}
          onClick={() => {
            setSearchParams({ tab: "1" });
          }}
        />
        <Tab
          title="Zomato Menu"
          isActiveTab={activeTab === 2}
          onClick={() => {
            setSearchParams({ tab: "2" });
          }}
        />
      </TabContainer>

      {activeTab === 1 && (
        <FlexContainer variant="column-start">
          {swiggyMenu.length === 0 ? (
            <div>No Menu Items Available</div>
          ) : (
            swiggyMenu.map((item) => (
              <FlexContainer key={item?.itemId} variant="column-start" gap="md">
                <div>{item?.name}</div>
                <div>Price: ₹{item?.price}</div>
                {item?.imageUrl && (
                  <img
                    src={item?.imageUrl}
                    alt={item?.name}
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                )}
                <Button
                  onClick={() => {
                    // Action to update item in the Swiggy menu, if needed
                  }}
                >
                  Update Item
                </Button>
              </FlexContainer>
            ))
          )}
        </FlexContainer>
      )}

      {activeTab === 2 && (
        <FlexContainer variant="column-start">
          {zomatoMenu.length === 0 ? (
            <div>No Menu Items Available</div>
          ) : (
            zomatoMenu.map((item) => (
              <FlexContainer key={item?.itemId} variant="column-start" gap="md">
                <div>{item?.name}</div>
                <div>Price: ₹{item?.price}</div>
                {item?.imageUrl && (
                  <img
                    src={item?.imageUrl}
                    alt={item?.name}
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                )}
                <Button
                  onClick={() => {
                    // Action to update item in the Zomato menu, if needed
                  }}
                >
                  Update Item
                </Button>
              </FlexContainer>
            ))
          )}
        </FlexContainer>
      )}
    </FlexContainer>
  );
};

export default ChannelMenuConfig;
