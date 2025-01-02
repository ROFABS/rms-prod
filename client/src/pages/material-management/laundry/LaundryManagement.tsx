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
  DateInput,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import axios from "axios";
import dayjs from "dayjs";
import { FieldArray, Form, Formik } from "formik";
import { Trash } from "lucide-react";
import React, { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { PurchaseItem } from "../purchase/types";
import { Vendor } from "../vendors/types";
import { LaundryUtilization } from "./types";

interface FormValues {
  vendorId: string;
  vendorName: string;
  outDate: string;
  items: {
    productId: string;
    productName: string;
    quantity: string;
  }[];
}

const LaundryManagement = () => {
  const { selectedRestaurant } = useGlobalContext();

  const [activeTab, setActiveTab] = useState(1);
  const handleTabClick = (tab: number) => {
    setActiveTab(tab);
  };

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedInward, setSelectedInward] = useState<{
    uniqueId: string;
    vendorName: string;
    productName: string;
    outNoOfProducts: number;
    outDate: string;
    productId: string;
  } | null>(null);

  const [initialValues, setInitialValues] = useState({
    vendorId: "",
    vendorName: "",
    outDate: "",
    items: [
      {
        productId: "",
        productName: "",
        quantity: "",
      },
    ],
  });

  const {
    data: utilizationData,
    error: utilizationError,
    loading: utilizationLoading,
    invalidateCache: invalidateUtilizationCache,
    refresh: refreshUtilizationData,
    getData: getUtilizationData,
  } = useGet<LaundryUtilization[]>({ showToast: false });

  const {
    data: itemsData,
    error: itemsError,
    loading: itemsLoading,
    invalidateCache: invalidateItemsCache,
    refresh: refreshItemsData,
    getData: getItemsData,
  } = useGet<PurchaseItem[]>({ showToast: false });

  const {
    data: allVendorsData,
    error: allVendorsError,
    loading: allVendorsLoading,
    invalidateCache: invalidateAllVendorsCache,
    refresh: refreshAllVendorsData,
    getData: getAllVendorsData,
  } = useGet<Vendor[]>({ showToast: false });

  const handleSubmitOutward = async (
    values: FormValues,
    {
      setSubmitting,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => {
    setSubmitting(true);
    try {
      const items = values.items.map((item) => {
        return {
          productId: item.productId,
          outNoOfProducts: item.quantity,
          vendorId: values.vendorId,
          productName: item.productName,
          vendorName: values.vendorName,
        };
      });
      const data = {
        items,
        restaurantId: selectedRestaurant?.uniqueId,
        outDate: new Date(values.outDate).toISOString(),
      };

      const res = await axios.post(`${API_URL}/laundry/out`, data);
      toast.success(res?.data?.message || "Outward created successfully");
      refreshUtilizationData(API_TAGS.GET_LAUNDRY_OUTSOURCING_LIST);
    } catch (error) {
      const err = error as Error & { response: { data: { error: string } } };
      toast.error(err?.response?.data?.error || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch(
        `${API_URL}/laundry/download/excel?restaurantId=${selectedRestaurant?.uniqueId}`
      );
      console.log(response, "response");
      const blob = await response.blob();
      console.log(blob, "blob");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `laundry${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const err = error as Error & { message: string };
      console.log(err?.message || "An error occurred");
    }
  };

  useEffect(() => {
    if (selectedRestaurant?.uniqueId) {
      getUtilizationData(
        `${API_URL}/laundry?restaurantId=${selectedRestaurant?.uniqueId}&status=Out`,
        API_TAGS.GET_LAUNDRY_OUTSOURCING_LIST
      );
      getItemsData(
        `${API_URL}/inhouse?mainCategoryName=${MAIN_CATEGORES.LAUNDRY_MANAGEMENT}&restaurantId=${selectedRestaurant.uniqueId}`,
        API_TAGS.GET_LAUNDRY_LIST
      );
      getAllVendorsData(
        `${API_URL}/getVendors?restaurantId=${selectedRestaurant.uniqueId}`,
        API_TAGS.GET_VENDORS
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant]);

  return (
    <>
      <FlexContainer variant="column-start" gap="xl">
        <ActionArea
          heading={"Management"}
          subheading={"Laundry"}
          title={"Manage Laundry Items"}
          showButton={true}
          buttonHref={"config"}
          buttonText={"Laundry Configurations"}
        />
        <FlexContainer variant="row-between">
          <FlexContainer variant="row-start" className="overflow-x-auto">
            <Tab
              title="InWard"
              isActiveTab={activeTab === 1}
              onClick={() => handleTabClick(1)}
            />
            <Tab
              title="Outward"
              isActiveTab={activeTab === 2}
              onClick={() => handleTabClick(2)}
            />
            {/* <Tab
              title="Invoice"
              isActiveTab={activeTab === 3}
              onClick={() => handleTabClick(3)}
            /> */}
          </FlexContainer>
          {/* <Button variant={"outline"} onClick={handleExportExcel}>
            Export Report
          </Button> */}
        </FlexContainer>
        {activeTab === 1 && (
          <FlexContainer variant="column-start">
            <Table aria-label="Inward List">
              <TableHeader>
                <TableColumn>S No.</TableColumn>
                <TableColumn>Vendor Name</TableColumn>
                <TableColumn>Product Name</TableColumn>
                <TableColumn>No of Products</TableColumn>
                <TableColumn>Out Date</TableColumn>
                <TableColumn>Action</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No data found">
                {!utilizationLoading && utilizationData?.length
                  ? utilizationData?.map((item, index) => (
                      <TableRow key={item?.uniqueId}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item?.vendorName}</TableCell>
                        <TableCell>{item?.productName}</TableCell>
                        <TableCell>{item?.outNoOfProducts}</TableCell>
                        <TableCell>
                          {dayjs(item?.outDate).format("DD MMM YYYY")}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => {
                              setSelectedInward(item);
                              onOpen();
                              // setActiveTab(2)
                            }}
                          >
                            Inward items
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  : []}
              </TableBody>
            </Table>
          </FlexContainer>
        )}
        {activeTab === 2 && (
          <FlexContainer
            variant="column-start"
            className="p-5 border rounded-xl bg-white"
          >
            <Formik
              initialValues={initialValues}
              validationSchema={Yup.object().shape({
                items: Yup.array().of(
                  Yup.object().shape({
                    productId: Yup.string().required("Please select a product"),
                    quantity: Yup.number().required("Please enter quantity"),
                  })
                ),
                vendorId: Yup.string().required("Please select a vendor"),
                outDate: Yup.date().required("Please enter out date"),
              })}
              onSubmit={handleSubmitOutward}
            >
              {({
                values,
                errors,
                touched,
                isSubmitting,
                // handleSubmit,
                handleChange,
                handleBlur,
                setFieldValue,
              }) => (
                <Form>
                  <FlexContainer variant="column-start" gap="2xl">
                    <h3 className="text-2xl font-semibold text-zinc-900">
                      Add Items to Outward List
                    </h3>
                    <FieldArray
                      name="items"
                      render={(arrayHelpers) => (
                        <FlexContainer variant="column-start">
                          {values?.items?.length > 0 &&
                            values.items.map((item, index) => (
                              <Fragment key={index}>
                                <div className="grid grid-cols-3 gap-5 lg:grid-cols-4">
                                  <Select
                                    name={`items.${index}.productId`}
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
                                      setFieldValue(
                                        `items.${index}.productId`,
                                        e.target.value
                                      );
                                      const product = itemsData?.find(
                                        (item) =>
                                          item.productId === e.target.value
                                      );
                                      setFieldValue(
                                        `items.${index}.productName`,
                                        product?.productName
                                      );
                                    }}
                                  >
                                    {(item) => (
                                      <SelectItem key={item?.productId}>
                                        {item?.productName}
                                      </SelectItem>
                                    )}
                                  </Select>

                                  <Input
                                    type="number"
                                    min="1"
                                    name={`items.${index}.quantity`}
                                    labelPlacement="outside"
                                    label="Quantity"
                                    radius="sm"
                                    classNames={{
                                      label: "font-medium text-zinc-800",
                                      inputWrapper: "border shadow-none",
                                    }}
                                    placeholder="Enter quantity"
                                    onChange={(e) => {
                                      setFieldValue(
                                        `items.${index}.quantity`,
                                        e.target.value
                                      );
                                    }}
                                    onBlur={handleBlur}
                                  />
                                  <FlexContainer variant="row-start">
                                    <Button
                                      variant={"destructive"}
                                      size={"icon"}
                                      onClick={() => {
                                        arrayHelpers.remove(index);
                                      }}
                                    >
                                      <Trash className="w-4 h-4" />
                                    </Button>
                                  </FlexContainer>
                                </div>
                              </Fragment>
                            ))}
                          <FlexContainer variant="row-end">
                            <Button
                              size={"sm"}
                              variant={"outline"}
                              onClick={() =>
                                arrayHelpers.push({
                                  productID: "",
                                  productName: "",
                                  quantity: "",
                                })
                              }
                            >
                              Add Item
                            </Button>
                          </FlexContainer>
                        </FlexContainer>
                      )}
                    />

                    <h3 className="text-2xl font-semibold text-zinc-900">
                      Vendor Details
                    </h3>
                    <div className="grid grid-cols-3 gap-5">
                      <Select
                        label="Select Vendor"
                        labelPlacement="outside"
                        placeholder="Select a vendor"
                        name="vendorId"
                        radius="sm"
                        classNames={{
                          label: "font-medium text-zinc-900",
                          trigger: "border shadow-none",
                        }}
                        items={allVendorsData || []}
                        onChange={(e) => {
                          setFieldValue("vendorId", e.target.value);
                          const vendor = allVendorsData?.find(
                            (item) => item.uniqueId === e.target.value
                          );
                          setFieldValue("vendorName", vendor?.vendorName);
                        }}
                        // selectedKeys={[values.vendorName]}
                        isInvalid={!!(errors.vendorId && touched.vendorId)}
                        color={
                          errors.vendorId && touched.vendorId
                            ? "danger"
                            : "default"
                        }
                        errorMessage={errors.vendorId}
                      >
                        {(vendor) => (
                          <SelectItem key={vendor?.uniqueId}>
                            {vendor?.vendorName}
                          </SelectItem>
                        )}
                      </Select>
                      <Input
                        name="outDate"
                        labelPlacement="outside"
                        label="Out Date"
                        type="date"
                        radius="sm"
                        classNames={{
                          label: "font-medium text-zinc-800",
                          inputWrapper: "border shadow-none",
                        }}
                        value={values.outDate}
                        onChange={(date) => {
                          setFieldValue("outDate", date.target.value);
                        }}
                        onBlur={handleBlur}
                        isInvalid={!!(errors.outDate && touched.outDate)}
                        color={
                          errors.outDate && touched.outDate
                            ? "danger"
                            : "default"
                        }
                        errorMessage={errors.outDate}
                      />
                    </div>
                    <FlexContainer variant="row-end" className={"p-5"}>
                      <Button
                        isLoading={isSubmitting}
                        // onClick={handleSubmit}
                        type="submit"
                      >
                        Create
                      </Button>
                    </FlexContainer>
                  </FlexContainer>
                </Form>
              )}
            </Formik>
          </FlexContainer>
        )}
      </FlexContainer>
      <Modal
        classNames={{
          backdrop: "z-[550]",
          wrapper: "z-[600]",
        }}
        size="4xl"
        backdrop="blur"
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">
                  Inward Details for {selectedInward?.vendorName}
                </h2>
              </ModalHeader>
              <ModalBody>
                <Formik
                  initialValues={{
                    uniqueId: selectedInward?.uniqueId,
                    restaurantId: selectedRestaurant?.uniqueId,
                    productId: selectedInward?.productId,
                    productName: selectedInward?.productName,
                    isDamaged: false,
                    inDate: "",
                    damagedItems: {
                      damageDescription: "",
                      damageNoOfProducts: 0,
                      laundryDamageItemStatus: "",
                      missingNoOfProducts: 0,
                      receivedNoOfProducts: 0,
                    },
                  }}
                  enableReinitialize
                  onSubmit={async (values, { setSubmitting }) => {
                    console.log(values);
                    try {
                      const res = await axios.post(`${API_URL}/laundry/in`, {
                        ...values,
                      });
                      toast.success(
                        res?.data?.message ||
                          "Item added to inventory successfully"
                      );
                      refreshUtilizationData(
                        API_TAGS.GET_LAUNDRY_OUTSOURCING_LIST
                      );
                      onClose();
                    } catch (error) {
                      console.log(error);
                      const err = error as Error & {
                        response: { data: { error: string } };
                      };
                      toast.error(
                        err?.response?.data?.error || "An error occurred"
                      );
                    }
                  }}
                >
                  {({
                    values,
                    errors,
                    touched,
                    // handleSubmit,
                    handleChange,
                    handleBlur,
                    setFieldValue,
                  }) => (
                    <Form>
                      <FlexContainer variant="column-start" gap="md">
                        <h3 className="text-lg font-semibold text-zinc-900">
                          Item Details
                        </h3>
                        <div className="grid grid-cols-3 gap-5">
                          <Input
                            name="productName"
                            label="Product Name"
                            labelPlacement="outside"
                            radius="sm"
                            classNames={{
                              label: "font-medium text-zinc-900",
                              inputWrapper: "border shadow-none",
                            }}
                            value={values.productName}
                            isReadOnly
                          />
                          <Input
                            name="productId"
                            label="Product ID"
                            labelPlacement="outside"
                            radius="sm"
                            classNames={{
                              label: "font-medium text-zinc-800",
                              inputWrapper: "border shadow-none",
                            }}
                            value={values.productId}
                            isReadOnly
                          />
                          <Input
                            name="inDate"
                            label="In Date"
                            labelPlacement="outside"
                            type="date"
                            radius="sm"
                            classNames={{
                              label: "font-medium text-zinc-800",
                              inputWrapper: "border shadow-none",
                            }}
                            value={values.inDate}
                            onChange={(date) => {
                              setFieldValue("inDate", date.target.value);
                            }}
                            onBlur={handleBlur}
                          />
                          <Checkbox
                            name="isDamaged"
                            value={values.isDamaged.toString()}
                            onValueChange={(value) => {
                              setFieldValue("isDamaged", value);
                            }}
                            onBlur={handleBlur}
                          >
                            Damaged
                          </Checkbox>
                          {values.isDamaged && (
                            <div className="grid grid-cols-3 gap-5">
                              <Input
                                type="number"
                                name="damagedItems.damageNoOfProducts"
                                label="No of Damaged Products"
                                labelPlacement="outside"
                                radius="sm"
                                classNames={{
                                  label: "font-medium text-zinc-800",
                                  inputWrapper: "border shadow-none",
                                }}
                                value={values.damagedItems.damageNoOfProducts.toString()}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                              <Input
                                type="number"
                                name="damagedItems.missingNoOfProducts"
                                label="No of Missing Products"
                                labelPlacement="outside"
                                radius="sm"
                                classNames={{
                                  label: "font-medium text-zinc-800",
                                  inputWrapper: "border shadow-none",
                                }}
                                value={values.damagedItems.missingNoOfProducts.toString()}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                              <Input
                                type="number"
                                name="damagedItems.receivedNoOfProducts"
                                label="No of Received Products"
                                labelPlacement="outside"
                                radius="sm"
                                classNames={{
                                  label: "font-medium text-zinc-800",
                                  inputWrapper: "border shadow-none",
                                }}
                                value={values.damagedItems.receivedNoOfProducts.toString()}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                              <Input
                                name="damagedItems.damageDescription"
                                labelPlacement="outside"
                                label="Description"
                                radius="sm"
                                classNames={{
                                  label: "font-medium text-zinc-800",
                                  inputWrapper: "border shadow-none",
                                }}
                                placeholder="Enter description"
                                value={values.damagedItems.damageDescription}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                            </div>
                          )}
                        </div>
                        <FlexContainer variant="row-end">
                          <Button type="submit">Update Item</Button>
                        </FlexContainer>
                      </FlexContainer>
                    </Form>
                  )}
                </Formik>
              </ModalBody>
              {/* <ModalFooter>
                <NextButton onClick={onClose}>Close</NextButton>
                <NextButton colorScheme="primary">Save</NextButton>
              </ModalFooter> */}
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default LaundryManagement;
