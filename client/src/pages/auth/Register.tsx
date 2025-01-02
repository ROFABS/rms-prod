import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/api";
import { Input, Link } from "@nextui-org/react";
import { Field, Form, Formik } from "formik";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const validationSchema = [
    Yup.object().shape({
      fname: Yup.string().required("Please enter first name"),
      lname: Yup.string().required("Please enter last name"),
      company_name: Yup.string().required("Please enter first name"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      // country_code: Yup.string().required("Please select country"),
      // phone: Yup.number().required("Please enter phone number"),
    }),
    Yup.object().shape({
      password: Yup.string().required("Password is required"),
      confirmPassword: Yup.string()
        .equals([Yup.ref("password")], "Passwords must match")
        .required("Confirm password is required"),
    }),
  ];

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
    if (step == 1) {
      setStep(2);
      setSubmitting(false);
    } else {
      try {
        const response = await api("/register-owner", values, "post");
        toast.success(response.success);
        navigate(`/auth/login`);
      } catch (e) {
        const errors = e as Error & { error: string };
        toast.error(errors.error);
      }
    }
  };

  return (
    <div className="container mx-auto relative grid  h-screen flex-col items-center justify-center lg:max-w-none lg:px-0">
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">
              Register your account
            </h1>
            <p className="text-muted-foreground text-[14px]">
              Create an account to list and manage your property.
            </p>
            <Formik
              enableReinitialize={true}
              initialValues={{
                fname: "",
                lname: "",
                company_name: "",
                email: "",
                country_code: "",
                phone: "",
                password: "",
              }}
              validationSchema={validationSchema[step - 1]}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, setFieldValue, isSubmitting }) => (
                <Form>
                  <RenderSteps
                    step={step}
                    values={values}
                    errors={errors}
                    setFieldValue={setFieldValue}
                    touched={touched}
                  />
                  <div>
                    {step == 1 ? (
                      <Button
                        type="submit"
                        size={"lg"}
                        // color="primary"
                        className="w-full mt-7"
                        isLoading={isSubmitting}
                        // onClick={() => setStep(step + 1)}
                      >
                        Next
                      </Button>
                    ) : null}
                    {step != 1 ? (
                      <Button
                        type="submit"
                        variant="default"
                        size={"lg"}
                        className="mt-7 w-full"
                        isLoading={isSubmitting}
                      >
                        Register
                      </Button>
                    ) : null}
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          <hr></hr>
          <Link href="/login">
            <Button variant={"ghost"} type="submit" className="w-full">
              Sign In
            </Button>
          </Link>
          <hr></hr>
          <span className="text-sm text-center text-[#707070]">
            By signing in or creating an account, you agree with our Terms &
            Conditions and Privacy Statement
          </span>
        </div>
      </div>
    </div>
  );
}

const RenderSteps = ({
  step,
  values,
  errors,
  setFieldValue,
  touched,
}: {
  step: number;
  values: any;
  errors: any;
  setFieldValue: (field: string, value: any) => void;
  touched: any;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  switch (step) {
    case 2:
      return (
        <div className="mt-5 grid gap-3 text-left">
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            label="Password"
            labelPlacement="outside"
            placeholder="Enter your password"
            radius="sm"
            classNames={{
              label: "font-medium text-zinc-900",
              inputWrapper: "border shadow-none",
            }}
            endContent={
              <span
                className="p-2 bg-white border rounded-md cursor-pointer"
                onClick={() => {
                  setShowPassword(!showPassword);
                }}
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-zinc-500" />
                )}
              </span>
            }
            onChange={(e) => {
              setFieldValue("password", e.target.value);
            }}
            isInvalid={errors.password && touched.password}
            color={errors.password && touched.password && "danger"}
            errorMessage={
              errors.password && touched.password && errors.password
            }
          />
          <Input
            type="password"
            name="confirmPassword"
            label="Confirm Password"
            labelPlacement="outside"
            placeholder="Confirm your password"
            radius="sm"
            classNames={{
              label: "font-medium text-zinc-900",
              inputWrapper: "border shadow-none",
            }}
            onChange={(e) => {
              setFieldValue("confirmPassword", e.target.value);
            }}
            isInvalid={errors.confirmPassword && touched.confirmPassword}
            color={
              errors.confirmPassword && touched.confirmPassword && "danger"
            }
            errorMessage={
              errors.confirmPassword &&
              touched.confirmPassword &&
              errors.confirmPassword
            }
          />
        </div>
      );
    case 1:
      return (
        <div className="mt-5 grid gap-4 text-left">
          <div className="grid gap-4 grid-cols-2 text-left">
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
              value={values.fname}
              isInvalid={errors.fname && touched.fname}
              color={errors.fname && touched.fname && "danger"}
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
              value={values.lname}
              isInvalid={errors.lname && touched.lname}
              color={errors.lname && touched.lname && "danger"}
              errorMessage={errors.lname && touched.lname && errors.lname}
            />
          </div>
          <Input
            type="text"
            name="company_name"
            label="Company Name"
            labelPlacement="outside"
            placeholder="Enter your company name"
            radius="sm"
            classNames={{
              label: "font-medium text-zinc-900",
              inputWrapper: "border shadow-none",
            }}
            onChange={(e) => {
              setFieldValue("company_name", e.target.value);
            }}
            value={values.company_name}
            isInvalid={errors.company_name && touched.company_name}
            color={errors.company_name && touched.company_name && "danger"}
            errorMessage={
              errors.company_name && touched.company_name && errors.company_name
            }
          />
          <Input
            type="text"
            name="email"
            label="Email"
            labelPlacement="outside"
            placeholder="Enter your email address"
            radius="sm"
            classNames={{
              label: "font-medium text-zinc-900",
              inputWrapper: "border shadow-none",
            }}
            onChange={(e) => {
              setFieldValue("email", e.target.value);
            }}
            value={values.email}
            isInvalid={errors.email && touched.email}
            color={errors.email && touched.email && "danger"}
            errorMessage={errors.email && touched.email && errors.email}
          />

          {/* <Input
            label="Phone Number"
            size="lg"
            name="phone"
            placeholder="Enter phone number"
            labelPlacement="outside"
            startContent={
              <div className="flex items-center">
                <label className="sr-only" htmlFor="country_code">
                  Country
                </label>
                <select
                  className="outline-none border-0 bg-transparent text-default-400 text-small"
                  id="country_code"
                  name="country_code"
                  onChange={(e) => {
                    setFieldValue("country_code", e.target.value);
                  }}
                >
                  <option value={"+1"}>USD</option>
                  <option value={"+2"}>UK</option>
                </select>
              </div>
            }
            type="text"
            onChange={(e) => {
              setFieldValue("phone", e.target.value);
            }}
            value={values.phone}
            isInvalid={errors.phone && touched.phone && errors.country_code}
            color={
              errors.phone && touched.phone && errors.country_code && "danger"
            }
            errorMessage={
              errors.phone &&
              touched.phone &&
              errors.country_code &&
              errors.phone
            }
          /> */}
        </div>
      );
  }
};

export default Register;
