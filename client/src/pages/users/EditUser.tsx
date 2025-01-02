/* eslint-disable react-hooks/exhaustive-deps */
import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/api";
import {
  Checkbox,
  CheckboxGroup,
  Input,
  Select,
  SelectItem,
  Switch,
} from "@nextui-org/react";
import { Field, Form, Formik } from "formik";
import { cloneDeep } from "lodash";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";

function AddUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({});
  const [propertyData, setPropertyData] = useState<
    { uniqueId: string; title: string; [key: string]: any }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [initialValues, setinitialValues] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
    role: "",
    isActive: false,
    properties: [],
    country_code: "",
  });

  const groupUniqueId = JSON.parse(
    localStorage.getItem("_session") as string
  ).groupUniqueId;

  useEffect(() => {
    setLoading(true);
    (async function () {
      try {
        const response = await api(`/property/${groupUniqueId}`, {}, "get");
        setPropertyData(response.data || []);
      } catch (err) {
        console.log(err);
        const error = err as Error & { error: string };
        toast.error(error.error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getUserData = async (id = "") => {
    try {
      const response = await api(`/user/${id}`, {}, "get");
      console.log(response.data);
      if (response.data) {
        const {
          fname,
          lname,
          email,
          phone,
          role,
          isActive,
          properties,
          country_code,
        } = response.data;
        setinitialValues({
          fname,
          lname,
          email,
          phone,
          role,
          isActive,
          properties,
          country_code,
        });
      }
    } catch (err) {
      console.log(err);
      const error = err as Error & { error: string };
      toast.error(error.error);
    }
  };

  useEffect(() => {
    if (!id) {
      navigate("/users");
    }
    getUserData(id);
  }, [id]);

  const validationSchema = Yup.object().shape({
    fname: Yup.string().required("please enter firstname"),
    lname: Yup.string().required("please enter lastname"),
    email: Yup.string().required("please enter email"),
    phone: Yup.string().required("please enter phone"),
    role: Yup.string().required("please select role"),
  });

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
    console.log(values);
    const selectedValues = cloneDeep(values);
    setSubmitting(true);

    const formData = new FormData();
    Object.keys(selectedValues).forEach((fieldName) => {
      formData.append(fieldName, selectedValues[fieldName]);
    });

    try {
      const response = await api(`/user/${id}`, selectedValues, "patch");
      toast.success(response.success);
      navigate("/users");
    } catch (err) {
      console.log(err);
      const error = err as Error & { error: string };
      toast.error(error.error);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <FlexContainer variant="column-start" gap="2xl">
      <ActionArea
        heading="User"
        subheading="Edit"
        title="Edit User"
        buttonHref="/users"
        buttonText="Back"
        showButton={true}
      />
      {initialValues.email && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ isSubmitting, values, errors, touched, setFieldValue }) => (
            <Form>
              <div className="block md:flex gap-[20px]">
                <div className="md:grid md:grid-cols-2 gap-[20px] border border-[#d6d6d6] rounded-[12px] p-6 w-full mb-[16px] md:w-[70%] md:mb-0">
                  <Input
                    type="text"
                    size="lg"
                    name="fname"
                    label="First Name"
                    labelPlacement="outside"
                    placeholder="Enter your first name"
                    onChange={(e) => {
                      setFieldValue("fname", e.target.value);
                    }}
                    isInvalid={!!errors.fname}
                    color={errors.fname ? "danger" : "default"}
                    errorMessage={errors.fname && errors.fname}
                    value={values.fname}
                  />

                  <Input
                    type="text"
                    size="lg"
                    name="lname"
                    label="Last Name"
                    labelPlacement="outside"
                    placeholder="Enter your last name"
                    onChange={(e) => {
                      setFieldValue("lname", e.target.value);
                    }}
                    isInvalid={!!errors.lname}
                    color={errors.lname ? "danger" : "danger"}
                    errorMessage={errors.lname && errors.lname}
                    value={values.lname}
                  />

                  <Input
                    type="text"
                    size="lg"
                    name="email"
                    label="Email"
                    labelPlacement="outside"
                    placeholder="Enter user email address"
                    onChange={(e) => {
                      setFieldValue("email", e.target.value);
                    }}
                    isInvalid={!!(errors.email && touched.email)}
                    color={errors.email && touched.email ? "danger" : "default"}
                    errorMessage={errors.email && touched.email && errors.email}
                    value={values.email}
                    disabled
                  />

                  <Input
                    type="text"
                    size="lg"
                    name="phone"
                    label="Phone Number"
                    labelPlacement="outside"
                    placeholder="Enter user phone number"
                    onChange={(e) => {
                      setFieldValue("phone", e.target.value);
                    }}
                    isInvalid={!!(errors.phone && touched.phone)}
                    color={errors.phone && touched.phone ? "danger" : "default"}
                    errorMessage={errors.phone && touched.phone && errors.phone}
                    value={values.phone}
                  />

                  <Select
                    name="role"
                    label="User Role"
                    labelPlacement="outside"
                    placeholder="Select User Role"
                    radius="md"
                    size="lg"
                    onChange={(e) => {
                      setFieldValue("role", e.target.value);
                    }}
                    isInvalid={!!(errors.role && touched.role)}
                    color={errors.role && touched.role ? "danger" : "default"}
                    errorMessage={errors.role && touched.role && errors.role}
                    selectedKeys={[values.role]}
                    isDisabled={true}
                  >
                    <SelectItem key="manager">Manager</SelectItem>
                    <SelectItem key="chef">Chef</SelectItem>
                    <SelectItem key="accountant">Accountant</SelectItem>
                  </Select>

                  <Switch
                    aria-label="Active Status"
                    defaultSelected={values.isActive}
                    name="isActive"
                    color="success"
                    size="lg"
                    onChange={(e) => {
                      setFieldValue("isActive", e.target.checked);
                    }}
                    checked={values.isActive}
                  >
                    Active Status
                  </Switch>
                </div>
                <div className="border border-[#d6d6d6] rounded-[12px] p-6 w-full mb-[16px] md:w-[30%] md:mb-0">
                  {!loading && (
                    <CheckboxGroup
                      label="Select Properties"
                      onChange={(e) => {
                        setFieldValue("properties", e);
                      }}
                      value={values.properties}
                    >
                      {propertyData.map((property) => (
                        <Checkbox
                          size="lg"
                          key={property.uniqueId}
                          value={property.uniqueId}
                        >
                          {property.title}
                        </Checkbox>
                      ))}
                    </CheckboxGroup>
                  )}
                </div>
              </div>
              <div className="flex gap-[24px] bg-[#F8F8F8] rounded-[12px] mt-5 p-4">
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
      )}
    </FlexContainer>
  );
}

export default AddUser;
