import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Button } from "@/components/ui/button";
import { API_TAGS } from "@/lib/consts/API_TAGS";
import { API_URL } from "@/lib/consts/app";
import useGet from "@/lib/hooks/use-get";
import { useGlobalContext } from "@/store/GlobalContext";
import { Checkbox, Input, Select, SelectItem } from "@nextui-org/react";
import axios from "axios";
import { FieldArray, Form, Formik, FormikProps } from "formik";
import { Trash } from "lucide-react";
import React, { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { MainCategory, SubCategory } from "../categories/types";

interface Item {
  category: string;
  mainCategory: string;
  productName: string;
  isActive: boolean;
}

interface FormValues {
  items: Item[];
}

interface FormErrors {
  items?: Array<{
    category?: string;
    mainCategory?: string;
    productName?: string;
    isActive?: boolean;
  }>;
}
const CreateMarketItems = () => {
  const { selectedRestaurant } = useGlobalContext();
  const [selectedSubCategory, setSelectedSubCategory] = useState<
    SubCategory[] | undefined
  >([]);
  const initialValuesItems: FormValues = {
    items: [
      {
        category: "",
        mainCategory: "",
        productName: "",
        isActive: true,
      },
    ],
  };

  const {
    data: mainCategoryData,
    error: mainCategoryError,
    loading: mainCategoryLoading,
    invalidateCache,
    refresh,
    getData: getMainCategoryData,
  } = useGet<MainCategory[]>({ showToast: false });

  const handleAddItems = async (values: FormValues) => {
    console.log(values, "values");
    // return;
    const items = values.items.map((item) => {
      return {
        subCategory: item.category,
        mainCategory: item.mainCategory,
        productName: item.productName,
        status: item.isActive,
      };
    });
    try {
      const res = await axios.post(
        `${API_URL}/createMarketItems?restaurantId=${selectedRestaurant?.uniqueId}`,
        items
      );
      const { data } = res;
      console.log(data, "created items");
      toast.success("Items created successfully");
      refresh(API_TAGS.GET_MARKETPLACE_ITEMS, {}, false);
      refresh(API_TAGS.GET_MARKETPLACE_ITEMS_BY_MAIN_CATEGORY, {}, false);
    } catch (error) {
      const err = error as Error & { response: { data: { error: string } } };
      toast.error(err.response.data.error || "An error occurred");
    }
    // resetForm();
  };

  useEffect(() => {
    if (selectedRestaurant?.uniqueId) {
      getMainCategoryData(
        `${API_URL}/getMainCategories?includeSubCategories=true&restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_MAIN_CATEGORY_SUB_CATEGORY
      );
      if (mainCategoryData?.length) {
        const subCategories = mainCategoryData
          ?.map((category) => category.subCategories)
          .flat();
        setSelectedSubCategory(
          subCategories?.filter(
            (subCategory): subCategory is SubCategory =>
              subCategory !== undefined
          )
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant]);

  return (
    <FlexContainer variant="column-start" gap="xl">
      <ActionArea
        heading={"Items"}
        subheading={"Create"}
        title={"Create Items"}
      />
      <FlexContainer variant="column-start" gap="xl">
        <h3 className="text-2xl font-semibold text-zinc-900">Add Items</h3>
        <Formik
          initialValues={initialValuesItems}
          validationSchema={Yup.object().shape({
            items: Yup.array().of(
              Yup.object().shape({
                category: Yup.string().required("Category is required"),
                mainCategory: Yup.string().required(
                  "Main Category is required"
                ),
                productName: Yup.string().required("Product Name is required"),
              })
            ),
          })}
          onSubmit={handleAddItems}
        >
          {({
            isSubmitting,
            values,
            touched,
            errors,
            setFieldValue,
            handleBlur,
            resetForm,
          }: FormikProps<FormValues>) => {
            return (
              <Form>
                <FlexContainer variant="column-start">
                  <FieldArray
                    name="items"
                    render={(arrayHelpers) => (
                      <Fragment>
                        {values?.items?.length > 0 &&
                          values.items.map((item, index) => (
                            <Fragment key={index}>
                              <h3 className="text-xl font-semibold text-indigo-600">
                                Item {index + 1}
                              </h3>
                              <div
                                key={index}
                                className="grid grid-cols-3 gap-5 lg:grid-cols-4"
                              >
                                <Select
                                  label="Main Category"
                                  labelPlacement="outside"
                                  name={`items.${index}.mainCategory`}
                                  placeholder="Select Main Category"
                                  radius="sm"
                                  classNames={{
                                    label: "font-medium text-zinc-900",
                                    trigger: "border shadow-none",
                                  }}
                                  isLoading={mainCategoryLoading}
                                  items={mainCategoryData || []}
                                  onChange={(e) => {
                                    setFieldValue(
                                      `items.${index}.mainCategory`,
                                      e.target.value
                                    );

                                    const category = mainCategoryData?.find(
                                      (category) =>
                                        category?.uniqueId === e.target?.value
                                    );
                                    setSelectedSubCategory(
                                      category?.subCategories
                                    );
                                  }}
                                  isInvalid={
                                    !!(
                                      errors.items &&
                                      typeof errors.items[index] !== "string" &&
                                      errors.items[index]?.mainCategory
                                    )
                                  }
                                  color={
                                    errors.items &&
                                    typeof errors.items[index] !== "string" &&
                                    errors.items[index]?.mainCategory
                                      ? "danger"
                                      : "default"
                                  }
                                  errorMessage={
                                    errors.items &&
                                    typeof errors.items[index] !== "string" &&
                                    errors.items[index]?.mainCategory
                                  }
                                >
                                  {(category) => (
                                    <SelectItem key={category?.uniqueId}>
                                      {category?.name}
                                    </SelectItem>
                                  )}
                                </Select>
                                <Select
                                  label="Select Category"
                                  labelPlacement="outside"
                                  name={`items.${index}.category`}
                                  placeholder="Select Category"
                                  radius="sm"
                                  classNames={{
                                    label: "font-medium text-zinc-900",
                                    trigger: "border shadow-none",
                                  }}
                                  isLoading={mainCategoryLoading}
                                  items={selectedSubCategory || []}
                                  selectedKeys={
                                    values.items[index].category
                                      ? [values.items[index].category]
                                      : []
                                  }
                                  onChange={(e) => {
                                    setFieldValue(
                                      `items.${index}.category`,
                                      e.target.value
                                    );
                                  }}
                                  isInvalid={
                                    !!(
                                      errors.items &&
                                      typeof errors.items[index] !== "string" &&
                                      errors.items[index]?.category
                                    )
                                  }
                                  color={
                                    errors.items &&
                                    typeof errors.items[index] !== "string" &&
                                    errors.items[index]?.category
                                      ? "danger"
                                      : "default"
                                  }
                                  errorMessage={
                                    errors.items &&
                                    typeof errors.items[index] !== "string" &&
                                    errors.items[index]?.category
                                  }
                                >
                                  {(category) => (
                                    <SelectItem key={category?.uniqueId}>
                                      {category?.name}
                                    </SelectItem>
                                  )}
                                </Select>

                                <Input
                                  label="Product Name"
                                  labelPlacement="outside"
                                  name={`items.${index}.productName`}
                                  placeholder="Enter Product Name"
                                  radius="sm"
                                  classNames={{
                                    label: "font-medium text-zinc-900",
                                    inputWrapper: "border shadow-none",
                                  }}
                                  onChange={(e) => {
                                    setFieldValue(
                                      `items.${index}.productName`,
                                      e.target.value
                                    );
                                  }}
                                  isInvalid={
                                    !!(
                                      errors.items &&
                                      typeof errors.items[index] !== "string" &&
                                      errors.items[index]?.productName
                                    )
                                  }
                                  color={
                                    errors.items &&
                                    typeof errors.items[index] !== "string" &&
                                    errors.items[index]?.productName
                                      ? "danger"
                                      : "default"
                                  }
                                  errorMessage={
                                    errors.items &&
                                    typeof errors.items[index] !== "string" &&
                                    errors.items[index]?.productName
                                  }
                                />
                                <FlexContainer
                                  variant="row-start"
                                  className={"items-center"}
                                  gap="lg"
                                >
                                  <Checkbox
                                    isSelected={values.items[index].isActive}
                                    onValueChange={(value) =>
                                      setFieldValue(
                                        `items.${index}.isActive`,
                                        value
                                      )
                                    }
                                  >
                                    is Active
                                  </Checkbox>
                                  <Button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      arrayHelpers.remove(index);
                                    }}
                                    size={"icon"}
                                  >
                                    <Trash className="w-4 h-4" />
                                  </Button>
                                </FlexContainer>
                              </div>
                            </Fragment>
                          ))}
                        <FlexContainer
                          variant="row-end"
                          className="items-center p-5"
                        >
                          <Button
                            size={"sm"}
                            onClick={(e) => {
                              e.preventDefault();
                              arrayHelpers.push({
                                category: "",
                                mainCategory: "",
                                productName: "",
                                measurementUnit: "",
                                unit: "",
                                isActive: true,
                              });
                            }}
                          >
                            Add Item
                          </Button>
                        </FlexContainer>
                      </Fragment>
                    )}
                  />

                  <FlexContainer variant="row-end" className="items-center p-5">
                    <Button type="submit">Save Items</Button>
                  </FlexContainer>
                </FlexContainer>
              </Form>
            );
          }}
        </Formik>
      </FlexContainer>
    </FlexContainer>
  );
};

export default CreateMarketItems;
