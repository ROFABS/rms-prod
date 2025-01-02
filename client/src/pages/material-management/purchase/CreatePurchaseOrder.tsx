import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Button } from "@/components/ui/button";
import { API_TAGS } from "@/lib/consts/API_TAGS";
import { API_URL } from "@/lib/consts/app";
import useGet from "@/lib/hooks/use-get";
import { useGlobalContext } from "@/store/GlobalContext";
import {
  Autocomplete,
  AutocompleteItem,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import axios from "axios";
import dayjs from "dayjs";
import { FieldArray, Form, Formik } from "formik";
import { Trash } from "lucide-react";
import React, { Fragment, useEffect } from "react";
import toast from "react-hot-toast";
import { MarketItem } from "../market-items/types";
import { Vendor } from "../vendors/types";

interface FormValues {
  incomingDate: string;
  vendorID: string;
  items: {
    productID: string;
    quantity: string;
    price: string;
    unit: string;
    noOfProduct: string;
  }[];
}

const CreatePurchaseOrder = () => {
  const { selectedRestaurant } = useGlobalContext();

  const initialValues = {
    incomingDate: "",
    vendorID: "",
    items: [
      {
        productID: "",
        quantity: "",
        price: "",
        unit: "",
        noOfProduct: "",
      },
    ],
  };
  const {
    data: marketPlaceItemsData,
    refresh,
    getData: getMarketPlaceItemsData,
  } = useGet<MarketItem[]>({ showToast: false });
  const { data: allVendorsData, getData: getAllVendorsData } = useGet<Vendor[]>(
    {
      showToast: false,
    }
  );

  const handleAddInventory = async (values: FormValues) => {
    console.log(values);
    if (!values?.items?.length) {
      toast.error("Add at least one item");
    }
    if (!values.vendorID) {
      toast.error("Select a vendor");
    }
    if (!values.incomingDate) {
      toast.error("Select incoming date");
    }

    // return;
    const { items } = values;
    const incomingDate = new Date(values.incomingDate).toISOString();
    const itemsData = items.map((item) => {
      return {
        productId: item.productID,
        quantity: item.quantity,
        unit: item.unit,
        noOfProducts: item.noOfProduct,
        vendorId: values.vendorID,
        incomingDate: incomingDate,
        price: item.price,
      };
    });
    console.log(itemsData);

    try {
      const res = await axios.post(`${API_URL}/purchase`, {
        restaurantId: selectedRestaurant?.uniqueId,
        items: itemsData,
      });
      toast.success(
        res?.data?.message || "Purchase order created successfully"
      );
      refresh(API_TAGS.GET_PURCHASE_ORDERS, {}, false);
      refresh(API_TAGS.GET_IN_HOUSE_INVENTORY, {}, false);
      refresh(API_TAGS.GET_PURCHASE_HISTORY, {}, false);
      //   refreshInventoryData();
    } catch (error) {
      const err = error as Error & { response: { data: { error: string } } };
      toast.error(err?.response?.data?.error || "An error occurred");
    }
  };

  useEffect(() => {
    if (selectedRestaurant?.uniqueId) {
      getAllVendorsData(
        `${API_URL}/getVendors?restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_VENDORS
      );
      getMarketPlaceItemsData(
        `${API_URL}/getMarketItems?restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_MARKETPLACE_ITEMS
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant]);

  return (
    <FlexContainer variant="column-start">
      <ActionArea
        heading={"Purchase Order"}
        subheading={"Create"}
        title={"Create Purchase Order"}
      />
      <Formik initialValues={initialValues} onSubmit={handleAddInventory}>
        {({ values, handleChange, handleBlur, setFieldValue }) => (
          <Form>
            <FlexContainer variant="column-start" gap="lg">
              <FieldArray
                name="items"
                render={(arrayHelpers) => (
                  <FlexContainer variant="column-start" gap="lg">
                    <div className="grid grid-cols-3 gap-5">
                      <Input
                        name={`incomingDate`}
                        labelPlacement="outside"
                        label="Incoming Date"
                        type="date"
                        radius="sm"
                        classNames={{
                          label: "font-medium text-zinc-800",
                          inputWrapper: "border shadow-none",
                        }}
                        value={values.incomingDate}
                        onChange={(date) => {
                          setFieldValue(`incomingDate`, date.target.value);
                        }}
                        onBlur={handleBlur}
                      />
                      <Autocomplete
                        label="Select Vendor"
                        labelPlacement="outside"
                        // variant="bordered"
                        name={`vendorID`}
                        defaultItems={allVendorsData || []}
                        placeholder="Search a vendor"
                        onSelectionChange={(val) => {
                          setFieldValue(`vendorID`, val);
                        }}
                      >
                        {(item) => (
                          <AutocompleteItem key={item?.uniqueId}>
                            {item?.vendorName}
                          </AutocompleteItem>
                        )}
                      </Autocomplete>
                      {/* <Select
                        label="Select Vendor"
                        labelPlacement="outside"
                        name={`vendorID`}
                        placeholder="Select Vendor"
                        radius="sm"
                        classNames={{
                          label: "font-medium text-zinc-900",
                          trigger: "border shadow-none",
                        }}
                        items={allVendorsData || []}
                        selectedKeys={values.vendorID ? [values.vendorID] : []}
                        onChange={(e) => {
                          setFieldValue(`vendorID`, e.target.value);
                        }}
                      >
                        {(vendor) => (
                          <SelectItem key={vendor?.uniqueId}>
                            {vendor?.vendorName}
                          </SelectItem>
                        )}
                      </Select> */}
                    </div>
                    {values?.items?.length > 0 &&
                      values.items.map((item, index) => {
                        return (
                          <Fragment key={index}>
                            <p className="font-medium text-rose-600">
                              Item {index + 1}
                            </p>

                            <div
                              key={index}
                              className="grid md:grid-cols-4 lg:grid-cols-6"
                            >
                              <Autocomplete
                                label="Select Product"
                                labelPlacement="outside"
                                // variant="bordered"
                                name={`items[${index}].productID`}
                                defaultItems={marketPlaceItemsData || []}
                                placeholder="Search items"
                                className="col-span-2"
                                // className="max-w-xs"
                                // selectedKey={value}
                                // onSelectionChange={setValue}

                                onChange={(e) => {
                                  setFieldValue(
                                    `items[${index}].productID`,
                                    e.target.value
                                  );
                                }}
                                onSelectionChange={(val) => {
                                  setFieldValue(
                                    `items[${index}].productID`,
                                    val
                                  );
                                }}
                              >
                                {(item) => (
                                  <AutocompleteItem key={item?.uniqueId}>
                                    {item.productName}
                                  </AutocompleteItem>
                                )}
                              </Autocomplete>
                              <Input
                                label="Quantity"
                                labelPlacement="outside"
                                name={`items[${index}].quantity`}
                                type="number"
                                placeholder="Enter Product Quantity"
                                radius="sm"
                                classNames={{
                                  label: "font-medium text-zinc-900",
                                  inputWrapper: "border shadow-none",
                                }}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.items[index].quantity}
                              />
                              <Select
                                label="Measurements"
                                labelPlacement="outside"
                                name={`items[${index}].unit`}
                                placeholder="Kg / Gm / mg / ltr / ml / boxes / bottles / can"
                                radius="sm"
                                classNames={{
                                  label: "font-medium text-zinc-900",
                                  trigger: "border shadow-none",
                                }}
                                showScrollIndicators={true}
                                scrollShadowProps={{ hideScrollBar: false }}
                                items={[
                                  { uniqueId: "1", name: "Kilogram (kg)" },
                                  { uniqueId: "2", name: "Gram (g)" },
                                  { uniqueId: "3", name: "Milligram (mg)" },
                                  { uniqueId: "4", name: "Litre (L)" },
                                  { uniqueId: "5", name: "Millilitre (mL)" },
                                  { uniqueId: "6", name: "Cartoon" },
                                  { uniqueId: "7", name: "Jar" },
                                  { uniqueId: "8", name: "Item" },
                                  { uniqueId: "9", name: "Tin" },
                                  { uniqueId: "9", name: "Container" },
                                ]}
                                selectionMode="single"
                                onChange={(e) => {
                                  setFieldValue(
                                    `items[${index}].unit`,
                                    e.target.value
                                  );
                                }}
                              >
                                {(product) => (
                                  <SelectItem key={product?.name}>
                                    {product?.name}
                                  </SelectItem>
                                )}
                              </Select>
                              <Input
                                name={`items[${index}].noOfProduct`}
                                label="No of Units"
                                labelPlacement="outside"
                                placeholder="Enter No of units"
                                type="number"
                                radius="sm"
                                classNames={{
                                  label: "font-medium text-zinc-800",
                                  inputWrapper: "border shadow-none",
                                }}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.items[index].noOfProduct}
                              />
                              <Input
                                label="Price per unit"
                                labelPlacement="outside"
                                name={`items[${index}].price`}
                                type="number"
                                placeholder="Enter Price per 1 unit"
                                radius="sm"
                                classNames={{
                                  label: "font-medium text-zinc-900",
                                  inputWrapper: "border shadow-none",
                                }}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.items[index].price}
                              />

                              <FlexContainer className={"items-center"}>
                                <Button
                                  onClick={() => arrayHelpers.remove(index)}
                                  variant={"destructive"}
                                  type="button"
                                  size={"icon"}
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </FlexContainer>
                            </div>
                          </Fragment>
                        );
                      })}
                    <FlexContainer variant="row-end">
                      <Button
                        type="button"
                        size={"sm"}
                        variant={"secondary"}
                        onClick={() =>
                          arrayHelpers.push({
                            productID: "",
                            quantity: "",
                            price: "",
                            unit: "",
                            noOfProduct: "",
                          })
                        }
                      >
                        Add Item
                      </Button>
                    </FlexContainer>
                  </FlexContainer>
                )}
              />

              <FlexContainer variant="row-end" className={"p-5"}>
                <Button type="submit">Save</Button>
              </FlexContainer>
            </FlexContainer>
          </Form>
        )}
      </Formik>
    </FlexContainer>
  );
};

export default CreatePurchaseOrder;
