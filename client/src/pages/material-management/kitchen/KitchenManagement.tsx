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
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import { PurchaseItem } from "../purchase/types";
import { KitchenUtilization } from "./types";

const UTILIZATION_TYPE = [
  "kitchen-utilization",
  "banquet",
  "room-sale",
  "outwards-supply",
];

interface FormValues {
  productID: string;
  productName: string;
  quantity: string;
  utilizationDate: string;
  authorizedBy: string;
  utilizationType: string;
  eventId: string;
  eventDate: string;
  roomNumber: string;
  saleType: string;
}

const KitchenManagement = () => {
  const { selectedRestaurant } = useGlobalContext();

  const [activeTab, setActiveTab] = useState(1);
  const handleTabClick = (tab: number) => {
    setActiveTab(tab);
  };

  const [utilizationType, setUtilizationType] = useState("");
  const [initialValues, setInitialValues] = useState<FormValues>({
    productID: "",
    productName: "",
    quantity: "",
    utilizationDate: "",
    authorizedBy: "",
    utilizationType: "",
    eventId: "",
    eventDate: "",
    roomNumber: "",
    saleType: "",
  });

  const {
    data: itemsData,
    error: itemsError,
    loading: itemsLoading,
    // invalidateCache,
    // refresh,
    getData: getItemsData,
  } = useGet<PurchaseItem[]>({ showToast: false });

  const {
    data: utilizationData,
    error: utilizationError,
    loading: utilizationLoading,
    getData: getUtilizationData,
    refresh,
  } = useGet<KitchenUtilization[]>({ showToast: false });

  useEffect(() => {
    if (selectedRestaurant) {
      getUtilizationData(
        `${API_URL}/getKitchenUtilizationEntry?restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_KITCHEN_UTILIZATION_LIST
      );
      getItemsData(
        `${API_URL}/inhouse?mainCategoryName=${MAIN_CATEGORES.KITCHEN_MANAGEMENT}&restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_KITCHEN_LIST
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant]);

  const handleCreateUtilization = async (values: FormValues) => {
    if (!selectedRestaurant?.uniqueId) {
      toast.error("Property not found");
      return;
    }

    const utilization = {
      restaurantId: selectedRestaurant?.uniqueId,
      productUniqueId: values.productID.split("&")[0],
      inHouseUniqueId: values.productID.split("&")[1],
      noOfProducts: values.quantity,
      utilizationDate: values.utilizationDate,
      authorisedBy: values.authorizedBy,
      utilizationType: values.utilizationType,
      roomNumber: values.roomNumber,
      eventId: values.eventId,
      eventDate: values.eventDate,
      saleType: values.saleType,
    };
    try {
      const res = await axios.post(
        `${API_URL}/createKitchenUtilizationEntry`,
        utilization
      );
      toast.success("Utilization created successfully");
      refresh(API_TAGS.GET_KITCHEN_UTILIZATION_LIST);
    } catch (error) {
      const err = error as Error & { response: { data: { error: string } } };
      toast.error(err?.response?.data?.error || "An error occurred");
    }
  };
  return (
    <FlexContainer variant="column-start" gap="xl">
      <ActionArea
        heading={"Management"}
        subheading={"Kitchen"}
        title={"Manage Kitchen Items"}
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
            title="Create Utilization Entry"
            isActiveTab={activeTab === 2}
            onClick={() => handleTabClick(2)}
          />
        </FlexContainer>
        <Link to={"consumption-report"}>
          <Button variant={"outline"} className="text-blue-500 underline">
            View Consumption Report
          </Button>
        </Link>
      </FlexContainer>
      {activeTab === 1 && (
        <FlexContainer variant="column-start">
          <Table aria-label="Inward List">
            <TableHeader
              columns={[
                {
                  key: "product-name",
                  label: "Product Name",
                },
                {
                  key: "quantity",
                  label: "Quantity",
                },
                {
                  key: "utilization-type",
                  label: "Utilization Type",
                },
                {
                  key: "utilization-date",
                  label: "Utilization Date",
                },
                {
                  key: "authorized-by",
                  label: "Authorized By",
                },
              ]}
            >
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody>
              {!utilizationLoading && utilizationData?.length
                ? utilizationData?.map((utilization) => (
                    <TableRow key={utilization?.uniqueId}>
                      <TableCell>{utilization?.productName}</TableCell>
                      <TableCell>{utilization?.noOfProducts}</TableCell>
                      <TableCell>{utilization?.utilizationType}</TableCell>
                      <TableCell>{utilization?.utilizationDate}</TableCell>
                      <TableCell>{utilization?.authorisedBy}</TableCell>
                    </TableRow>
                  ))
                : []}
            </TableBody>
          </Table>
        </FlexContainer>
      )}
      {activeTab === 2 && (
        <FlexContainer variant="column-start">
          <Formik
            initialValues={initialValues}
            validationSchema={Yup.object().shape({
              productID: Yup.string().required("Product ID is required"),
              quantity: Yup.number().required("Quantity is required"),
              utilizationDate: Yup.string().required(
                "Utilization Date is required"
              ),
              authorizedBy: Yup.string().required("Authorized By is required"),
              utilizationType: Yup.string().required(
                "Utilization Type is required"
              ),
            })}
            onSubmit={handleCreateUtilization}
          >
            {({
              isSubmitting,
              values,
              touched,
              errors,
              setFieldValue,
              handleSubmit,
            }) => {
              return (
                <Form>
                  <FlexContainer variant="column-start">
                    <div className="grid grid-cols-3 gap-5">
                      <Select
                        name="productName"
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
                          console.log(e.target.value, "value");
                          setFieldValue("productID", e.target.value);
                        }}
                        value={values.productID}
                        isInvalid={!!(errors.productID && touched.productID)}
                        color={
                          errors.productID && touched.productID
                            ? "danger"
                            : "default"
                        }
                        errorMessage={errors.productID}
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
                        name="quantity"
                        label="Quantity"
                        labelPlacement="outside"
                        placeholder="Enter quantity"
                        radius="sm"
                        classNames={{
                          label: "font-medium text-zinc-100",
                          inputWrapper: "border shadow-none",
                        }}
                        onChange={(e) => {
                          setFieldValue("quantity", e.target.value);
                        }}
                        value={values.quantity}
                        isInvalid={!!(errors.quantity && touched.quantity)}
                        color={
                          errors.quantity && touched.quantity
                            ? "danger"
                            : "default"
                        }
                        errorMessage={
                          errors.quantity && touched.quantity && errors.quantity
                        }
                      />
                      <Input
                        type="date"
                        name="utilizationDate"
                        label="Utilization Date"
                        labelPlacement="outside"
                        placeholder="Enter utilization date"
                        radius="sm"
                        classNames={{
                          label: "font-medium text-zinc-100",
                          inputWrapper: "border shadow-none",
                        }}
                        onChange={(e) => {
                          setFieldValue("utilizationDate", e.target.value);
                        }}
                        value={values.utilizationDate}
                        isInvalid={
                          !!(errors.utilizationDate && touched.utilizationDate)
                        }
                        color={
                          errors.utilizationDate && touched.utilizationDate
                            ? "danger"
                            : "default"
                        }
                        errorMessage={
                          errors.utilizationDate &&
                          touched.utilizationDate &&
                          errors.utilizationDate
                        }
                      />
                      <Input
                        type="text"
                        name="authorizedBy"
                        label="Authorized By"
                        labelPlacement="outside"
                        placeholder="Enter authorized by"
                        radius="sm"
                        classNames={{
                          label: "font-medium text-zinc-100",
                          inputWrapper: "border shadow-none",
                        }}
                        onChange={(e) => {
                          setFieldValue("authorizedBy", e.target.value);
                        }}
                        value={values.authorizedBy}
                        isInvalid={
                          !!(errors.authorizedBy && touched.authorizedBy)
                        }
                        color={
                          errors.authorizedBy && touched.authorizedBy
                            ? "danger"
                            : "default"
                        }
                        errorMessage={
                          errors.authorizedBy &&
                          touched.authorizedBy &&
                          errors.authorizedBy
                        }
                      />
                      <Select
                        name="utilizationType"
                        label="Utilization Type"
                        labelPlacement="outside"
                        placeholder="Select utilization type"
                        radius="sm"
                        items={[
                          {
                            key: "kitchen-utilization",
                            label: "kitchen utilization",
                          },
                          { key: "room-sale", label: "room sale" },
                          { key: "banquet", label: "banquet" },
                          { key: "outwards-supply", label: "outwards supply" },
                        ]}
                        classNames={{
                          label: "font-medium text-zinc-100",
                          trigger: "border shadow-none",
                        }}
                        onChange={(e) => {
                          setFieldValue("utilizationType", e.target.value);
                          setUtilizationType(e.target.value);
                        }}
                        value={values.utilizationType}
                        isInvalid={
                          !!(errors.utilizationType && touched.utilizationType)
                        }
                        color={
                          errors.utilizationType && touched.utilizationType
                            ? "danger"
                            : "default"
                        }
                        errorMessage={
                          errors.utilizationType &&
                          touched.utilizationType &&
                          errors.utilizationType
                        }
                      >
                        {(vendor) => (
                          <SelectItem key={vendor.key} value={vendor.key}>
                            {vendor.label}
                          </SelectItem>
                        )}
                      </Select>
                      {UTILIZATION_TYPE[1] === values.utilizationType && (
                        <>
                          <Input
                            type="text"
                            name="eventId"
                            label="Event ID"
                            labelPlacement="outside"
                            placeholder="Enter event id"
                            radius="sm"
                            classNames={{
                              label: "font-medium text-zinc-100",
                              inputWrapper: "border shadow-none",
                            }}
                            onChange={(e) => {
                              setFieldValue("eventId", e.target.value);
                            }}
                            value={values.eventId}
                            isInvalid={!!(errors.eventId && touched.eventId)}
                            color={
                              errors.eventId && touched.eventId
                                ? "danger"
                                : "default"
                            }
                            errorMessage={
                              errors.eventId &&
                              touched.eventId &&
                              errors.eventId
                            }
                          />
                          <Input
                            type="date"
                            name="eventDate"
                            label="Event Date"
                            labelPlacement="outside"
                            placeholder="Enter event date"
                            radius="sm"
                            classNames={{
                              label: "font-medium text-zinc-100",
                              inputWrapper: "border shadow-none",
                            }}
                            onChange={(e) => {
                              setFieldValue("eventDate", e.target.value);
                            }}
                            value={values.eventDate}
                            isInvalid={
                              !!(errors.eventDate && touched.eventDate)
                            }
                            color={
                              errors.eventDate && touched.eventDate
                                ? "danger"
                                : "default"
                            }
                            errorMessage={
                              errors.eventDate &&
                              touched.eventDate &&
                              errors.eventDate
                            }
                          />
                        </>
                      )}
                      {UTILIZATION_TYPE[2] === values.utilizationType && (
                        <Input
                          type="text"
                          name="roomNumber"
                          label="Room Number"
                          labelPlacement="outside"
                          placeholder="Enter room number"
                          radius="sm"
                          classNames={{
                            label: "font-medium text-zinc-100",
                            inputWrapper: "border shadow-none",
                          }}
                          onChange={(e) => {
                            setFieldValue("roomNumber", e.target.value);
                          }}
                          value={values.roomNumber}
                          isInvalid={
                            !!(errors.roomNumber && touched.roomNumber)
                          }
                          color={
                            errors.roomNumber && touched.roomNumber
                              ? "danger"
                              : "default"
                          }
                          errorMessage={
                            errors.roomNumber &&
                            touched.roomNumber &&
                            errors.roomNumber
                          }
                        />
                      )}
                      {UTILIZATION_TYPE[3] === values.utilizationType && (
                        <Select
                          name="saleType"
                          label="Sale Type"
                          labelPlacement="outside"
                          placeholder="Select sale type"
                          radius="sm"
                          items={[
                            {
                              key: "zomato",
                              label: "Zomato",
                            },
                            { key: "swiggy", label: "Swiggy" },
                            { key: "counter-sale", label: "Counter Sale" },
                          ]}
                          classNames={{
                            label: "font-medium text-zinc-100",
                            trigger: "border shadow-none",
                          }}
                          onChange={(e) => {
                            setFieldValue("saleType", e.target.value);
                            setUtilizationType(e.target.value);
                          }}
                          value={values.saleType}
                          isInvalid={!!(errors.saleType && touched.saleType)}
                          color={
                            errors.saleType && touched.saleType
                              ? "danger"
                              : "default"
                          }
                          errorMessage={
                            errors.saleType &&
                            touched.saleType &&
                            errors.saleType
                          }
                        >
                          {(vendor) => (
                            <SelectItem key={vendor.key} value={vendor.key}>
                              {vendor.label}
                            </SelectItem>
                          )}
                        </Select>
                      )}
                    </div>
                    <FlexContainer variant="row-end" className={"p-5"}>
                      <Button
                        // onClick={handleSubmit}
                        type="submit"
                      >
                        Create
                      </Button>
                    </FlexContainer>
                  </FlexContainer>
                </Form>
              );
            }}
          </Formik>
        </FlexContainer>
      )}
    </FlexContainer>
  );
};

export default KitchenManagement;
