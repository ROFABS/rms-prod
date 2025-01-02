import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Tab } from "@/components/layout/Tab";
import { Button } from "@/components/ui/button";
import { API_TAGS } from "@/lib/consts/API_TAGS";
import { API_URL } from "@/lib/consts/app";
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
import { FieldArray, Form, Formik } from "formik";
import { Pencil, Trash } from "lucide-react";
import React, { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import { Restaurant } from "./types";

interface FormValues {
  restaurantName: string;
  restaurantType: string;
  items: {
    tableNumber: string;
    seater: string;
  }[];
}

const RestrauntConfig = () => {
  const { property, selectedRestaurant } = useGlobalContext();

  const [activeTab, setActiveTab] = useState(1);
  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const {
    data: restaurantData,
    loading: restaurantLoading,
    refresh,
    getData: getRestaurantData,
  } = useGet<Restaurant[]>({ showToast: false });

  useEffect(() => {
    getRestaurantData(
      `${API_URL}/ksr/restaurants?groupId=${selectedRestaurant?.groupId}&includeTables=true`,
      API_TAGS.GET_RESTAURANTS
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant, activeTab]);

  return (
    <FlexContainer variant="column-start" gap="xl" className={"h-full"}>
      <ActionArea
        heading={"Config"}
        subheading={"Restraunt"}
        title={"Manage Restraunt Settings"}
      />
      <FlexContainer variant="row-start" className="overflow-x-auto">
        <Tab
          title="Restaurant List"
          isActiveTab={activeTab === 1}
          onClick={() => handleTabClick(1)}
        />
        {/* <Tab
          title="Create Restaurant"
          isActiveTab={activeTab === 2}
          onClick={() => handleTabClick(2)}
        /> */}
      </FlexContainer>
      {activeTab === 1 && (
        <FlexContainer variant="column-start">
          <Table aria-label="Inward List">
            <TableHeader>
              <TableColumn>S No.</TableColumn>
              <TableColumn>Restaurant Name</TableColumn>
              <TableColumn>Restaurant Type</TableColumn>
              <TableColumn>Table </TableColumn>
              <TableColumn> </TableColumn>
            </TableHeader>
            <TableBody>
              {!restaurantLoading && restaurantData
                ? restaurantData?.map((restaurant, index) => (
                    <TableRow key={restaurant?.uniqueId}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{restaurant?.restaurantName}</TableCell>
                      <TableCell>{restaurant?.restaurantType}</TableCell>
                      <TableCell>
                        <Link to={restaurant.uniqueId}>
                          <Button variant="outline" size={"icon"}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </TableCell>

                      <TableCell>
                        <Table aria-label="Table list" hideHeader shadow="none">
                          <TableHeader>
                            <TableColumn>Table Number</TableColumn>
                            <TableColumn>Seater</TableColumn>
                          </TableHeader>
                          <TableBody>
                            {restaurant?.tables?.map((table, index) => (
                              <TableRow key={index}>
                                <TableCell>{table?.tableNumber}</TableCell>
                                <TableCell>{table?.seatCounts}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableCell>
                    </TableRow>
                  ))
                : []}
            </TableBody>
          </Table>
        </FlexContainer>
      )}
      {activeTab === 2 && (
        <Formik
          initialValues={{
            restaurantName: "",
            restaurantType: "",
            items: [
              {
                tableNumber: "",
                seater: "",
              },
            ],
          }}
          // validationSchema={Yup.object().shape({
          //   restaurantName: Yup.string().required(
          //     "Restaurant Name is required"
          //   ),
          //   restaurantType: Yup.string().required(
          //     "Restaurant Type is required"
          //   ),
          // })}
          onSubmit={handleSubmit}
        >
          {({
            values,
            handleChange,
            handleBlur,
            setFieldValue,
            touched,
            errors,
          }) => {
            return (
              <Form>
                <FlexContainer variant="column-start" gap="lg">
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      name="restaurantName"
                      label="Restaurant Name"
                      placeholder="Enter Restaurant Name"
                      labelPlacement="outside"
                      radius="sm"
                      classNames={{
                        label: "font-medium text-zinc-800",
                        inputWrapper: "border shadow-none",
                      }}
                      value={values.restaurantName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={
                        !!(touched.restaurantName && errors.restaurantName)
                      }
                      color={
                        touched.restaurantName && errors.restaurantName
                          ? "danger"
                          : "default"
                      }
                      errorMessage={errors.restaurantName}
                    />
                    <Select
                      name="restaurantType"
                      label="Restaurant Type"
                      placeholder="Select Restaurant Type"
                      labelPlacement="outside"
                      radius="sm"
                      classNames={{
                        label: "font-medium text-zinc-900",
                        trigger: "border shadow-none",
                      }}
                      items={[
                        {
                          key: "inhouse-dining",
                          label: "In-House Dining",
                        },
                        {
                          key: "rooftop-dining",
                          label: "Rooftop Dining",
                        },
                        {
                          key: "poolside-dining",
                          label: "Pool Side Dining",
                        },
                        {
                          key: "garden-dining",
                          label: "Garden Dining",
                        },
                        {
                          key: "bar",
                          label: "Bar",
                        },
                      ]}
                      onChange={(e) => {
                        setFieldValue("restaurantType", e.target.value);
                      }}
                      selectedKeys={
                        values?.restaurantType ? [values.restaurantType] : ""
                      }
                      errorMessage={errors.restaurantType}
                    >
                      {(type) => (
                        <SelectItem key={type.key}>{type.label}</SelectItem>
                      )}
                    </Select>
                  </div>
                  <FieldArray
                    name="items"
                    render={(arrayHelpers) => (
                      <Fragment>
                        {values?.items?.length > 0 &&
                          values.items.map(
                            (
                              _,
                              index // Use '_' to indicate 'item' is unused
                            ) => (
                              <FlexContainer
                                variant="column-start"
                                key={index}
                                gap="md"
                              >
                                <h3 className="text-lg font-semibold">
                                  Table {index + 1}
                                </h3>
                                <div className="grid grid-cols-3 gap-6">
                                  <Input
                                    type="number"
                                    name={`items.${index}.tableNumber`}
                                    label="Table Number"
                                    placeholder="Enter Table Number"
                                    labelPlacement="outside"
                                    radius="sm"
                                    classNames={{
                                      label: "font-medium text-zinc-800",
                                      inputWrapper: "border shadow-none",
                                    }}
                                    value={values.items[index].tableNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    // isInvalid={
                                    //   errors?.items?.[index]?.tableNumber // Safely access using optional chaining
                                    // }
                                    // color={
                                    //   errors?.items?.[index]?.tableNumber
                                    //     ? "danger"
                                    //     : "default"
                                    // }
                                    // errorMessage={
                                    //   errors?.items?.[index]?.tableNumber
                                    // }
                                  />
                                  <Select
                                    name={`items.${index}.seater`}
                                    label="Select Seat Count"
                                    labelPlacement="outside"
                                    placeholder="Select Seat Count"
                                    radius="sm"
                                    classNames={{
                                      label: "font-medium text-zinc-900",
                                      trigger: "border shadow-none",
                                    }}
                                    items={[
                                      // 1 seater to 10 seater
                                      { key: "1", label: "1 Seater" },
                                      { key: "2", label: "2 Seater" },
                                      { key: "3", label: "3 Seater" },
                                      { key: "4", label: "4 Seater" },
                                      { key: "5", label: "5 Seater" },
                                      { key: "6", label: "6 Seater" },
                                      { key: "7", label: "7 Seater" },
                                      { key: "8", label: "8 Seater" },
                                      { key: "9", label: "9 Seater" },
                                      { key: "10", label: "10 Seater" },
                                    ]}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    selectedKeys={
                                      values.items[index].seater
                                        ? [values.items[index].seater]
                                        : []
                                    }
                                    // color={
                                    //   errors?.items?.[index]?.seater
                                    //     ? "danger"
                                    //     : "default"
                                    // }
                                    // errorMessage={
                                    //   errors?.items?.[index]?.seater
                                    // }
                                  >
                                    {(item) => (
                                      <SelectItem
                                        key={item.key}
                                        value={item.key}
                                      >
                                        {item.label}
                                      </SelectItem>
                                    )}
                                  </Select>
                                  <FlexContainer>
                                    <Button
                                      variant={"destructive"}
                                      size={"icon"}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        arrayHelpers.remove(index);
                                      }}
                                    >
                                      <Trash className="w-4 h-4" />
                                    </Button>
                                  </FlexContainer>
                                </div>
                              </FlexContainer>
                            )
                          )}
                        <FlexContainer variant="row-end" gap="md">
                          <Button
                            variant="secondary"
                            size={"sm"}
                            onClick={(e) => {
                              e.preventDefault();
                              arrayHelpers.push({
                                tableNumber: "",
                                seater: "",
                              });
                            }}
                          >
                            Add Table
                          </Button>
                        </FlexContainer>
                      </Fragment>
                    )}
                  />
                  <FlexContainer variant="row-end" gap="md">
                    <Button type="submit">Create Restauraunt</Button>
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

export default RestrauntConfig;
