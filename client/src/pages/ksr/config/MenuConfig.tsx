import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Tab, TabContainer } from "@/components/layout/Tab";
import { Button } from "@/components/ui/button";
import { API_TAGS } from "@/lib/consts/API_TAGS";
import { API_URL } from "@/lib/consts/app";
import useGet from "@/lib/hooks/use-get";
import { useGlobalContext } from "@/store/GlobalContext";
import {
  Checkbox,
  Input,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import axios from "axios";
import { Form, Formik } from "formik";
import { Pencil, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { KsrCategoryItem, KsrMainCategory } from "../types";

const MenuConfig = () => {
  const { property, selectedRestaurant } = useGlobalContext();

  const [activeTab, setActiveTab] = useState(1);
  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const [initialValuesCategory, setInitialValuesCategory] = useState({
    name: "",
    status: true,
  });

  const [initialValuesDish, setInitialValuesDish] = useState({
    productName: "",
    dishMainCategoryUniqueId: "",
    price: "",
  });

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
    refresh: refreshDishData,
  } = useGet<KsrCategoryItem[]>({ showToast: false });

  useEffect(() => {
    if (selectedRestaurant?.uniqueId) {
      getCategoryData(
        `${API_URL}/ksr/getDishMainCategories?restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_DISH_MAIN_CATEGORY
      );
      getDishData(
        `${API_URL}/ksr/inventory?restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_KSR_INVENTORY
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedRestaurant]);

  const handleSubmitCategory = async (values: any) => {
    try {
      const response = await axios.post(
        `${API_URL}/ksr/createDishMainCategory`,
        {
          ...values,
          restaurantId: selectedRestaurant?.uniqueId,
        }
      );
      toast.success(response?.data?.message || "Category Created Successfully");
      refresh(API_TAGS.GET_DISH_MAIN_CATEGORY, {}, false);
    } catch (error) {
      const err = error as Error & { response: { data: { error: string } } };
      toast.error(err.response.data.error || "Something went wrong");
    }
  };

  const handleSubmitDish = async (values: any) => {
    try {
      const response = await axios.post(`${API_URL}/ksr/createDishInventory`, {
        ...values,
        restaurantId: selectedRestaurant?.uniqueId,
      });
      toast.success(response?.data?.message || "Dish Created Successfully");
      refresh(API_TAGS.GET_KSR_INVENTORY, {}, false);
    } catch (error) {
      const err = error as Error & { response: { data: { error: string } } };
      toast.error(err.response.data.error || "Something went wrong");
    }
  };

  return (
    <FlexContainer variant="column-start" gap="xl" className={"h-full"}>
      <ActionArea
        heading={"Config"}
        subheading={"Menus"}
        title={"Manage Menu Items"}
      />
      <TabContainer>
        <Tab
          title="Category List"
          isActiveTab={activeTab === 1}
          onClick={() => handleTabClick(1)}
        />
        <Tab
          title="Dish List"
          isActiveTab={activeTab === 2}
          onClick={() => handleTabClick(2)}
        />
        <Tab
          title="Create Category"
          isActiveTab={activeTab === 3}
          onClick={() => handleTabClick(3)}
        />
        <Tab
          title="Create Dish"
          isActiveTab={activeTab === 4}
          onClick={() => handleTabClick(4)}
        />
      </TabContainer>
      {activeTab === 1 && (
        <FlexContainer variant="column-start">
          <Table aria-label="Category List">
            <TableHeader>
              <TableColumn>S No.</TableColumn>
              <TableColumn>Category Name</TableColumn>
              <TableColumn>Status</TableColumn>
              <TableColumn> </TableColumn>
            </TableHeader>
            <TableBody>
              {!categoryLoading && categoryData?.length
                ? categoryData?.map((category, index) => (
                    <TableRow key={category?.uniqueId}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{category?.name}</TableCell>
                      <TableCell>
                        {category?.status ? "Active" : "Inactive"}
                      </TableCell>
                      <TableCell>
                        <FlexContainer>
                          <Button
                            onClick={async () => {
                              try {
                                const res = await axios.delete(
                                  `${API_URL}/ksr/deleteDishMainCategory?uniqueId=${category?.uniqueId}`
                                );
                                toast.success(
                                  res.data?.message ||
                                    "Category deleted successfully"
                                );
                                refresh(
                                  API_TAGS.GET_DISH_MAIN_CATEGORY,
                                  {},
                                  true
                                );
                              } catch (error) {
                                const err = error as Error & {
                                  response: { data: { error: string } };
                                };
                                toast.error(
                                  err?.response?.data?.error ||
                                    "Something went wrong"
                                );
                              }
                            }}
                            variant={"destructive"}
                            size={"icon"}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </FlexContainer>
                      </TableCell>
                    </TableRow>
                  ))
                : []}
            </TableBody>
          </Table>
        </FlexContainer>
      )}
      {activeTab === 2 && (
        <FlexContainer variant="column-start">
          <Table aria-label="Dish List">
            <TableHeader>
              <TableColumn>S No.</TableColumn>
              <TableColumn>Product Name</TableColumn>
              <TableColumn>Category</TableColumn>
              <TableColumn>Price</TableColumn>
              <TableColumn> </TableColumn>
            </TableHeader>
            <TableBody>
              {!dishLoading && dishData?.length
                ? dishData?.map((dish, index) => (
                    <TableRow key={dish?.uniqueId}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{dish?.productName}</TableCell>
                      <TableCell>{dish?.dishMainCategoryName}</TableCell>
                      <TableCell>{dish?.price}</TableCell>
                      <TableCell>
                        <FlexContainer>
                          <Button
                            onClick={async () => {
                              try {
                                const res = await axios.delete(
                                  `${API_URL}/ksr/deleteDishInventory?uniqueId=${dish?.uniqueId}`
                                );
                                toast.success(
                                  res.data?.message ||
                                    "Dish deleted successfully"
                                );
                                refreshDishData(
                                  API_TAGS.GET_KSR_INVENTORY,
                                  {},
                                  true
                                );
                                refresh(
                                  API_TAGS.GET_DISH_MAIN_CATEGORY,
                                  {},
                                  false
                                );
                              } catch (error) {
                                const err = error as Error & {
                                  response: { data: { error: string } };
                                };
                                toast.error(
                                  err?.response?.data?.error ||
                                    "Something went wrong"
                                );
                              }
                            }}
                            variant={"destructive"}
                            size={"icon"}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                          <Link
                            to={`/ksr/settings/menu/dish/${dish?.uniqueId}`}
                          >
                            <Button variant={"outline"} size={"icon"}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </Link>
                        </FlexContainer>
                      </TableCell>
                    </TableRow>
                  ))
                : []}
            </TableBody>
          </Table>
        </FlexContainer>
      )}
      {activeTab === 3 && (
        <Formik
          initialValues={initialValuesCategory}
          onSubmit={handleSubmitCategory}
        >
          {({ values, handleChange, errors, touched, setFieldValue }) => {
            return (
              <Form>
                <FlexContainer variant="column-start" gap="xl">
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label="Category Name"
                      labelPlacement="outside"
                      placeholder="Enter Category Name"
                      name="name"
                      radius="sm"
                      classNames={{
                        label: "font-medium text-zinc-800",
                        inputWrapper: "border shadow-none",
                      }}
                      value={values.name}
                      onChange={handleChange}
                    />
                    <Checkbox
                      name="status"
                      isSelected={values.status}
                      onValueChange={(val) => {
                        setFieldValue("status", val);
                      }}
                    >
                      Status
                    </Checkbox>
                  </div>
                  <FlexContainer variant="row-end">
                    <Button variant="default" type="submit">
                      Create Category
                    </Button>
                  </FlexContainer>
                </FlexContainer>
              </Form>
            );
          }}
        </Formik>
      )}
      {activeTab === 4 && (
        <Formik initialValues={initialValuesDish} onSubmit={handleSubmitDish}>
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
                      onChange={(e) => {
                        setFieldValue(
                          "dishMainCategoryUniqueId",
                          e?.target.value
                        );
                      }}
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
                  </div>
                  <FlexContainer variant="row-end">
                    <Button variant="default" type="submit">
                      Create Dish
                    </Button>
                  </FlexContainer>
                </FlexContainer>
              </Form>
            );
          }}
        </Formik>
      )}
    </FlexContainer>
  );
};

export default MenuConfig;
