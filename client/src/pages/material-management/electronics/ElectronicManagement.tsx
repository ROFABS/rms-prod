import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Tab } from "@/components/layout/Tab";
import { Button } from "@/components/ui/button";
import { API_TAGS } from "@/lib/consts/API_TAGS";
import { API_URL } from "@/lib/consts/app";
import { MAIN_CATEGORES } from "@/lib/consts/categories";
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
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { PurchaseItem } from "../purchase/types";
import { ElectronicsUtilization } from "./types";

interface FormValues {
  roomNo: string;
  productId: string;
  quantity: string;
  dateOfInstallation: string;
  miscellaneous: string;
  isDamaged: boolean;
  damageDescription: string;
  damageAmount: string;
}

const ElectronicManagement = () => {
  const { selectedRestaurant } = useGlobalContext();

  const [activeTab, setActiveTab] = useState<number>(1);

  const handleTabClick = (tab: number) => {
    setActiveTab(tab);
  };

  const {
    data: itemsData,
    error: itemsError,
    loading: itemsLoading,
    invalidateCache,
    refresh: refreshItemsData,
    getData: getItemsData,
  } = useGet<PurchaseItem[]>({ showToast: false });

  const {
    data: utilizationData,
    error: utilizationError,
    loading: utilizationLoading,
    invalidateCache: invalidateUtilizationCache,
    refresh: refreshUtilizationData,
    getData: getUtilizationData,
  } = useGet<ElectronicsUtilization[]>({ showToast: false });

  useEffect(() => {
    if (selectedRestaurant?.uniqueId) {
      getUtilizationData(
        `${API_URL}/getElectronicsUtilizations?restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_ELECTRONIC_UTILIZATION_LIST
      );
      getItemsData(
        `${API_URL}/inhouse?mainCategoryName=${MAIN_CATEGORES.ELECTRONICS_MANAGEMENT}&restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_ELECTRONICS_LIST
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant]);

  const handleCreateUtilization = async (
    values: FormValues,
    {
      setSubmitting,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => {
    const utilization = {
      restaurantId: selectedRestaurant?.uniqueId,
      productId: values.productId.split("&")[0],
      inHouseUniqueId: values.productId.split("&")[1],
      roomNumber: values.roomNo,
      noOfProducts: values.quantity,
      dateOfInstallation: values.dateOfInstallation,
      miscellaneous: values.miscellaneous,
      damaged: values.isDamaged,
      damageDescription: values.damageDescription,
      damageAmount: values.damageAmount,
    };
    try {
      const response = await axios.post(
        `${API_URL}/createElectronicUtilizationEntry`,
        utilization
      );
      toast.success("Utilization created successfully");
      refreshUtilizationData(API_TAGS.GET_ELECTRONIC_UTILIZATION_LIST);
    } catch (error) {
      const err = error as Error & { response: { data: { message: string } } };
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FlexContainer variant="column-start" gap="xl">
      <ActionArea
        heading={"Management"}
        subheading={"Electronics"}
        title={"Manage Electronic Items"}
        showButton={false}
        buttonHref={"add"}
        buttonText={"Create"}
      />
      <FlexContainer variant="row-between">
        <FlexContainer variant="row-start" className="overflow-x-auto">
          <Tab
            title="Utilization List"
            isActiveTab={activeTab === 1}
            onClick={() => handleTabClick(1)}
          />
          <Tab
            title="Create Utilization"
            isActiveTab={activeTab === 2}
            onClick={() => handleTabClick(2)}
          />
        </FlexContainer>
        {/* <Button
          href="consumption-report"
          colorScheme="flat"
          className="text-blue-500 underline"
        >
          View Consumption Report
        </Button> */}
      </FlexContainer>
      {activeTab === 1 && (
        <Table aria-label="Purchase Order" className="mt-4">
          <TableHeader>
            <TableColumn>Product Name</TableColumn>
            <TableColumn>No of Products</TableColumn>
            <TableColumn>Room Number</TableColumn>
            <TableColumn>Damage</TableColumn>
            <TableColumn>Date of Installation</TableColumn>
          </TableHeader>
          <TableBody>
            {!utilizationLoading && utilizationData?.length
              ? utilizationData?.map((utilization) => (
                  <TableRow key={utilization?.uniqueId}>
                    <TableCell>{utilization?.productName}</TableCell>
                    <TableCell>{utilization?.noOfProducts}</TableCell>
                    <TableCell>{utilization?.roomNumber}</TableCell>
                    <TableCell>
                      {utilization?.damaged
                        ? utilization?.damageAmount +
                          ", " +
                          utilization?.damageDescription
                        : "No"}
                    </TableCell>
                    <TableCell>
                      {dayjs(utilization?.dateOfInstallation).format(
                        "DD-MM-YYYY"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              : []}
          </TableBody>
        </Table>
      )}

      {activeTab === 2 && (
        <Formik
          initialValues={{
            roomNo: "",
            productId: "",
            quantity: "",
            dateOfInstallation: "",
            miscellaneous: "",
            isDamaged: false,
            damageDescription: "",
            damageAmount: "",
          }}
          validationSchema={Yup.object().shape({
            roomNo: Yup.string().required("Room number is required"),
            productId: Yup.string().required("Product id is required"),
            quantity: Yup.string().required("Quantity is required"),
            dateOfInstallation: Yup.string().required(
              "Date of installation is required"
            ),
            miscellaneous: Yup.string().required("Miscellaneous is required"),
          })}
          onSubmit={handleCreateUtilization}
        >
          {({
            values,
            handleChange,
            handleSubmit,
            handleBlur,
            errors,
            touched,
            isSubmitting,
            setFieldValue,
          }) => (
            <Form>
              <FlexContainer
                variant="column-start"
                className="p-5 bg-white border rounded-xl"
              >
                <div className="grid grid-cols-3 gap-5">
                  <Select
                    name="productId"
                    label="Product Name"
                    labelPlacement="outside"
                    placeholder="Select a product"
                    radius="sm"
                    items={itemsData || []}
                    classNames={{
                      label: "font-medium text-zinc-100",
                      trigger: "border shadow-none",
                    }}
                    onChange={(e) => {
                      setFieldValue("productId", e.target.value);
                    }}
                    value={values.productId}
                    isInvalid={!!(errors.productId && touched.productId)}
                    color={
                      errors.productId && touched.productId
                        ? "danger"
                        : "default"
                    }
                    errorMessage={errors.productId}
                  >
                    {(product) => (
                      <SelectItem
                        key={
                          product?.productId.toString() +
                          "&" +
                          product?.uniqueId.toString()
                        }
                      >
                        {/* {product?.productName} -{" "}
                            {product.quantity.toString() + product.unit}(
                            {product.vendorName}) */}
                        {`${product?.productName} - ${product?.quantity}
                            ${product?.unit} (${product.vendorName})`}
                      </SelectItem>
                    )}
                  </Select>
                  <Input
                    type="number"
                    name="roomNo"
                    label="Room Number"
                    labelPlacement="outside"
                    placeholder="Room Number"
                    radius="sm"
                    classNames={{
                      label: "font-medium text-zinc-800",
                      inputWrapper: "border shadow-none",
                    }}
                    value={values.roomNo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={!!(errors.roomNo && touched.roomNo)}
                    color={
                      errors.roomNo && touched.roomNo ? "danger" : "default"
                    }
                    errorMessage={errors.roomNo}
                  />

                  <Input
                    type="number"
                    name="quantity"
                    label="Quantity"
                    labelPlacement="outside"
                    placeholder="Quantity"
                    radius="sm"
                    classNames={{
                      label: "font-medium text-zinc-800",
                      inputWrapper: "border shadow-none",
                    }}
                    value={values.quantity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={!!(errors.quantity && touched.quantity)}
                    color={
                      errors.quantity && touched.quantity ? "danger" : "default"
                    }
                    errorMessage={errors.quantity}
                  />
                  <Input
                    type="date"
                    name="dateOfInstallation"
                    label="Date of Installation"
                    labelPlacement="outside"
                    placeholder="Date of Installation"
                    radius="sm"
                    classNames={{
                      label: "font-medium text-zinc-800",
                      inputWrapper: "border shadow-none",
                    }}
                    value={values.dateOfInstallation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={
                      !!(
                        errors.dateOfInstallation && touched.dateOfInstallation
                      )
                    }
                    color={
                      errors.dateOfInstallation && touched.dateOfInstallation
                        ? "danger"
                        : "default"
                    }
                    errorMessage={errors.dateOfInstallation}
                  />
                  <Input
                    type="text"
                    name="miscellaneous"
                    label="Miscellaneous"
                    labelPlacement="outside"
                    placeholder="Miscellaneous"
                    radius="sm"
                    classNames={{
                      label: "font-medium text-zinc-800",
                      inputWrapper: "border shadow-none",
                    }}
                    value={values.miscellaneous}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={
                      !!(errors.miscellaneous && touched.miscellaneous)
                    }
                    color={
                      errors.miscellaneous && touched.miscellaneous
                        ? "danger"
                        : "default"
                    }
                    errorMessage={errors.miscellaneous}
                  />
                  <Checkbox
                    name="isDamaged"
                    checked={values.isDamaged}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    Damages
                  </Checkbox>
                  {values.isDamaged && (
                    <>
                      <Input
                        type="text"
                        name="damageDescription"
                        label="Damage Description"
                        labelPlacement="outside"
                        placeholder="Damage Description"
                        radius="sm"
                        classNames={{
                          label: "font-medium text-zinc-800",
                          inputWrapper: "border shadow-none",
                        }}
                        value={values.damageDescription}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={
                          !!(
                            errors.damageDescription &&
                            touched.damageDescription
                          )
                        }
                        color={
                          errors.damageDescription && touched.damageDescription
                            ? "danger"
                            : "default"
                        }
                        errorMessage={errors.damageDescription}
                      />
                      <Input
                        type="number"
                        name="damageAmount"
                        label="Damage Amount"
                        labelPlacement="outside"
                        placeholder="Damage Amount"
                        radius="sm"
                        classNames={{
                          label: "font-medium text-zinc-800",
                          inputWrapper: "border shadow-none",
                        }}
                        value={values.damageAmount}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={
                          !!(errors.damageAmount && touched.damageAmount)
                        }
                        color={
                          errors.damageAmount && touched.damageAmount
                            ? "danger"
                            : "default"
                        }
                        errorMessage={errors.damageAmount}
                      />
                    </>
                  )}
                </div>
                <FlexContainer variant="row-end" className={"p-5"}>
                  <Button isLoading={isSubmitting} type="submit">
                    Create Utilization
                  </Button>
                </FlexContainer>
              </FlexContainer>
            </Form>
          )}
        </Formik>
      )}
    </FlexContainer>
  );
};

export default ElectronicManagement;
