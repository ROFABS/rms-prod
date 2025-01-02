import FlexContainer from "@/components/layout/FlexContainer";
import CurrencySelect from "@/components/system/CurrencySelect";
import TimeZoneSelect from "@/components/system/TimeZoneSelect";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TimePeriodSelect } from "@/components/ui/time-period-select";
import { TimePickerInput } from "@/components/ui/time-picker-input";
import { api } from "@/lib/api/api";
import { Period } from "@/lib/time-picker-utils";
import { cn } from "@/lib/utils";
import { useGlobalContext } from "@/store/GlobalContext";
import { Chip, Input, Select, SelectItem } from "@nextui-org/react";
import axios from "axios";
import dayjs from "dayjs";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { cloneDeep } from "lodash";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

function OnBoardUser() {
  const { user } = useGlobalContext();
  const [onboardingStep, setOnboardingStep] = useState(0);
  const navigate = useNavigate();
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [totalNoOfTables, setTotalNoOfTables] = useState(0);

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("please enter title"),
    currency: Yup.string().required("please select currency"),
    timezone: Yup.string().required("please select timezone"),
    property_type: Yup.string().required("please select property type"),
    email: Yup.string().required("please enter email"),
    startTime: Yup.string().required("please select start time"),
    endTime: Yup.string().required("please select end time"),
  });

  const initialValues = {
    title: "",
    currency: "",
    property_type: "",
    email: "",
    phone: "",
    website: "",
    country_code: "",
    timezone: "",
    zip_code: "",
    state: "",
    city: "",
    address: "",
    landmark: "",
    latitude: "",
    longitude: "",
    startTime: "",
    endTime: "",
  };

  const fetchLocationData = async (
    address: string,
    setFieldValue: {
      (field: string, value: any): void;
    }
  ) => {
    setFetchingLocation(true);
    try {
      const apiKey = "AIzaSyDKiDSUivYp8SXYcSaEguhwIYqqVKsa8WE"; // Replace with your Google Maps API key
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: address,
            key: apiKey,
          },
        }
      );

      if (geocodeResponse.data.status === "OK") {
        const result = geocodeResponse.data.results[0];
        const { address_components, geometry, formatted_address } = result;
        const location = geometry.location;

        const address = formatted_address;
        const landmark = address_components.find(
          (component: { types: string[]; long_name: string }) =>
            component.types.includes("locality")
        )?.long_name;
        const city = address_components.find(
          (component: { types: string[]; long_name: string }) =>
            component.types.includes("administrative_area_level_3")
        )?.long_name;
        const state = address_components.find(
          (component: { types: string[]; long_name: string }) =>
            component.types.includes("administrative_area_level_1")
        )?.long_name;
        const country = address_components.find(
          (component: { types: string[]; long_name: string }) =>
            component.types.includes("country")
        )?.short_name;
        const postalCode = address_components.find(
          (component: { types: string[]; long_name: string }) =>
            component.types.includes("postal_code")
        )?.long_name;

        const timezoneResponse = await axios.get(
          `https://maps.googleapis.com/maps/api/timezone/json`,
          {
            params: {
              location: `${location.lat},${location.lng}`,
              timestamp: Math.floor(Date.now() / 1000),
              key: apiKey,
            },
          }
        );

        const timezone = timezoneResponse.data.timeZoneId;

        setFieldValue("address", address);
        setFieldValue("landmark", landmark);
        setFieldValue("country_code", country);
        setFieldValue("timezone", timezone);
        setFieldValue("city", city);
        setFieldValue("state", state);
        setFieldValue("zip_code", postalCode);
        setFieldValue("latitude", location.lat);
        setFieldValue("longitude", location.lng);
        setFetchingLocation(false);
        setShowForm(true);
      } else {
        toast.error("Couldn't find address");
        console.error(
          "Geocode was not successful for the following reason:",
          geocodeResponse.data.status
        );
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
    } finally {
      setFetchingLocation(false);
    }
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
    const selectedValues = cloneDeep(values);

    if (!selectedValues.startTime || !selectedValues.endTime) {
      toast.error("Please select start and end time");
      return;
    }

    selectedValues.startTime = dayjs(selectedValues.startTime).format(
      "hh:mm A"
    );
    selectedValues.endTime = dayjs(selectedValues.endTime).format("hh:mm A");
    setSubmitting(true);
    selectedValues.group_id = JSON.parse(
      localStorage.getItem("_session") as string
    ).groupUniqueId;
    selectedValues.permissions = selectedValues.permissions
      ? selectedValues.permissions.split(",")
      : [];
    selectedValues.facilities = selectedValues.facilities
      ? selectedValues.facilities.split(",")
      : [];

    const formData = new FormData();
    Object.keys(selectedValues).forEach((fieldName) => {
      formData.append(fieldName, selectedValues[fieldName]);
    });

    try {
      const res = await api(
        "/onboard",
        {
          property: selectedValues,
          noOfTables: totalNoOfTables,
        },
        "post"
      );
      const user = res.data;
      localStorage.setItem("_session", JSON.stringify(user));
      toast.success("Onboarding completed successfully");
      // refresh the window
      window.location.reload();
    } catch (err) {
      const error = err as Error & { error: string };
      console.log(error);
      toast.error(error.error);
    } finally {
      setSubmitting(false);
    }
  };

  //razropay
  const handleCreateSubscription = async (plan: string, amount: number) => {
    const session = localStorage.getItem("_session");
    if (!session) {
      throw new Error("No session found");
    }

    const local_data = JSON.parse(session);
    if (!local_data || !local_data.token) {
      throw new Error("Invalid session data");
    }

    try {
      const res = await api(
        "/subscription/create",
        {
          plan,
          amount,
        },
        "post"
      );
      console.log(res, "res");
      const { order, subscription } = res;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Rofabs Hospitality Pvt Ltd",
        description: "Test Transaction",
        image: "https://example.com/your_logo",
        order_id: order.id,
        handler: async function (response: any) {
          // toast.success(response.razorpay_payment_id);
          // alert(response.razorpay_order_id);
          // alert(response.razorpay_signature);
          await fetch(`${import.meta.env.VITE_APP_API_URL}/onboard/step`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-auth": local_data.token,
            },
            body: JSON.stringify({
              step: 2,
            }),
          });
          toast.success("Payment successful");
          setOnboardingStep(2);
        },
        prefill: {
          name: user?.fname + " " + user?.lname,
          email: user?.email,
        },
        notes: {
          subscription_id: subscription.subscriptionId,
        },
        theme: {
          color: "#3399cc",
        },
      };
      const rzp1 = new window.Razorpay(options);

      rzp1.open();
    } catch (err) {
      const error = err as Error & { error: string };
      console.log(error);
      toast.error(error.error);
    }
  };

  useEffect(() => {
    if (user) {
      setOnboardingStep(user.onboardingStep);
    }
  }, [user]);

  useEffect(() => {
    // Dynamically load the Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up the script if the component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return (
    <FlexContainer variant="column-start" gap="2xl" className="p-10">
      <FlexContainer variant="column-start">
        <h1 className="text-5xl font-semibold">On Boarding</h1>
        <p className="text-default-500">
          Please fill in the details to complete the onboarding process
        </p>
      </FlexContainer>
      {onboardingStep === 1 && (
        <div className="max-w-3xl grid grid-cols-2 gap-5 mx-auto">
          <div className="relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow shadow-slate-950/5 dark:border-slate-900 dark:bg-slate-900">
            <div className="mb-5">
              <div className="mb-1 font-semibold text-slate-900 dark:text-slate-200">
                Essential
              </div>
              <div className="mb-2 inline-flex items-baseline">
                <span className="text-3xl font-bold text-slate-900 dark:text-slate-200">
                  ₹7500
                </span>
                <span
                  className="text-4xl font-bold text-slate-900 dark:text-slate-200"
                  x-text="isAnnual ? '29' : '35'"
                ></span>
                <span className="font-medium text-slate-500">/year</span>
              </div>
              <div className="mb-5 text-sm text-slate-500">
                There are many variations available, but the majority have
                suffered.
              </div>
              <button
                onClick={() => handleCreateSubscription("yearly", 7500)}
                className="inline-flex w-full justify-center whitespace-nowrap rounded-lg bg-indigo-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 transition-colors duration-150 hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-300 dark:focus-visible:ring-slate-600"
              >
                Purchase Plan
              </button>
            </div>
            <div className="mb-3 font-medium text-slate-900 dark:text-slate-200">
              Includes:
            </div>
            <ul className="grow space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center">
                <svg
                  className="mr-3 h-3 w-3 shrink-0 fill-emerald-500"
                  viewBox="0 0 12 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                </svg>
                <span>Unlimited Tables</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="mr-3 h-3 w-3 shrink-0 fill-emerald-500"
                  viewBox="0 0 12 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                </svg>
                <span>Unlimited Table sessions</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="mr-3 h-3 w-3 shrink-0 fill-emerald-500"
                  viewBox="0 0 12 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                </svg>
                <span>Material Management</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="mr-3 h-3 w-3 shrink-0 fill-emerald-500"
                  viewBox="0 0 12 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                </svg>
                <span>Employee Management</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="mr-3 h-3 w-3 shrink-0 fill-emerald-500"
                  viewBox="0 0 12 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                </svg>
                <span>User Management</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="mr-3 h-3 w-3 shrink-0 fill-emerald-500"
                  viewBox="0 0 12 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                </svg>
                <span>Stats/Graphs</span>
              </li>
            </ul>
          </div>
          <div className="h-full dark">
            <div className="relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow shadow-slate-950/5 dark:border-slate-900 dark:bg-slate-900">
              <div className="absolute right-0 top-0 -mt-4 mr-6">
                <div className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-slate-950/5">
                  Most Popular
                </div>
              </div>
              <div className="mb-5">
                <div className="mb-1 font-semibold text-slate-900 dark:text-slate-200">
                  Perform
                </div>
                <div className="mb-2 inline-flex items-baseline">
                  <span className="text-3xl font-bold text-slate-900 dark:text-slate-200">
                    ₹20000
                  </span>
                  <span
                    className="text-4xl font-bold text-slate-900 dark:text-slate-200"
                    x-text="isAnnual ? '49' : '55'"
                  ></span>
                  <span className="font-medium text-slate-500">/3 year</span>
                </div>
                <div className="mb-5 text-sm text-slate-500">
                  There are many variations available, but the majority have
                  suffered.
                </div>
                <button
                  onClick={() => handleCreateSubscription("three_years", 20000)}
                  className="inline-flex w-full justify-center whitespace-nowrap rounded-lg bg-indigo-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 transition-colors duration-150 hover:bg-indigo-600 focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-300 dark:focus-visible:ring-slate-600"
                >
                  Purchase Plan
                </button>
              </div>
              <div className="mb-3 font-medium text-slate-900 dark:text-slate-200">
                Includes:
              </div>
              <ul className="grow space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center">
                  <svg
                    className="mr-3 h-3 w-3 shrink-0 fill-emerald-500"
                    viewBox="0 0 12 12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <span>Unlimited Tables</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="mr-3 h-3 w-3 shrink-0 fill-emerald-500"
                    viewBox="0 0 12 12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <span>Unlimited Table sessions</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="mr-3 h-3 w-3 shrink-0 fill-emerald-500"
                    viewBox="0 0 12 12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <span>Material Management</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="mr-3 h-3 w-3 shrink-0 fill-emerald-500"
                    viewBox="0 0 12 12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <span>Employee Management</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="mr-3 h-3 w-3 shrink-0 fill-emerald-500"
                    viewBox="0 0 12 12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <span>User Management</span>
                </li>
                <li className="flex items-center">
                  <svg
                    className="mr-3 h-3 w-3 shrink-0 fill-emerald-500"
                    viewBox="0 0 12 12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <span>Stats/Graphs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
      {onboardingStep === 2 && (
        <div>
          <div className="w-[100%] md:w-[100%]">
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
                handleSubmit,
              }) => {
                return (
                  <Form>
                    <FlexContainer variant="column-start" gap="3xl">
                      <FlexContainer variant="column-start" gap="xl">
                        <div>
                          <Button
                            size={"sm"}
                            variant={"default"}
                            className="bg-black hover:bg-zinc-800"
                          >
                            Basic Details
                          </Button>
                        </div>
                        <div className="md:grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                          <Input
                            type="text"
                            size="lg"
                            name="title"
                            label="Property Name"
                            labelPlacement="outside"
                            placeholder="Enter your property name"
                            radius="sm"
                            classNames={{
                              label: "font-medium text-zinc-800",
                              inputWrapper: "border shadow-none",
                            }}
                            onChange={(e) => {
                              setFieldValue("title", e.target.value);
                            }}
                            isInvalid={!!(errors.title && touched.title)}
                            color={
                              errors.title && touched.title
                                ? "danger"
                                : "default"
                            }
                            errorMessage={
                              errors.title && touched.title && errors.title
                            }
                          />

                          <Select
                            label="Property Type"
                            labelPlacement="outside"
                            name="property_type"
                            placeholder="Select an option"
                            radius="sm"
                            size="lg"
                            classNames={{
                              label: "font-medium text-zinc-900",
                              trigger: "border shadow-none",
                            }}
                            onChange={(e) => {
                              setFieldValue("property_type", e.target.value);
                            }}
                            isInvalid={
                              !!(errors.property_type && touched.property_type)
                            }
                            color={
                              errors.property_type && touched.property_type
                                ? "danger"
                                : "default"
                            }
                            errorMessage={
                              errors.property_type &&
                              touched.property_type &&
                              errors.property_type
                            }
                          >
                            <SelectItem key="cafe" value="cafe">
                              Cafe
                            </SelectItem>
                            <SelectItem key="restaurant" value="restaurant">
                              Restaurant
                            </SelectItem>
                            <SelectItem key="kiosk" value="kiosk">
                              Kiosk
                            </SelectItem>
                          </Select>
                          <Input
                            type="number"
                            size="lg"
                            radius="sm"
                            classNames={{
                              label: "font-medium text-zinc-800",
                              inputWrapper: "border shadow-none",
                            }}
                            label="Total No of Tables"
                            labelPlacement="outside"
                            placeholder="Enter total no of tables"
                            onChange={(e) => {
                              setTotalNoOfTables(parseInt(e.target.value));
                            }}
                          />
                          <FlexContainer variant="column-start" gap="xs">
                            <label className="text-sm font-medium">
                              Currency
                            </label>{" "}
                            <CurrencySelect
                              setFieldValue={setFieldValue}
                              values={values}
                              errors={errors}
                              touched={touched}
                            />
                          </FlexContainer>

                          <div className="grid gap-1">
                            <Label
                              htmlFor="startTime"
                              className="text-sm font-medium"
                            >
                              Start Time
                            </Label>
                            <Field
                              type="datetime-local"
                              name="startTime"
                              placeholder="Start Time"
                              className={cn(
                                "input px-2 py-2 border-none rounded-xl text-sm text-zinc-700",
                                errors.endTime && touched.endTime
                                  ? "is-invalid"
                                  : ""
                              )}
                              onChange={(e) => {
                                setFieldValue("startTime", e.target.value);
                                if (
                                  values.endTime &&
                                  dayjs(values.endTime).isBefore(
                                    dayjs(e.target.value)
                                  )
                                ) {
                                  toast.error(
                                    "End time should be greater than start time"
                                  );
                                  setFieldValue("endTime", "");
                                }
                              }}
                            />
                            <ErrorMessage
                              name="startTime"
                              component="div"
                              className="error-message"
                            />
                          </div>
                          <div className="grid gap-1">
                            <Label
                              htmlFor="endTime"
                              className="text-sm font-medium"
                            >
                              End Time
                            </Label>
                            <Field
                              type="datetime-local"
                              name="endTime"
                              placeholder="End Time"
                              className={cn(
                                "input px-2 py-2 border-none rounded-xl text-sm text-zinc-700",
                                errors.endTime && touched.endTime
                                  ? "is-invalid"
                                  : ""
                              )}
                              onChange={(e) => {
                                const endTime = dayjs(e.target.value);
                                const startTime = dayjs(values.startTime);

                                if (startTime && endTime.isBefore(startTime)) {
                                  toast.error(
                                    "End time should be greater than start time"
                                  );
                                  setFieldValue("endTime", "");
                                  return;
                                }

                                if (
                                  startTime &&
                                  endTime.diff(startTime, "hour") > 24
                                ) {
                                  toast.error(
                                    "End time should be within 24 hours of start time"
                                  );
                                  setFieldValue("endTime", "");
                                  return;
                                }

                                setFieldValue("endTime", e.target.value);
                              }}
                            />
                            <ErrorMessage
                              name="endTime"
                              component="div"
                              className="error-message"
                            />
                          </div>
                        </div>
                      </FlexContainer>
                      <FlexContainer variant="column-start" gap="xl">
                        <div>
                          <Button
                            size={"sm"}
                            variant={"default"}
                            className="bg-black hover:bg-zinc-800"
                          >
                            Contact Details
                          </Button>
                        </div>
                        <div className="md:grid md:grid-cols-3 gap-[20px]">
                          <Input
                            type="email"
                            size="lg"
                            radius="sm"
                            classNames={{
                              label: "font-medium text-zinc-800",
                              inputWrapper: "border shadow-none",
                            }}
                            name="email"
                            label="Email"
                            labelPlacement="outside"
                            placeholder="Enter your email"
                            onChange={(e) => {
                              setFieldValue("email", e.target.value);
                            }}
                            isInvalid={!!(errors.email && touched.email)}
                            color={
                              errors.email && touched.email
                                ? "danger"
                                : "default"
                            }
                            errorMessage={
                              errors.email && touched.email && errors.email
                            }
                          />

                          <Input
                            type="text"
                            size="lg"
                            radius="sm"
                            classNames={{
                              label: "font-medium text-zinc-800",
                              inputWrapper: "border shadow-none",
                            }}
                            name="phone"
                            label="Phone Number"
                            labelPlacement="outside"
                            placeholder="Enter your phone number"
                            onChange={(e) => {
                              setFieldValue("phone", e.target.value);
                            }}
                            isInvalid={!!(errors.phone && touched.phone)}
                            color={
                              errors.phone && touched.phone
                                ? "danger"
                                : "default"
                            }
                            errorMessage={
                              errors.phone && touched.phone && errors.phone
                            }
                          />

                          <Input
                            type="text"
                            size="lg"
                            radius="sm"
                            classNames={{
                              label: "font-medium text-zinc-800",
                              inputWrapper: "border shadow-none",
                            }}
                            name="website"
                            label="Website"
                            labelPlacement="outside"
                            placeholder="Enter your website"
                            onChange={(e) => {
                              setFieldValue("website", e.target.value);
                            }}
                          />
                        </div>
                      </FlexContainer>
                      <FlexContainer variant="column-start" gap="xl">
                        <div>
                          <Button
                            size={"sm"}
                            variant={"default"}
                            className="bg-black hover:bg-zinc-800"
                          >
                            Location Details
                          </Button>
                        </div>
                        <div className="md:grid md:grid-cols-3 gap-[20px]">
                          <div className="relative">
                            <Input
                              type="text"
                              name="address"
                              label="Location"
                              labelPlacement="outside"
                              placeholder="Enter address"
                              className="relative"
                              size="lg"
                              radius="sm"
                              classNames={{
                                label: "font-medium text-zinc-800",
                                inputWrapper: "border shadow-none",
                              }}
                              value={values.address}
                              onChange={(e) => {
                                setFieldValue("address", e.target.value);
                              }}
                              endContent={
                                fetchingLocation ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <span
                                    className="-mr-1 h-auto cursor-pointer text-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium hover:bg-zinc-50"
                                    onClick={() => {
                                      fetchLocationData(
                                        values.address,
                                        setFieldValue
                                      );
                                    }}
                                  >
                                    Fetch
                                  </span>
                                )
                              }
                            />
                            <div className="absolute -top-2 right-0 flex items-center justify-end">
                              <Chip
                                // onClick={() => {
                                //   fetchLocationData(
                                //     values.address,
                                //     setFieldValue
                                //   );
                                // }}
                                color="secondary"
                                variant="bordered"
                                className="mr-1 cursor-pointer py-1"
                              >
                                Live location
                              </Chip>
                            </div>
                          </div>
                          {showForm && (
                            <>
                              <Input
                                type="text"
                                label="Landmark"
                                labelPlacement="outside"
                                placeholder="Enter landmark"
                                color="default"
                                size="lg"
                                radius="sm"
                                classNames={{
                                  label: "font-medium text-zinc-800",
                                  inputWrapper: "border shadow-none",
                                }}
                                value={values.landmark}
                              />
                              <Input
                                type="text"
                                label="Country Code"
                                name="country_code"
                                labelPlacement="outside"
                                placeholder="Enter country code"
                                size="lg"
                                radius="sm"
                                classNames={{
                                  label: "font-medium text-zinc-800",
                                  inputWrapper: "border shadow-none",
                                }}
                                value={values.country_code}
                                onChange={(e) => {
                                  setFieldValue("country_code", e.target.value);
                                }}
                                isInvalid={
                                  !!(
                                    errors.country_code && touched.country_code
                                  )
                                }
                                color={
                                  errors.country_code && touched.country_code
                                    ? "danger"
                                    : "default"
                                }
                                errorMessage={
                                  errors.country_code &&
                                  touched.country_code &&
                                  errors.country_code
                                }
                              />

                              <FlexContainer variant="column-start" gap="sm">
                                <label>Timezone</label>{" "}
                                <TimeZoneSelect
                                  setFieldValue={setFieldValue}
                                  values={values}
                                  errors={errors}
                                  touched={touched}
                                />
                              </FlexContainer>

                              <Input
                                type="text"
                                label="City"
                                name="city"
                                labelPlacement="outside"
                                placeholder="Enter city"
                                size="lg"
                                radius="sm"
                                classNames={{
                                  label: "font-medium text-zinc-800",
                                  inputWrapper: "border shadow-none",
                                }}
                                value={values.city}
                                onChange={(e) => {
                                  setFieldValue("city", e.target.value);
                                }}
                              />
                              <Input
                                type="text"
                                label="State"
                                name="state"
                                labelPlacement="outside"
                                placeholder="Enter state"
                                color="default"
                                size="lg"
                                radius="sm"
                                classNames={{
                                  label: "font-medium text-zinc-800",
                                  inputWrapper: "border shadow-none",
                                }}
                                value={values.state}
                                onChange={(e) => {
                                  setFieldValue("state", e.target.value);
                                }}
                              />
                              <Input
                                type="text"
                                label="Zip Code"
                                name="zip_code"
                                labelPlacement="outside"
                                placeholder="Enter zip code"
                                color="default"
                                size="lg"
                                radius="sm"
                                classNames={{
                                  label: "font-medium text-zinc-800",
                                  inputWrapper: "border shadow-none",
                                }}
                                value={values.zip_code}
                                onChange={(e) => {
                                  setFieldValue("zip_code", e.target.value);
                                }}
                              />

                              <Input
                                type="text"
                                label="Latitude"
                                name="latitude"
                                labelPlacement="outside"
                                placeholder="Enter latitude"
                                color="default"
                                size="lg"
                                radius="sm"
                                classNames={{
                                  label: "font-medium text-zinc-800",
                                  inputWrapper: "border shadow-none",
                                }}
                                value={values.latitude}
                                onChange={(e) => {
                                  setFieldValue("latitude", e.target.value);
                                }}
                              />
                              <Input
                                type="text"
                                label="Longitude"
                                name="longitude"
                                labelPlacement="outside"
                                placeholder="Enter longitude"
                                color="default"
                                size="lg"
                                radius="sm"
                                classNames={{
                                  label: "font-medium text-zinc-800",
                                  inputWrapper: "border shadow-none",
                                }}
                                value={values.longitude}
                                onChange={(e) => {
                                  setFieldValue("longitude", e.target.value);
                                }}
                              />
                            </>
                          )}
                        </div>
                      </FlexContainer>
                      <FlexContainer variant="row-end">
                        <Button type="submit" isLoading={isSubmitting}>
                          Complete Onboarding
                        </Button>
                      </FlexContainer>
                    </FlexContainer>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      )}
    </FlexContainer>
  );
}

export default OnBoardUser;
