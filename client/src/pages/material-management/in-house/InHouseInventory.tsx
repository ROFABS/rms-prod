import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Button } from "@/components/ui/button";
import { API_TAGS } from "@/lib/consts/API_TAGS";
import { API_URL } from "@/lib/consts/app";
import useGet from "@/lib/hooks/use-get";
import { useGlobalContext } from "@/store/GlobalContext";
import {
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
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
import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PurchaseItem } from "../purchase/types";

const InHouseInventory = () => {
  const { selectedRestaurant } = useGlobalContext();

  const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
    useState<PurchaseItem | null>(null);
  const [selectedOrderForm, setSelectedOrderForm] = useState<{
    productName: string;
    productUniqueId: string;
    quantity: number;
    isDamaged: boolean;
    damagedNoOfProducts: number;
    description: string;
    vendorName: string;
    vendorUniqueId: string;
    mainCategoryName: string;
    mainCategoryId: string;
    subCategoryName: string;
    subCategoryId: string;
  }>({
    vendorUniqueId: "",
    mainCategoryId: "",
    subCategoryId: "",
    damagedNoOfProducts: 0,
    description: "",
    isDamaged: false,
    mainCategoryName: "",
    productName: "",
    productUniqueId: "",
    quantity: 0,
    subCategoryName: "",
    vendorName: "",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    data: inHouseInventoryData,
    loading: inHouseInventoryLoading,
    invalidateCache,
    refresh: refreshInHouseInventoryData,
    getData: getInHouseInventoryData,
  } = useGet<PurchaseItem[]>({ showToast: false });

  useEffect(() => {
    if (selectedRestaurant?.uniqueId) {
      getInHouseInventoryData(
        `${API_URL}/inhouse?restaurantId=${selectedRestaurant?.uniqueId}&restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_IN_HOUSE_INVENTORY
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant]);
  return (
    <FlexContainer variant="column-start" gap="xl">
      <ActionArea
        heading={"Inventory Management"}
        subheading={"Manage"}
        title={"In-House Inventory Management"}
      />
      <Table aria-label="inventory">
        <TableHeader>
          <TableColumn>S No.</TableColumn>
          <TableColumn>Vendor Name</TableColumn>
          <TableColumn>Product Name</TableColumn>
          <TableColumn>Product Category</TableColumn>
          <TableColumn>Quantity</TableColumn>
          <TableColumn>
            Price <span className="text-xs font-medium">(per unit)</span>
          </TableColumn>
          <TableColumn>Expiry Date</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>Action</TableColumn>
        </TableHeader>
        <TableBody>
          {!inHouseInventoryLoading && inHouseInventoryData?.length
            ? inHouseInventoryData?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item?.vendorName}</TableCell>
                  <TableCell>{item?.productName}</TableCell>
                  <TableCell>{item?.mainCategoryName}</TableCell>
                  <TableCell>
                    {item?.quantity} {item?.unit} X {item?.noOfProducts} Units
                  </TableCell>
                  <TableCell>₹{item?.price}</TableCell>
                  <TableCell>
                    {item.expiryDate
                      ? dayjs(item.expiryDate).format("DD/MM/YYYY")
                      : "N/A"}
                  </TableCell>
                  <TableCell>{item?.status}</TableCell>
                  <TableCell>
                    <Button
                      size={"sm"}
                      onClick={() => {
                        setSelectedPurchaseOrder(item);
                        onOpen();
                        setSelectedOrderForm({
                          productName: item.productName,
                          productUniqueId: item.productId,
                          quantity: item.noOfProducts,
                          isDamaged: false,
                          damagedNoOfProducts: 0,
                          description: "",
                          vendorName: item.vendorName,
                          vendorUniqueId: item.vendorId,
                          mainCategoryName: item.mainCategoryName,
                          mainCategoryId: item.mainCategoryId,
                          subCategoryName: item.subCategoryName,
                          subCategoryId: item.subCategoryId,
                        });
                        // setActiveTab(2)
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            : []}
        </TableBody>
      </Table>
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
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">
                  Purchase Order Details
                </h2>
              </ModalHeader>
              <ModalBody>
                <FlexContainer variant="column-start">
                  <Formik
                    initialValues={{
                      productName: selectedOrderForm?.productName || "",
                      noOfProducts: selectedOrderForm?.quantity || 0,
                      isDamaged: false,
                      damagedNoOfProducts: 0,
                      description: "",
                      vendorName: selectedOrderForm?.vendorName || "",
                      vendorId: selectedOrderForm?.vendorUniqueId || "",
                      mainCategoryName:
                        selectedOrderForm?.mainCategoryName || "",
                      mainCategoryId: selectedOrderForm?.mainCategoryId || "",
                      subCategoryName: selectedOrderForm?.subCategoryName || "",
                      subCategoryId: selectedOrderForm?.subCategoryId || "",
                    }}
                    onSubmit={(values) => {
                      console.log("values", values);
                    }}
                    enableReinitialize
                  >
                    {({
                      values,
                      // handleSubmit,
                      handleChange,
                      handleBlur,
                      setFieldValue,
                    }) => (
                      <Form>
                        <FlexContainer variant="column-start" gap="md">
                          <div className="grid grid-cols-3 gap-5">
                            <Input
                              name="vendorName"
                              label="Vendor Name"
                              labelPlacement="outside"
                              placeholder="Enter Vendor Name"
                              radius="sm"
                              classNames={{
                                label: "font-medium text-zinc-100",
                                inputWrapper: "border shadow-none",
                              }}
                              value={values.vendorName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              disabled
                            />
                            <Input
                              name="productName"
                              label="Product Name"
                              labelPlacement="outside"
                              placeholder="Enter Product Name"
                              radius="sm"
                              classNames={{
                                label: "font-medium text-zinc-100",
                                inputWrapper: "border shadow-none",
                              }}
                              value={values.productName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              disabled
                            />
                            <Input
                              name="mainCategoryName"
                              label="Main Category"
                              labelPlacement="outside"
                              placeholder="Enter Main Category"
                              radius="sm"
                              classNames={{
                                label: "font-medium text-zinc-100",
                                inputWrapper: "border shadow-none",
                              }}
                              value={values.mainCategoryName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              disabled
                            />

                            <Input
                              name="subCategoryName"
                              label="Sub Category"
                              labelPlacement="outside"
                              placeholder="Enter Sub Category"
                              radius="sm"
                              classNames={{
                                label: "font-medium text-zinc-100",
                                inputWrapper: "border shadow-none",
                              }}
                              value={values.subCategoryName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              disabled
                            />

                            <Input
                              type="number"
                              name="noOfProducts"
                              label="Quantity"
                              labelPlacement="outside"
                              placeholder="Enter Quantity"
                              radius="sm"
                              classNames={{
                                label: "font-medium text-zinc-100",
                                inputWrapper: "border shadow-none",
                              }}
                              value={values.noOfProducts.toString()}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              disabled
                            />

                            <Checkbox
                              value={values.isDamaged?.toString()}
                              onValueChange={(value) => {
                                setFieldValue("isDamaged", value);
                                setFieldValue("damagedNoOfProducts", 0);
                              }}
                            >
                              Is Damaged
                            </Checkbox>
                            {values.isDamaged && (
                              <>
                                <Input
                                  type="number"
                                  name="damagedNoOfProducts"
                                  label="Damaged Quantity"
                                  labelPlacement="outside"
                                  placeholder="Enter Damaged Quantity"
                                  radius="sm"
                                  classNames={{
                                    label: "font-medium text-zinc-100",
                                    inputWrapper: "border shadow-none",
                                  }}
                                  value={values.damagedNoOfProducts.toString()}
                                  onChange={(e) => {
                                    setFieldValue(
                                      "damagedNoOfProducts",
                                      e.target.value
                                    );
                                  }}
                                  onBlur={handleBlur}
                                />
                                <Input
                                  name="description"
                                  label="Description"
                                  labelPlacement="outside"
                                  placeholder="Enter Description"
                                  radius="sm"
                                  classNames={{
                                    label: "font-medium text-zinc-100",
                                    inputWrapper: "border shadow-none",
                                  }}
                                  value={values.description}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                />
                              </>
                            )}
                          </div>
                          <FlexContainer variant="row-end">
                            <Button
                              type="submit"
                              onClick={async () => {
                                // console.log(values, "values");
                                // return;
                                //update the items array in formik state
                                if (values.isDamaged) {
                                  if (values.damagedNoOfProducts === 0) {
                                    toast.error(
                                      "Please enter the damaged quantity"
                                    );
                                    return;
                                  }
                                }
                                if (
                                  values.damagedNoOfProducts >
                                  values.noOfProducts
                                ) {
                                  toast.error(
                                    "Damaged quantity cannot be greater than the total quantity"
                                  );
                                  return;
                                }
                                if (
                                  !values.vendorId ||
                                  !values.productName ||
                                  !values.noOfProducts ||
                                  !values.mainCategoryName ||
                                  !values.subCategoryName
                                ) {
                                  toast.error("Please fill all the fields");
                                  return;
                                }
                                const damageData = {
                                  productId: selectedOrderForm?.productUniqueId,
                                  damageNoOfProducts:
                                    values.damagedNoOfProducts,
                                  damageDescription: values.description,
                                  vendorUniqueId:
                                    selectedOrderForm?.vendorUniqueId,
                                  mainCategoryId:
                                    selectedOrderForm?.mainCategoryId,
                                  subCategoryId:
                                    selectedOrderForm?.subCategoryId,
                                };
                                try {
                                  const res = await axios.post(
                                    `${API_URL}/inhouse/damage`,
                                    damageData
                                  );
                                  toast.success(
                                    res?.data?.message ||
                                      "Data saved successfully"
                                  );
                                  refreshInHouseInventoryData(
                                    API_TAGS.GET_IN_HOUSE_INVENTORY
                                  );
                                } catch (error) {
                                  const err = error as Error & {
                                    response: { data: { error: string } };
                                  };
                                  toast.error(
                                    err?.response?.data?.error ||
                                      "An error occurred"
                                  );
                                }
                              }}
                            >
                              Save
                            </Button>
                          </FlexContainer>
                        </FlexContainer>
                      </Form>
                    )}
                  </Formik>
                </FlexContainer>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </FlexContainer>
  );
};

export default InHouseInventory;
