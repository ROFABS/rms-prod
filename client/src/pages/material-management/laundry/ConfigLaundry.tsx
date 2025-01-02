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
import { FieldArray, Form, Formik } from "formik";
import { Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PurchaseItem } from "../purchase/types";
import { Vendor } from "../vendors/types";
import { LaundryPrice } from "./types";

interface FormValues {
  vendorId: string;
  items: {
    productId: string;
    price: string;
  }[];
}

const ConfigLaundry = () => {
  const { selectedRestaurant } = useGlobalContext();

  const [activeTab, setActiveTab] = useState(1);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleTabClick = (tab: number) => {
    setActiveTab(tab);
  };

  const initialValues = {
    vendorId: "",
    items: [
      {
        productId: "",
        price: "",
      },
    ],
  };

  const {
    data: pricelistData,
    error: pricelistError,
    loading: pricelistLoading,
    getData: getPricelistData,
    refresh: refreshPricelistData,
  } = useGet<LaundryPrice[]>({ showToast: false });

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

  const handleSubmit = async (
    values: FormValues,
    {
      setSubmitting,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => {
    console.log(values);
    const data = values.items.map((item) => {
      return {
        vendorUniqueId: values.vendorId,
        productUniqueId: item.productId,
        price: item.price,
      };
    });
    console.log(data);
    try {
      const res = await axios.post(`${API_URL}/laundary/price`, {
        items: data,
        restaurantId: selectedRestaurant?.uniqueId,
      });
      toast.success("Price configured successfully");
      refreshPricelistData(API_TAGS.GET_LAUNDRY_PRICE_LIST);
    } catch (error) {
      console.log(error);
      const err = error as Error & { response: { data: { error: string } } };
      toast.error(err.response.data.error || "Something went wrong");
    }
  };

  useEffect(() => {
    if (selectedRestaurant) {
      getPricelistData(
        `${API_URL}/laundary/price?restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_LAUNDRY_PRICE_LIST
      );

      getItemsData(
        `${API_URL}/inhouse?mainCategoryName=${MAIN_CATEGORES.LAUNDRY_MANAGEMENT}&restaurantId=${selectedRestaurant?.uniqueId}`,
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
    <FlexContainer variant="column-start" gap="xl">
      <ActionArea
        heading={"Configuration"}
        subheading={"Laundry"}
        title={"Laundry Configurations"}
      />
      <FlexContainer variant="row-start" className="overflow-x-auto">
        <Tab
          title="Price List"
          isActiveTab={activeTab === 1}
          onClick={() => handleTabClick(1)}
        />
        <Tab
          title="Configure Price"
          isActiveTab={activeTab === 2}
          onClick={() => handleTabClick(2)}
        />
      </FlexContainer>
      {activeTab === 1 && (
        <Table aria-label="Price List">
          <TableHeader>
            <TableColumn>Vendor Name</TableColumn>
            <TableColumn>Product Name</TableColumn>
            <TableColumn>Price</TableColumn>
            <TableColumn> </TableColumn>
          </TableHeader>
          <TableBody>
            {!pricelistLoading && pricelistData?.length
              ? pricelistData?.map((price) => (
                  <TableRow key={price?.uniqueId}>
                    <TableCell>{price?.vendorName}</TableCell>
                    <TableCell>{price?.productName}</TableCell>
                    <TableCell>{price?.price}</TableCell>
                    <TableCell>
                      <Button
                        variant={"destructive"}
                        size="sm"
                        onClick={async () => {
                          try {
                            const res = await axios.delete(
                              `${API_URL}/laundary/price?uniqueId=${price?.uniqueId}`
                            );
                            toast.success("Price deleted successfully");
                            refreshPricelistData(
                              API_TAGS.GET_LAUNDRY_PRICE_LIST
                            );
                          } catch (error) {
                            toast.error("Something went wrong");
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              : []}
          </TableBody>
        </Table>
      )}
      {activeTab === 2 && (
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, handleChange, handleSubmit, setFieldValue }) => {
            return (
              <Form>
                <FlexContainer
                  variant="column-start"
                  gap="xl"
                  className="p-5 border rounded-xl bg-white"
                >
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
                      }}
                    >
                      {(vendor) => (
                        <SelectItem key={vendor?.uniqueId}>
                          {vendor?.vendorName}
                        </SelectItem>
                      )}
                    </Select>
                  </div>
                  <FieldArray
                    name="items"
                    render={(arrayHelpers) => (
                      <FlexContainer variant="column-start">
                        {values?.items?.map((price, index) => (
                          <div key={index}>
                            <div className="grid grid-cols-3 gap-5">
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
                                name={`items.${index}.price`}
                                label="Price"
                                labelPlacement="outside"
                                placeholder="Enter price"
                                value={price.price}
                                onChange={handleChange}
                              />
                              <div>
                                <Button
                                  onClick={() => arrayHelpers.remove(index)}
                                  size={"sm"}
                                  variant={"destructive"}
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <FlexContainer variant="row-end" gap="md">
                          <Button
                            type="button"
                            onClick={() =>
                              arrayHelpers.push({ productId: "", price: "" })
                            }
                            size={"sm"}
                            variant={"outline"}
                          >
                            Add Item
                          </Button>
                        </FlexContainer>
                      </FlexContainer>
                    )}
                  />
                  <FlexContainer variant="row-end">
                    <Button type="submit">Save</Button>
                  </FlexContainer>
                </FlexContainer>
              </Form>
            );
          }}
        </Formik>
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
                <h2 className="text-lg font-semibold">Vendor Name: Vendor 1</h2>
              </ModalHeader>
              <ModalBody>
                <Table aria-label="Price List">
                  <TableHeader>
                    <TableColumn>Product Name</TableColumn>
                    <TableColumn>Price</TableColumn>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Product 1</TableCell>
                      <TableCell>100</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Product 2</TableCell>
                      <TableCell>200</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
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

export default ConfigLaundry;
