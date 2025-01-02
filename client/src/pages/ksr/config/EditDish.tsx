import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Button } from "@/components/ui/button";
import { API_TAGS } from "@/lib/consts/API_TAGS";
import { API_URL } from "@/lib/consts/app";
import useGet from "@/lib/hooks/use-get";
import { useGlobalContext } from "@/store/GlobalContext";
import { Checkbox, Input, Select, SelectItem } from "@nextui-org/react";
import axios from "axios";
import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { KsrCategoryItem, KsrMainCategory } from "../types";

const EditDish = () => {
  const { property, selectedRestaurant } = useGlobalContext();

  const { id } = useParams<{ id: string }>();

  const {
    data: categoryData,
    error: categoryError,
    loading: categoryLoading,
    invalidateCache: invalidateCategoryCache,
    refresh,
    getData: getCategoryData,
  } = useGet<KsrMainCategory[]>({ showToast: false });

  const {
    data: dishData,
    error: dishError,
    loading: dishLoading,
    getData: getDishData,
    // refresh: refreshDishData,
  } = useGet<KsrCategoryItem[]>({ showToast: false });

  const [initialValuesDish, setInitialValuesDish] = useState({
    productName: "",
    dishMainCategoryUniqueId: "",
    quantity: "",
    price: "",
    status: false,
  });

  const handleSubmitDish = async (values: any) => {
    if (!selectedRestaurant?.uniqueId) {
      return toast.error("Property not found");
    }

    if (!id) {
      return toast.error("Dish not found");
    }

    try {
      const response = await axios.put(
        `${API_URL}/ksr/updateDishInventory?restaurantId=${selectedRestaurant?.uniqueId}&uniqueId=${id}`,
        {
          ...values,
          status: values.status?.toString(),
          restaurantId: selectedRestaurant?.uniqueId,
        }
      );
      toast.success(response?.data?.message || "Dish Created Successfully");
      refresh(API_TAGS.GET_KSR_INVENTORY, {}, false);
    } catch (error) {
      const err = error as Error & { response: { data: { error: string } } };
      toast.error(err.response.data.error || "Something went wrong");
    }
  };

  useEffect(() => {
    if (selectedRestaurant?.uniqueId) {
      getCategoryData(
        `${API_URL}/ksr/getDishMainCategories?restaurantId=${selectedRestaurant.uniqueId}`,
        API_TAGS.GET_DISH_MAIN_CATEGORY
      );
      if (id) {
        getDishData(
          `${API_URL}/ksr/inventory?restaurantId=${selectedRestaurant.uniqueId}&uniqueId=${id}`,
          API_TAGS.GET_KSR_INVENTORY
        );
      }
    }
  }, [selectedRestaurant, id]);

  useEffect(() => {
    if (dishData) {
      setInitialValuesDish({
        productName: dishData?.[0]?.productName,
        dishMainCategoryUniqueId: dishData?.[0]?.dishMainCategory,
        price: dishData?.[0]?.price?.toString(),
        quantity: dishData?.[0]?.quantity?.toString(),
        status: dishData?.[0]?.status === "true" ? true : false,
      });
    }
  }, [dishData]);

  return (
    <FlexContainer variant="column-start" gap="xl" className={"h-full"}>
      <ActionArea heading={"Config"} subheading={"Dish"} title={"Edit Dish"} />
      <Formik
        initialValues={initialValuesDish}
        onSubmit={handleSubmitDish}
        enableReinitialize
      >
        {({ values, handleChange, errors, touched, setFieldValue }) => {
          return (
            <Form>
              <FlexContainer variant="column-start" gap="xl">
                <div className="grid grid-cols-3 gap-3">
                  <Select
                    name="dishMainCategoryUniqueId"
                    label="Select Category"
                    labelPlacement="outside"
                    placeholder="Select Category"
                    radius="sm"
                    classNames={{
                      label: "font-medium text-zinc-900",
                      trigger: "border shadow-none",
                    }}
                    items={categoryData || []}
                    selectedKeys={
                      values.dishMainCategoryUniqueId
                        ? [values.dishMainCategoryUniqueId]
                        : ""
                    }
                    onChange={(e) => {
                      setFieldValue(
                        "dishMainCategoryUniqueId",
                        e?.target.value
                      );
                    }}
                    disabled
                  >
                    {(product) => (
                      <SelectItem key={product?.uniqueId}>
                        {product?.name}
                      </SelectItem>
                    )}
                  </Select>
                  <Input
                    label="Product Name"
                    labelPlacement="outside"
                    placeholder="Enter Product Name"
                    name="productName"
                    radius="sm"
                    classNames={{
                      label: "font-medium text-zinc-800",
                      inputWrapper: "border shadow-none",
                    }}
                    value={values.productName}
                    onChange={handleChange}
                    disabled
                  />

                  <Input
                    label="Quantity"
                    labelPlacement="outside"
                    placeholder="Enter Quantity"
                    name="quantity"
                    radius="sm"
                    classNames={{
                      label: "font-medium text-zinc-800",
                      inputWrapper: "border shadow-none",
                    }}
                    value={values.quantity}
                    onChange={handleChange}
                  />
                  <Input
                    label="Price"
                    labelPlacement="outside"
                    placeholder="Enter Price"
                    name="price"
                    radius="sm"
                    classNames={{
                      label: "font-medium text-zinc-800",
                      inputWrapper: "border shadow-none",
                    }}
                    value={values.price}
                    onChange={handleChange}
                  />
                  <Checkbox
                    isSelected={values.status}
                    onValueChange={(val) => {
                      setFieldValue("status", val);
                    }}
                  >
                    <span className="text-sm font-medium text-zinc-800">
                      Is Active
                    </span>
                  </Checkbox>
                </div>
                <FlexContainer variant="row-end">
                  <Button variant="default" type="submit">
                    Update Dish
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

export default EditDish;
