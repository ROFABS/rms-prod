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
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { PurchaseItem } from "../purchase/types";
import { HouseKeepingUtilization } from "./types";

interface FormValues {
  productId: string;
  quantity: string;
  utilizationDate: string;
  roomNo: string;
}

const HouseKeepingManagement = () => {
  const { selectedRestaurant } = useGlobalContext();

  const [activeTab, setActiveTab] = useState(1);

  const handleTabClick = (tab: number) => {
    setActiveTab(tab);
  };

  const [initialValues, setInitialValues] = useState({
    productId: "",
    quantity: "",
    utilizationDate: "",
    roomNo: "",
  });
  const {
    data: itemsData,
    error: itemsError,
    loading: itemsLoading,
    invalidateCache: invalidateItemsCache,
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
  } = useGet<HouseKeepingUtilization[]>({ showToast: true });

  useEffect(() => {
    if (selectedRestaurant) {
      getUtilizationData(
        `${API_URL}/getHouseKeepingUtilizationEntries?restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_HOUSE_KEEPING_UTILIZATION_LIST
      );
      getItemsData(
        `${API_URL}/inhouse?mainCategoryName=${MAIN_CATEGORES.HOUSE_KEEPING_MANAGEMENT}&restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_HOUSE_KEEPING_LIST
      );
    }
  }, [selectedRestaurant]);

  const handleCreateUtilization = async (
    values: FormValues,
    {
      setSubmitting,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
    }
  ) => {
    try {
      const response = await axios.post(
        `${API_URL}/createHouseKeepingUtilizationEntry`,
        {
          restaurantId: selectedRestaurant?.uniqueId,
          productId: values.productId.split("&")[0],
          inHouseUniqueId: values.productId.split("&")[1],
          noOfProducts: values.quantity,
          utilizationDate: new Date(values.utilizationDate).toISOString(),
          roomNumber: values.roomNo,
        }
      );
      const { data } = response;
      toast.success(data.message || "Utilization Created Successfully");
      refreshUtilizationData(API_TAGS.GET_HOUSE_KEEPING_UTILIZATION_LIST);
    } catch (error) {
      console.log(error);
      const err = error as Error & { response: { data: { error: string } } };
      toast.error(err?.response?.data?.error || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <FlexContainer variant="column-start" gap="xl">
      <ActionArea
        heading={"Management"}
        subheading={"House Keeping"}
        title={"Manage House Keeping Items"}
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
      </FlexContainer>

      {activeTab === 1 && (
        <FlexContainer variant="column-start">
          <Table aria-label="Utilization List">
            <TableHeader>
              <TableColumn>Product Name</TableColumn>
              <TableColumn>Quantity</TableColumn>
              <TableColumn>Utilization Date</TableColumn>
              <TableColumn>Room No</TableColumn>
            </TableHeader>
            <TableBody>
              {!utilizationLoading && utilizationData?.length
                ? utilizationData?.map((utilization) => (
                    <TableRow key={utilization?.uniqueId}>
                      <TableCell>{utilization?.productName}</TableCell>
                      <TableCell>{utilization?.noOfProducts}</TableCell>
                      <TableCell>
                        {dayjs(utilization?.utilizationDate).format(
                          "DD-MM-YYYY"
                        )}
                      </TableCell>
                      <TableCell>{utilization?.roomNumber}</TableCell>
                    </TableRow>
                  ))
                : []}
            </TableBody>
          </Table>
        </FlexContainer>
      )}
      {/* utilization product name quantity utilization date room no */}
      {activeTab === 2 && (
        <Formik
          initialValues={initialValues}
          validationSchema={Yup.object().shape({
            productId: Yup.string().required("Product ID is required"),
            quantity: Yup.number().required("Quantity is required"),
            utilizationDate: Yup.date().required(
              "Utilization Date is required"
            ),
          })}
          onSubmit={handleCreateUtilization}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
            setFieldValue,
          }) => (
            <Form>
              <FlexContainer variant="column-start">
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
                    name="utilizationDate"
                    label="Utilization Date"
                    labelPlacement="outside"
                    placeholder="Utilization Date"
                    radius="sm"
                    classNames={{
                      label: "font-medium text-zinc-800",
                      inputWrapper: "border shadow-none",
                    }}
                    value={values.utilizationDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={
                      !!(errors.utilizationDate && touched.utilizationDate)
                    }
                    color={
                      errors.utilizationDate && touched.utilizationDate
                        ? "danger"
                        : "default"
                    }
                    errorMessage={errors.utilizationDate}
                  />
                  <Input
                    name="roomNo"
                    label="Place of Utilization"
                    labelPlacement="outside"
                    placeholder="corridor/room no/floor"
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

export default HouseKeepingManagement;
