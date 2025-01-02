import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Tab } from "@/components/layout/Tab";
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
import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { PurchaseItem } from "./types";

const ManagePurchaseOrder = () => {
  const { selectedRestaurant } = useGlobalContext();

  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState(1);
  const handleTabClick = (index: any) => {
    setActiveTab(index);
  };
  const [params, setParams] = useSearchParams();

  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
    useState<PurchaseItem | null>(null);
  const [selectedOrderForm, setSelectedOrderForm] = useState<{
    productUniqueId: string;
    productName: string;
    status: string;
    isDamaged: boolean;
    isReceived: boolean;
    quantity: string;
    damagedQuantity: number;
    description: string;
    receivedQuantity: number;
    expiryDate: string;
  }>({
    productUniqueId: "",
    quantity: "",
    expiryDate: "",
    status: "",
    productName: "",
    isReceived: false,
    receivedQuantity: 0,
    isDamaged: false,
    damagedQuantity: 0,
    description: "",
  });

  const {
    data: purchaseOrderData,
    error: purchaseOrderError,
    loading: purchaseOrderLoading,
    invalidateCache,
    refresh: refreshPurchaseOrderData,
    getData: getPurchaseOrderData,
  } = useGet<PurchaseItem[]>({ showToast: false });
  const {
    data: purchaseHistoryData,
    error: purchaseHistoryError,
    loading: purchaseHistoryLoading,
    refresh: refreshPurchaseHistoryData,
    getData: getPurchaseHistoryData,
  } = useGet<PurchaseItem[]>({ showToast: false });

  useEffect(() => {
    if (params.get("tab")) {
      setActiveTab(Number(params.get("tab")));
    }
  }, [params]);

  useEffect(() => {
    if (selectedRestaurant?.uniqueId) {
      getPurchaseOrderData(
        `${API_URL}/purchase?restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_PURCHASE_ORDERS
      );
      getPurchaseHistoryData(
        `${API_URL}/purchase?restaurantId=${selectedRestaurant?.uniqueId}&history=true&includeAll=true`,
        API_TAGS.GET_PURCHASE_HISTORY
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant]);

  return (
    <FlexContainer variant="column-start" gap="xl">
      <ActionArea
        heading={"Purchase Order"}
        subheading={"Manage"}
        title={"Purchase Order"}
        showButton={true}
        buttonHref={"/material-management/purchase-order/create"}
        buttonText={"Create Purchase Order"}
      />
      <FlexContainer variant="row-start" className="overflow-x-auto">
        <Tab
          title="Purchase History"
          isActiveTab={activeTab == 1}
          onClick={() => {
            handleTabClick(1);
            setParams({ tab: "1" });
          }}
        />
        <Tab
          title="In Transit"
          isActiveTab={activeTab == 2}
          onClick={() => {
            handleTabClick(2);
            setParams({ tab: "2" });
          }}
        />
      </FlexContainer>
      {activeTab === 1 && (
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
            <TableColumn>Incoming Date</TableColumn>
            <TableColumn>Status</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No data found">
            {!purchaseHistoryLoading && purchaseHistoryData?.length
              ? purchaseHistoryData?.map((item, index) => (
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
                      {dayjs(item.incomingDate).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell>{item?.status}</TableCell>
                  </TableRow>
                ))
              : []}
          </TableBody>
        </Table>
      )}
      {activeTab === 2 && (
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
            <TableColumn>Incoming Date</TableColumn>
            <TableColumn>Status</TableColumn>
            <TableColumn>Action</TableColumn>
          </TableHeader>
          <TableBody>
            {!purchaseOrderLoading && purchaseOrderData?.length
              ? purchaseOrderData?.map((item, index) => (
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
                      {dayjs(item.incomingDate).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell>{item?.status}</TableCell>
                    <TableCell>
                      <Button
                        size={"sm"}
                        onClick={() => {
                          setSelectedPurchaseOrder(item);
                          onOpen();
                          setSelectedOrderForm({
                            productUniqueId: item?.productId,
                            productName: item?.productName,
                            status: item?.status,
                            isDamaged: false,
                            isReceived: false,
                            quantity: item?.noOfProducts.toString(),
                            damagedQuantity: 0,
                            description: "",
                            receivedQuantity: 0,
                            expiryDate: "",
                          });
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
      )}
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
                  Purchase Order Details
                </h2>
              </ModalHeader>
              <ModalBody>
                <FlexContainer variant="column-start">
                  <Formik
                    initialValues={{
                      productName: selectedOrderForm.productName,
                      productUniqueId: selectedOrderForm.productUniqueId,
                      noOfProducts: selectedOrderForm.quantity,
                      expiryDate: "",
                      isDamaged: selectedOrderForm.isDamaged,
                      damagedNoOfProducts: selectedOrderForm.damagedQuantity,
                      isReceived: selectedOrderForm.isReceived,
                      receivedNoOfProducts: selectedOrderForm.receivedQuantity,
                      status: selectedOrderForm.status,
                      description: "",
                    }}
                    onSubmit={(values, { setSubmitting }) => {
                      console.log("values", values);
                    }}
                    enableReinitialize
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
                          <div className="grid grid-cols-3 gap-5">
                            <Select
                              name="status"
                              label="Select Purchase Status"
                              labelPlacement="outside"
                              placeholder="Select Purchase Status"
                              radius="sm"
                              classNames={{
                                label: "font-medium text-zinc-900",
                                trigger: "border shadow-none",
                              }}
                              items={[
                                { uniqueId: 1, status: "Ordered" },
                                { uniqueId: 2, status: "InHouse" },
                                // { uniqueId: 3, status: "Damaged" },
                              ]}
                              selectedKeys={[values.status]}
                              onChange={(value) => {
                                setFieldValue("status", value?.target?.value);
                              }}
                            >
                              {(status) => (
                                <SelectItem key={status?.status}>
                                  {status?.status}
                                </SelectItem>
                              )}
                            </Select>
                            {values.status === "InHouse" && (
                              <>
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
                                  value={values.noOfProducts}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  disabled
                                />
                                <Checkbox
                                  value={values.isReceived.toString()}
                                  onValueChange={(value) => {
                                    setFieldValue("isReceived", value);
                                    setFieldValue(
                                      "receivedNoOfProducts",
                                      values.noOfProducts
                                    );
                                  }}
                                >
                                  Is Received
                                </Checkbox>
                                {values.isReceived && (
                                  <Input
                                    type="number"
                                    name="receivedNoOfProducts"
                                    label="Received Quantity"
                                    labelPlacement="outside"
                                    placeholder="Enter Received Quantity"
                                    radius="sm"
                                    classNames={{
                                      label: "font-medium text-zinc-100",
                                      inputWrapper: "border shadow-none",
                                    }}
                                    value={values.receivedNoOfProducts.toString()}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                  />
                                )}
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
                                      onWheel={(
                                        e: React.WheelEvent<HTMLInputElement>
                                      ) =>
                                        (e.target as HTMLInputElement)?.blur()
                                      }
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
                                        if (
                                          parseInt(e.target.value) >
                                          values.receivedNoOfProducts
                                        ) {
                                          toast.error(
                                            "Damaged quantity cannot be more than received quantity"
                                          );
                                          return;
                                        }
                                        setFieldValue(
                                          "damagedNoOfProducts",
                                          e.target.value
                                        );
                                        setFieldValue(
                                          "receivedNoOfProducts",
                                          parseInt(values.noOfProducts) -
                                            parseInt(e.target.value)
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
                                <Input
                                  type="date"
                                  name="expiryDate"
                                  label="Expiry Date (optional)"
                                  labelPlacement="outside"
                                  placeholder="Select Expiry Date"
                                  radius="sm"
                                  classNames={{
                                    label: "font-medium text-zinc-100",
                                    inputWrapper: "border shadow-none",
                                  }}
                                  value={values.expiryDate}
                                  onChange={(date) => {
                                    setFieldValue(
                                      "expiryDate",
                                      date.target.value
                                    );
                                  }}
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
                                // if (selectedPurchaseOrder?.uniqueId) {
                                //   toast.error(
                                //     "Cannot update the purchase order"
                                //   );
                                //   return;
                                // }
                                try {
                                  const res = await axios.put(
                                    `${API_URL}/purchase?uniqueId=${selectedPurchaseOrder?.uniqueId}`,
                                    values
                                  );
                                  refreshPurchaseOrderData(
                                    API_TAGS.GET_PURCHASE_ORDERS
                                  );
                                  refreshPurchaseHistoryData(
                                    API_TAGS.GET_PURCHASE_HISTORY
                                  );
                                  toast.success(
                                    res?.data?.message || "Order updated"
                                  );
                                  onOpenChange();
                                } catch (error) {
                                  console.log("error", error);
                                  const err = error as Error & {
                                    response: { data: { message: string } };
                                  };
                                  toast.error(err.response.data.message);
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
              <ModalFooter>
                <Button onClick={onClose}>Close</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </FlexContainer>
  );
};

export default ManagePurchaseOrder;
