import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/api";
import { Input } from "@nextui-org/react";
import { Form, Formik } from "formik";
import { Eye, EyeOff } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";

interface FormValues {
  currentPassword: string;
  new_password: string;
  confirmPassword: string;
}

function ChangePassword() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);

  const validationSchema = Yup.object().shape({
    currentPassword: Yup.string().required("Old password is required"),
    new_password: Yup.string()
      .required("New password is required")
      .min(8, "Password is too short - should be 8 chars minimum."),
    confirmPassword: Yup.string().oneOf(
      [Yup.ref("new_password")],
      "Passwords must match"
    ),
  });

  const handleSubmit = async (values: FormValues) => {
    const local_data = JSON.parse(localStorage.getItem("_session") as any);
    try {
      const response = await api(
        `/change-password/${local_data.uniqueId}`,
        {
          currentPassword: values.currentPassword,
          newPassword: values.new_password,
        },
        "post"
      );
      if (response && response.status == 200) {
        toast.success(response.success);
        localStorage.removeItem("_session");
        navigate("/auth/login");
      }
    } catch (err) {
      const error = err as Error & { error: string };
      toast.error(error.error);
    }
  };

  return (
    <FlexContainer
      variant="column-start"
      gap="2xl"
      className="max-w-sm mx-auto py-10 min-h-screen flex justify-center items-center"
    >
      <Formik
        initialValues={{
          currentPassword: "",
          new_password: "",
          confirmPassword: "",
        }}
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
        }) => (
          <Form>
            <FlexContainer
              variant="column-start"
              className="p-5 border rounded-xl"
            >
              <Input
                type={showPassword ? "text" : "password"}
                name="currentPassword"
                label="Old Password"
                labelPlacement="outside"
                placeholder="Enter your old password"
                radius="sm"
                classNames={{
                  label: "font-medium text-zinc-800",
                  inputWrapper: "border shadow-none",
                }}
                onChange={(e) => {
                  setFieldValue("currentPassword", e.target.value);
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
                isInvalid={
                  !!(errors.currentPassword && touched.currentPassword)
                }
                color={
                  errors.currentPassword && touched.currentPassword
                    ? "danger"
                    : "default"
                }
                errorMessage={
                  errors.currentPassword &&
                  touched.currentPassword &&
                  errors.currentPassword
                }
              />
              <Input
                type="password"
                name="new_password"
                label="New Password"
                labelPlacement="outside"
                placeholder="Enter your new password"
                radius="sm"
                classNames={{
                  label: "font-medium text-zinc-800",
                  inputWrapper: "border shadow-none",
                }}
                onChange={(e) => {
                  setFieldValue("new_password", e.target.value);
                }}
                isInvalid={!!(errors.new_password && touched.new_password)}
                color={
                  errors.new_password && touched.new_password
                    ? "danger"
                    : "default"
                }
                errorMessage={
                  errors.new_password &&
                  touched.new_password &&
                  errors.new_password
                }
              />

              <Input
                type="password"
                name="confirmPassword"
                label="Confirm New Password"
                labelPlacement="outside"
                placeholder="Confirm new password"
                radius="sm"
                classNames={{
                  label: "font-medium text-zinc-800",
                  inputWrapper: "border shadow-none",
                }}
                onChange={(e) => {
                  setFieldValue("confirmPassword", e.target.value);
                }}
                isInvalid={
                  !!(errors.confirmPassword && touched.confirmPassword)
                }
                color={
                  errors.confirmPassword && touched.confirmPassword
                    ? "danger"
                    : "default"
                }
                errorMessage={
                  errors.confirmPassword &&
                  touched.confirmPassword &&
                  errors.confirmPassword
                }
              />
              <Button
                className="mt-5"
                type="submit"
                name="submit"
                isLoading={isSubmitting}
              >
                Submit
              </Button>
            </FlexContainer>
          </Form>
        )}
      </Formik>
    </FlexContainer>
  );
}

export default ChangePassword;
