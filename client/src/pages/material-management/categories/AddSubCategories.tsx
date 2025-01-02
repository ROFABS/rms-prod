import { Checkbox, Input, Select, SelectItem } from "@nextui-org/react";
import axios from "axios";
import { Form, Formik } from "formik";
import { useEffect } from "react";
import * as Yup from "yup";
import ActionArea from "../../../components/layout/ActionArea";
import FlexContainer from "../../../components/layout/FlexContainer";

import { Button } from "@/components/ui/button";
import { useGlobalContext } from "@/store/GlobalContext";
import toast from "react-hot-toast";
import { API_TAGS } from "../../../lib/consts/API_TAGS";
import useGet from "../../../lib/hooks/use-get";
import { MainCategory } from "./types";

const API_URL = import.meta.env.VITE_APP_API_URL;

const AddSubCategories = () => {
  const { selectedRestaurant } = useGlobalContext();

  const {
    data: mainCategoryData,
    error: mainCategoryError,
    loading: mainCategoryLoading,
    invalidateCache,
    refresh,
    getData: getMainCategoryData,
  } = useGet<MainCategory[]>({ showToast: false });

  const handleAddSubCategory = async (values: any) => {
    if (!selectedRestaurant?.uniqueId) {
      toast.error("Property not found");
      return;
    }

    try {
      console.log(values);
      const res = await axios.post(`${API_URL}/createSubCategories`, {
        name: values.category,
        mainCategoryId: values.mainCategory,
        restaurantId: selectedRestaurant?.uniqueId,
      });
      const { data } = await res.data;
      refresh(API_TAGS.GET_SUB_CATEGORY, {}, false);
      refresh(API_TAGS.GET_MAIN_CATEGORY_SUB_CATEGORY, {}, false);
      toast.success("Sub Category added successfully");
    } catch (error) {
      const err = error as Error & {
        response: { data: { message: string; error: string } };
      };
      toast.error(err?.response?.data?.error || "An error occurred");
    }
  };

  useEffect(() => {
    if (selectedRestaurant?.uniqueId) {
      getMainCategoryData(
        `${API_URL}/getMainCategories?restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_MAIN_CATEGORY
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant]);
  return (
    <FlexContainer variant="column-start">
      <ActionArea
        heading={"Sub Categories"}
        subheading={"Material Management"}
        title={"Add Sub Categories"}
      />

      <Formik
        initialValues={{
          category: "",
          mainCategory: "",
        }}
        validationSchema={Yup.object().shape({
          category: Yup.string().required("Category Name is required"),
          mainCategory: Yup.string().required("Main Category is required"),
        })}
        onSubmit={handleAddSubCategory}
      >
        {({
          values,
          handleChange,
          handleBlur,
          touched,
          errors,
          setFieldValue,
        }) => {
          return (
            <Form>
              <FlexContainer variant="column-start" gap="xl">
                <div className="grid grid-cols-3 gap-5 items-center">
                  <Select
                    label="Main Category"
                    labelPlacement="outside"
                    name="mainCategory"
                    placeholder="Select Main Category"
                    radius="sm"
                    classNames={{
                      label: "font-medium text-zinc-900",
                      trigger: "border shadow-none",
                    }}
                    items={mainCategoryData || []}
                    onChange={(e) => {
                      setFieldValue("mainCategory", e.target.value);
                    }}
                    selectedKeys={
                      values.mainCategory ? [values.mainCategory] : []
                    }
                    isInvalid={!!(errors.mainCategory && touched.mainCategory)}
                    color={
                      errors.mainCategory && touched.mainCategory
                        ? "danger"
                        : "default"
                    }
                    errorMessage={errors.mainCategory && touched.mainCategory}
                  >
                    {(item) => (
                      <SelectItem key={item?.uniqueId}>{item?.name}</SelectItem>
                    )}
                  </Select>
                  <Input
                    type="text"
                    name="category"
                    label="Category Name"
                    placeholder="Enter Category Name"
                    labelPlacement="outside"
                    radius="sm"
                    classNames={{
                      label: "font-medium text-zinc-900",
                      inputWrapper: "border shadow-none",
                    }}
                    value={values.category}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={!!(touched.category && errors.category)}
                    color={
                      touched.category && errors.category ? "danger" : "default"
                    }
                    errorMessage={errors.category}
                  />
                </div>
                <FlexContainer variant="row-start" gap="sm">
                  <Button variant="default" type="submit">
                    Create Category
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

export default AddSubCategories;
