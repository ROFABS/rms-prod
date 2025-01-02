import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/consts/app";
import useGet from "@/lib/hooks/use-get";
import { useGlobalContext } from "@/store/GlobalContext";
import { Input, Switch } from "@nextui-org/react";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";

type Channel = Partial<{
  swiggyStatus: boolean;
  swiggyRestaurantId: string;
  zomatoStatus: boolean;
  zomatoRestaurantId: string;
  dunzoStatus: boolean;
  dunzoRestaurantId: string;
  magicPinsStatus: boolean;
  magicPinsRestaurantId: string;
  wynbytesStatus: boolean;
  wynbytesRestaurantId: string;
}>;

const ChannelConfig = () => {
  const { selectedRestaurant } = useGlobalContext();

  const [swiggyInitialValues, setSwiggyInitialValues] = useState<Channel>({
    swiggyStatus: false,
    swiggyRestaurantId: "",
  });

  const [zomatoInitialValues, setZomatoInitialValues] = useState<Channel>({
    zomatoStatus: false,
    zomatoRestaurantId: "",
  });

  const [dunzoInitialValues] = useState<Channel>({
    dunzoStatus: false,
    dunzoRestaurantId: "",
  });

  const [magicPinsInitialValues] = useState<Channel>({
    magicPinsStatus: false,
    magicPinsRestaurantId: "",
  });

  const [wynbytesInitialValues] = useState<Channel>({
    wynbytesStatus: false,
    wynbytesRestaurantId: "",
  });

  const { data, getData, loading, refresh } = useGet<{
    data: Channel;
    message: string;
  }>({ showToast: false });

  const handleUpdateSwiggyChannel = async (values: Channel) => {
    try {
      const res = await fetch(API_URL + "/channels/swiggy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: selectedRestaurant?.uniqueId,
          swiggyStatus: values.swiggyStatus,
          swiggyRestaurantId: values.swiggyRestaurantId,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateZomatoChannel = async (values: Channel) => {
    try {
      const res = await fetch(API_URL + "/channels/zomato", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: selectedRestaurant?.uniqueId,
          zomatoStatus: values.zomatoStatus,
          zomatoRestaurantId: values.zomatoRestaurantId,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedRestaurant) {
      getData(
        `${API_URL}/channels?restaurantId=${selectedRestaurant.uniqueId}`
      );
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    if (data) {
      setSwiggyInitialValues({
        swiggyStatus: data?.data?.swiggyStatus,
        swiggyRestaurantId: data?.data?.swiggyRestaurantId,
      });

      setZomatoInitialValues({
        zomatoStatus: data?.data?.zomatoStatus,
        zomatoRestaurantId: data?.data?.zomatoRestaurantId,
      });
    }
  }, [data]);

  return (
    <FlexContainer variant="column-start" gap="2xl">
      <ActionArea
        heading="Manage"
        subheading="Channels"
        title="Manage your channels"
      />
      <h1 className="text-2xl font-semibold">Channels</h1>

      {/* Swiggy Channel */}
      <div className="p-5 bg-white rounded-xl shadow-md">
        <Formik
          initialValues={swiggyInitialValues}
          onSubmit={handleUpdateSwiggyChannel}
          enableReinitialize={true}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <h3 className="text-lg font-semibold mb-3">Swiggy Channel</h3>
              <div className="grid grid-cols-3 gap-5 items-center">
                <Input
                  name="rid"
                  label="Restaurant ID"
                  labelPlacement="outside"
                  placeholder="Enter Restaurant ID"
                  radius="sm"
                  classNames={{
                    label: "font-medium text-zinc-800",
                    inputWrapper: "border shadow-none",
                  }}
                  value={values.swiggyRestaurantId}
                  onChange={(e) =>
                    setFieldValue("swiggyRestaurantId", e.target.value)
                  }
                />
                <Switch
                  isSelected={values.swiggyStatus}
                  onValueChange={(val) => {
                    setFieldValue("swiggyStatus", val);
                  }}
                >
                  {values.swiggyStatus ? "Active" : "Inactive"}
                </Switch>
              </div>
              <FlexContainer variant="row-end">
                <Button type="submit">Save</Button>
              </FlexContainer>
            </Form>
          )}
        </Formik>
      </div>

      {/* Zomato Channel */}
      <div className="p-5 bg-white rounded-xl shadow-md">
        <Formik
          initialValues={zomatoInitialValues}
          onSubmit={handleUpdateZomatoChannel}
          enableReinitialize={true}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <h3 className="text-lg font-semibold mb-3">Zomato Channel</h3>
              <div className="grid grid-cols-3 gap-5 items-center">
                <Input
                  name="rid"
                  label="Restaurant ID"
                  labelPlacement="outside"
                  placeholder="Enter Restaurant ID"
                  radius="sm"
                  classNames={{
                    label: "font-medium text-zinc-800",
                    inputWrapper: "border shadow-none",
                  }}
                  value={values.zomatoRestaurantId}
                  onChange={(e) =>
                    setFieldValue("zomatoRestaurantId", e.target.value)
                  }
                />
                <Switch
                  isSelected={values.zomatoStatus}
                  onValueChange={(val) => {
                    setFieldValue("zomatoStatus", val);
                  }}
                >
                  {values.zomatoStatus ? "Active" : "Inactive"}
                </Switch>
              </div>
              <FlexContainer variant="row-end">
                <Button type="submit">Save</Button>
              </FlexContainer>
            </Form>
          )}
        </Formik>
      </div>

      {/* Dunzo Channel (Frontend Only) */}
      <div className="p-5 bg-white rounded-xl shadow-md">
        <Formik initialValues={dunzoInitialValues} onSubmit={() => {}}>
          {({ values, setFieldValue }) => (
            <Form>
              <h3 className="text-lg font-semibold mb-3">Dunzo Channel</h3>
              <div className="grid grid-cols-3 gap-5 items-center">
                <Input
                  name="rid"
                  label="Restaurant ID"
                  labelPlacement="outside"
                  placeholder="Enter Restaurant ID"
                  radius="sm"
                  classNames={{
                    label: "font-medium text-zinc-800",
                    inputWrapper: "border shadow-none",
                  }}
                  value={values.dunzoRestaurantId}
                  onChange={(e) =>
                    setFieldValue("dunzoRestaurantId", e.target.value)
                  }
                />
                <Switch
                  isSelected={values.dunzoStatus}
                  onValueChange={(val) => {
                    setFieldValue("dunzoStatus", val);
                  }}
                >
                  {values.dunzoStatus ? "Active" : "Inactive"}
                </Switch>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {/* Magic Pins Channel (Frontend Only) */}
      <div className="p-5 bg-white rounded-xl shadow-md">
        <Formik initialValues={magicPinsInitialValues} onSubmit={() => {}}>
          {({ values, setFieldValue }) => (
            <Form>
              <h3 className="text-lg font-semibold mb-3">Magic Pins Channel</h3>
              <div className="grid grid-cols-3 gap-5 items-center">
                <Input
                  name="rid"
                  label="Restaurant ID"
                  labelPlacement="outside"
                  placeholder="Enter Restaurant ID"
                  radius="sm"
                  classNames={{
                    label: "font-medium text-zinc-800",
                    inputWrapper: "border shadow-none",
                  }}
                  value={values.magicPinsRestaurantId}
                  onChange={(e) =>
                    setFieldValue("magicPinsRestaurantId", e.target.value)
                  }
                />
                <Switch
                  isSelected={values.magicPinsStatus}
                  onValueChange={(val) => {
                    setFieldValue("magicPinsStatus", val);
                  }}
                >
                  {values.magicPinsStatus ? "Active" : "Inactive"}
                </Switch>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {/* Wynbytes Channel (Frontend Only) */}
      <div className="p-5 bg-white rounded-xl shadow-md">
        <Formik initialValues={wynbytesInitialValues} onSubmit={() => {}}>
          {({ values, setFieldValue }) => (
            <Form>
              <h3 className="text-lg font-semibold mb-3">Wynbytes Channel</h3>
              <div className="grid grid-cols-3 gap-5 items-center">
                <Input
                  name="rid"
                  label="Restaurant ID"
                  labelPlacement="outside"
                  placeholder="Enter Restaurant ID"
                  radius="sm"
                  classNames={{
                    label: "font-medium text-zinc-800",
                    inputWrapper: "border shadow-none",
                  }}
                  value={values.wynbytesRestaurantId}
                  onChange={(e) =>
                    setFieldValue("wynbytesRestaurantId", e.target.value)
                  }
                />
                <Switch
                  isSelected={values.wynbytesStatus}
                  onValueChange={(val) => {
                    setFieldValue("wynbytesStatus", val);
                  }}
                >
                  {values.wynbytesStatus ? "Active" : "Inactive"}
                </Switch>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </FlexContainer>
  );
};

export default ChannelConfig;
