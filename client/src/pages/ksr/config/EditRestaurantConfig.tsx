import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Button } from "@/components/ui/button";
import { API_TAGS } from "@/lib/consts/API_TAGS";
import { API_URL } from "@/lib/consts/app";
import useGet from "@/lib/hooks/use-get";
import { useGlobalContext } from "@/store/GlobalContext";
import { Input } from "@nextui-org/react";
import axios from "axios";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { Restaurant } from "./types";

const EditRestaurantConfig = () => {
  const { id } = useParams<{ id: string }>();
  const { selectedRestaurant } = useGlobalContext();
  const [initialValues, setInitialValues] = useState<{
    restaurantName: string;
    restaurantType: string;
    totalNoOfTables: number;
  }>({
    restaurantName: "",
    restaurantType: "",
    totalNoOfTables: 0,
  });
  const {
    data: restaurantData,
    loading: restaurantLoading,
    refresh,
    getData: getRestaurantData,
  } = useGet<Restaurant[]>({ showToast: false });

  const handleSubmit = async (
    values: any,
    actions: {
      setSubmitting: (value: boolean) => void;
    }
  ) => {
    if (values.totalNoOfTables < 0) {
      toast.error("Total number of tables cannot be less than 0");
      return;
    }
    if (values.totalNoOfTables === 0) {
      toast.error("Total number of tables cannot be 0");
      return;
    }

    if (values.totalNoOfTables > 100) {
      toast.error("Total number of tables cannot be more than 100");
      return;
    }

    if (values.totalNoOfTables % 1 !== 0) {
      toast.error("Total number of tables cannot be a decimal number");
      return;
    }

    if (values.totalNoOfTables === initialValues.totalNoOfTables) {
      toast.error(
        "Please update the total number of tables to update the restaurant"
      );
      return;
    }

    actions.setSubmitting(true);
    try {
      const data = {
        totalNoOfTables: values.totalNoOfTables,
      };
      const res = await axios.put(`${API_URL}/ksr/restaurants`, {
        uniqueId: id,
        noOfTables: values.totalNoOfTables,
      });
      const json = res.data;
      refresh(API_TAGS.GET_RESTAURANTS, {}, false);
      toast.success("Restaurant updated successfully");
    } catch (error) {
      console.error(error);
      const message = error as Error & {
        response: { data: { message: string } };
      };
      toast.error(message.response?.data.message || "Something went wrong");
    } finally {
      actions.setSubmitting(false);
    }
  };

  useEffect(() => {
    if (selectedRestaurant && id) {
      getRestaurantData(
        `${API_URL}/ksr/restaurants?&uniqueId=${selectedRestaurant?.uniqueId}&includeTables=true`,
        API_TAGS.GET_RESTAURANTS
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant, id]);

  useEffect(() => {
    if (restaurantData) {
      setInitialValues({
        restaurantName: restaurantData[0].restaurantName,
        restaurantType: restaurantData[0].restaurantType,
        totalNoOfTables: restaurantData[0].tables.length,
      });
    }
  }, [restaurantData]);

  return (
    <FlexContainer variant="column-start" gap="xl">
      <ActionArea
        heading="Restaurant"
        subheading="Edit"
        title="Edit Restaurant"
      />
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, handleBlur, isSubmitting }) => {
          return (
            <Form className="p-5 bg-white border rounded-xl">
              <FlexContainer variant="column-start" gap="lg">
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    name="restaurantName"
                    label="Restaurant Name"
                    placeholder="Enter Restaurant Name"
                    labelPlacement="outside"
                    radius="sm"
                    classNames={{
                      label: "font-medium text-zinc-800",
                      inputWrapper: "border shadow-none",
                    }}
                    value={values.restaurantName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled
                  />
                  <Input
                    name="restaurantType"
                    label="Restaurant Type"
                    placeholder="Enter Restaurant Type"
                    labelPlacement="outside"
                    radius="sm"
                    classNames={{
                      label: "font-medium text-zinc-800",
                      inputWrapper: "border shadow-none",
                    }}
                    value={values.restaurantType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled
                  />

                  <Input
                    type="number"
                    name="totalNoOfTables"
                    label="Total Number of Tables"
                    placeholder="Enter Total Number of Tables"
                    labelPlacement="outside"
                    radius="sm"
                    classNames={{
                      label: "font-medium text-zinc-800",
                      inputWrapper: "border shadow-none",
                    }}
                    value={`${values.totalNoOfTables}`}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                <FlexContainer variant="row-end" gap="md">
                  <Button type="submit" isLoading={isSubmitting}>
                    Update Restauraunt
                  </Button>
                </FlexContainer>
              </FlexContainer>
            </Form>
          );
        }}
      </Formik>
    </FlexContainer>
  );
};

export default EditRestaurantConfig;
