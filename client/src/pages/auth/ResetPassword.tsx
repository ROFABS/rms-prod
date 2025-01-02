import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/api";
import { Input, Link } from "@nextui-org/react";
import { Form, Formik } from "formik";
import { Eye, EyeOff } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import * as Yup from "yup";

interface FormValues {
  password: string;
  confirmPassword: string;
}

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = React.useState(false);

  const validationSchema = Yup.object().shape({
    password: Yup.string().required("Password is required"),
    confirmPassword: Yup.string().oneOf(
      [Yup.ref("password")],
      "Passwords must match"
    ),
  });

  const handleSubmit = async (values: FormValues) => {
    if (!token) {
      toast.error("Please provide a valid token");
      return;
    }
    try {
      const response = await api(
        "/reset-password",
        { token, password: values.password },
        "post"
      );
      if (response && response.status == 200) {
        navigate("/auth/login");
        toast.success(response.message);
      }
    } catch (err) {
      const error = err as Error & { error: string };
      toast.error(error.error);
    }
  };

  return (
    <div className="container relative grid  h-screen max-h-[900px]  flex-col items-center justify-center lg:max-w-none lg:px-0">
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Reset your password
            </h1>
            <p className="text-muted-foreground text-[14px]">
              Confirm your email and we'll send you a link to reset your
              password.
            </p>
            <Formik
              initialValues={{ email: "", password: "", confirmPassword: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, setFieldValue, isSubmitting }) => (
                <Form>
                  <div className="mt-5 grid gap-3">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      label="Password"
                      labelPlacement="outside"
                      placeholder="Enter your password"
                      radius="sm"
                      classNames={{
                        label: "font-medium text-zinc-800",
                        inputWrapper: "border shadow-none",
                      }}
                      onChange={(e) => {
                        setFieldValue("password", e.target.value);
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
                      isInvalid={!!(errors.password && touched.password)}
                      color={
                        errors.password && touched.password
                          ? "danger"
                          : "default"
                      }
                      errorMessage={
                        errors.password && touched.password && errors.password
                      }
                    />

                    <Input
                      type={"password"}
                      name="confirmPassword"
                      label="Confirm Password"
                      labelPlacement="outside"
                      placeholder="Enter your password"
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

                    <Button isLoading={isSubmitting} type="submit">
                      Reset Password
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          <hr></hr>
          <Link href="/auth/login">
            <Button
              color="primary"
              variant="ghost"
              className="font-[400] text-sm"
            >
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
