import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/api";
import { API_TAGS } from "@/lib/consts/API_TAGS";
import { API_URL } from "@/lib/consts/app";
import useGet from "@/lib/hooks/use-get";
import { useGlobalContext } from "@/store/GlobalContext";
import {
  Checkbox,
  CheckboxGroup,
  Input,
  Select,
  SelectItem,
  Switch,
} from "@nextui-org/react";
import { Form, Formik } from "formik";
import { cloneDeep } from "lodash";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Restaurant } from "../ksr/config/types";

function AddUser() {
  const { user, selectedRestaurant } = useGlobalContext();
  const [propertyData, setPropertyData] = useState<Restaurant[]>([]);
  // const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const {
    data: designationData,
    error: designationError,
    loading: designationLoading,
    invalidateCache: invalidateDesignationData,
    refresh: refreshDesignationData,
    getData: getDesignationData,
  } = useGet<
    {
      name: string;
      value: string;
    }[]
  >({ showToast: false });

  const {
    data: restaurantData,
    error: restaurantError,
    loading: restaurantLoading,
    getData: getRestaurantData,
  } = useGet<Restaurant[]>({ showToast: false });

  // useEffect(() => {
  //   setLoading(true);
  //   const fetchProp = async function () {
  //     try {
  //       const response = await api(
  //         `/property/${user?.groupUniqueId}`,
  //         {},
  //         "get"
  //       );
  //       setPropertyData(response.data || []);
  //     } catch (err) {
  //       console.log(err);
  //       const error = err as Error & { error: string };
  //       toast.error(error.error || "An error occurred");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   if (user) fetchProp();
  // }, [user]);

  const validationSchema = Yup.object().shape({
    fname: Yup.string().required("please enter firstname"),
    lname: Yup.string().required("please enter lastname"),
    email: Yup.string().required("please enter email"),
    phone: Yup.string().required("please enter phone"),
    role: Yup.string().required("please select role"),
    //min sleceted 1
    properties: Yup.array().min(1, "please select properties"),
  });

  const initialValues = {
    fname: "",
    lname: "",
    email: "",
    phone: "",
    role: "",
    isActive: true,
    properties: "",
  };

  const handleSubmit = async (
    values: any,
    {
      setSubmitting,
      resetForm,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
      resetForm: () => void;
    }
  ) => {
    if (!user) {
      toast.error("User not found");
      return;
    }
    if (!values.properties.length) {
      toast.error("Please select properties");
      return;
    }
    console.log(values);
    const selectedValues = cloneDeep(values);
    setSubmitting(true);
    selectedValues.groupUniqueId = user?.groupUniqueId;
    selectedValues.country_code = "IN";

    const formData = new FormData();
    Object.keys(selectedValues).forEach((fieldName) => {
      formData.append(fieldName, selectedValues[fieldName]);
    });

    try {
      const response = await api("/user", selectedValues, "post");
      toast.success(response.success);
      navigate("/users");
    } catch (error) {
      console.log(error);
      const err = error as Error & { error: string };
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (selectedRestaurant) {
      getDesignationData(
        `${API_URL}/designations?restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_DESIGNATION_LIST
      );
      getRestaurantData(
        `${API_URL}/ksr/restaurants?groupId=${user?.groupUniqueId}`,
        API_TAGS.GET_RESTAURANTS
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant]);

  useEffect(() => {
    if (restaurantData) {
      setPropertyData(restaurantData || []);
    }
  }, [restaurantData]);

  return (
    <FlexContainer variant="column-start" gap="2xl">
      <ActionArea heading="User" subheading="Add" title="Add User" />
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          isSubmitting,
          values,
          errors,
          touched,
          setFieldValue,
          handleChange,
        }) => (
          <Form>
            <div className="block md:flex gap-[20px]">
              <div className="md:grid md:grid-cols-2 gap-[20px] bg-white p-5 rounded-xl border w-full md:w-[70%]">
                <Input
                  type="text"
                  name="fname"
                  label="First Name"
                  labelPlacement="outside"
                  placeholder="Enter your first name"
                  radius="sm"
                  classNames={{
                    label: "font-medium text-zinc-900",
                    inputWrapper: "border shadow-none",
                  }}
                  onChange={(e) => {
                    setFieldValue("fname", e.target.value);
                  }}
                  isInvalid={!!(errors.fname && touched.fname)}
                  color={errors.fname && touched.fname ? "danger" : "default"}
                  errorMessage={errors.fname && touched.fname && errors.fname}
                />

                <Input
                  type="text"
                  name="lname"
                  label="Last Name"
                  labelPlacement="outside"
                  placeholder="Enter your last name"
                  radius="sm"
                  classNames={{
                    label: "font-medium text-zinc-900",
                    inputWrapper: "border shadow-none",
                  }}
                  onChange={(e) => {
                    setFieldValue("lname", e.target.value);
                  }}
                  isInvalid={!!(errors.lname && touched.lname)}
                  color={errors.lname && touched.lname ? "danger" : "default"}
                  errorMessage={errors.lname && touched.lname && errors.lname}
                />

                <Input
                  type="text"
                  name="email"
                  label="Email"
                  labelPlacement="outside"
                  placeholder="Enter user email address"
                  radius="sm"
                  classNames={{
                    label: "font-medium text-zinc-900",
                    inputWrapper: "border shadow-none",
                  }}
                  onChange={(e) => {
                    setFieldValue("email", e.target.value);
                  }}
                  isInvalid={!(errors.email && touched.email)}
                  color={errors.email && touched.email ? "danger" : "default"}
                  errorMessage={errors.email}
                />

                <Input
                  type="text"
                  name="phone"
                  label="Phone Number"
                  labelPlacement="outside"
                  placeholder="Enter user phone number"
                  radius="sm"
                  classNames={{
                    label: "font-medium text-zinc-900",
                    inputWrapper: "border shadow-none",
                  }}
                  onChange={(e) => {
                    setFieldValue("phone", e.target.value);
                  }}
                  isInvalid={!!(errors.phone && touched.phone)}
                  color={errors.phone && touched.phone ? "danger" : "default"}
                  errorMessage={errors.phone && touched.phone && errors.phone}
                />

                {/* <Select
                  name="role"
                  label="User Role"
                  labelPlacement="outside"
                  placeholder="Select User Role"
                  radius="sm"
                  classNames={{
                    label: "font-medium text-zinc-900",
                    trigger: "border shadow-none",
                  }}
                  onChange={(e) => {
                    setFieldValue("role", e.target.value);
                  }}
                  isInvalid={!!(errors.role && touched.role)}
                  color={errors.role && touched.role ? "danger" : "default"}
                  errorMessage={errors.role && touched.role && errors.role}
                >
                  <SelectItem key="manager">Manager</SelectItem>
                  <SelectItem key="chef">Chef</SelectItem>
                  <SelectItem key="accountant">Accountant</SelectItem>
                </Select> */}
                <Select
                  name="role"
                  label="Designation"
                  placeholder="Select employee designation"
                  labelPlacement="outside"
                  radius="sm"
                  classNames={{
                    label: "font-medium text-zinc-900",
                    trigger: "border shadow-none",
                  }}
                  items={designationData?.length ? designationData : []}
                  onChange={(e) => {
                    setFieldValue("role", e.target.value);
                  }}
                  selectedKeys={values?.role ? [values.role] : ""}
                >
                  {(designation) => (
                    <SelectItem
                      key={designation?.value}
                      value={designation?.value}
                    >
                      {designation?.name}
                    </SelectItem>
                  )}
                </Select>

                <Switch
                  aria-label="Active Status"
                  defaultSelected={values.isActive}
                  name="isActive"
                  color="success"
                  onChange={(e) => {
                    setFieldValue("isActive", e.target.checked);
                  }}
                >
                  Active Status
                </Switch>
                <h3 className="text-[18px] font-medium text-zinc-900 col-span-2">
                  Extra Details
                </h3>
                <Input
                  name="address"
                  label="Address"
                  placeholder="Enter employee address"
                  labelPlacement="outside"
                  radius="sm"
                  classNames={{
                    label: "font-medium text-zinc-900",
                    inputWrapper: "border shadow-none",
                  }}
                  onChange={handleChange}
                />

                <Input
                  type="date"
                  name="dateOfJoining"
                  label="Date of Joining"
                  placeholder="Enter date of joining"
                  labelPlacement="outside"
                  radius="sm"
                  classNames={{
                    label: "font-medium text-zinc-900",
                    inputWrapper: "border shadow-none",
                  }}
                  onChange={handleChange}
                  // value={values.dateOfJoining}
                />

                <Input
                  name="department"
                  label="Department"
                  placeholder="Enter employee department"
                  labelPlacement="outside"
                  radius="sm"
                  classNames={{
                    label: "font-medium text-zinc-900",
                    inputWrapper: "border shadow-none",
                  }}
                  onChange={handleChange}
                  // value={values.department}
                />
                <Select
                  name="gender"
                  label="Gender"
                  placeholder="Select employee gender"
                  labelPlacement="outside"
                  radius="sm"
                  classNames={{
                    label: "font-medium text-zinc-900",
                    trigger: "border shadow-none",
                  }}
                  items={[
                    {
                      key: "male",
                      label: "Male",
                    },
                    {
                      key: "female",
                      label: "Female",
                    },
                  ]}
                  onChange={(e) => {
                    setFieldValue("gender", e.target.value);
                  }}
                  // selectedKeys={values?.gender ? [values.gender] : ""}
                >
                  {(gender) => (
                    <SelectItem key={gender.key}>{gender.label}</SelectItem>
                  )}
                </Select>
                <h3 className="col-span-2 text-lg font-semibold">
                  NOK Details
                </h3>
                <Input
                  name="nokName"
                  label="Name"
                  placeholder="Enter NOK name"
                  labelPlacement="outside"
                  radius="sm"
                  classNames={{
                    label: "font-medium text-zinc-900",
                    inputWrapper: "border shadow-none",
                  }}
                  onChange={handleChange}
                />
                <Input
                  type="number"
                  name="nokPhone"
                  label="Phone Number"
                  placeholder="Enter NOK Phone Number"
                  labelPlacement="outside"
                  radius="sm"
                  classNames={{
                    label: "font-medium text-zinc-900",
                    inputWrapper: "border shadow-none",
                  }}
                  onChange={handleChange}
                />
                <Input
                  name="nokAddress"
                  label="Address"
                  placeholder="Enter NOK Address"
                  labelPlacement="outside"
                  radius="sm"
                  classNames={{
                    label: "font-medium text-zinc-900",
                    inputWrapper: "border shadow-none",
                  }}
                  onChange={handleChange}
                />
                <Select
                  name="nokRelationship"
                  label="Realtionship"
                  placeholder="Select nok relationship"
                  labelPlacement="outside"
                  radius="sm"
                  classNames={{
                    label: "font-medium text-zinc-900",
                    trigger: "border shadow-none",
                  }}
                  items={[
                    {
                      key: "father",
                      label: "Father",
                    },
                    {
                      key: "mother",
                      label: "Mother",
                    },
                    {
                      key: "sister",
                      label: "Sister",
                    },
                    {
                      key: "brother",
                      label: "Brother",
                    },
                    {
                      key: "wife",
                      label: "Wife",
                    },
                    {
                      key: "husband",
                      label: "Husband",
                    },
                    {
                      key: "son",
                      label: "Son",
                    },
                    {
                      key: "daughter",
                      label: "Daughter",
                    },
                  ]}
                  onChange={(e) => {
                    setFieldValue("nokRelationship", e.target.value);
                  }}
                >
                  {(rel) => <SelectItem key={rel.key}>{rel.label}</SelectItem>}
                </Select>
              </div>
              <div className="bg-white p-5 rounded-xl border w-full mb-[16px] md:w-[30%] md:mb-0">
                {!restaurantLoading && (
                  <CheckboxGroup
                    size="md"
                    label="Select Restaurant"
                    // onChange={(e) => {
                    //   setFieldValue("properties", e);
                    // }}
                    onValueChange={(val) => {
                      setFieldValue("properties", val);
                    }}
                    errorMessage={errors.properties}
                  >
                    {propertyData?.map((property) => (
                      <Checkbox
                        size="lg"
                        key={property.uniqueId}
                        value={property.uniqueId}
                      >
                        {property.restaurantName}
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                )}
                {errors.properties && touched.properties && (
                  <div className="text-danger">{errors.properties}</div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-[24px] bg-[#F8F8F8] rounded-[12px] mt-5 p-4">
              <Button
                isLoading={isSubmitting}
                type="submit"
                variant="default"
                size="lg"
              >
                Submit
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </FlexContainer>
  );
}

export default AddUser;
