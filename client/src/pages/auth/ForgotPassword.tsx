import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/api";
import { Input, Link } from "@nextui-org/react";
import { Form, Formik } from "formik";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

interface FormValues {
  email: string;
}

function ForgotPassword() {
  const navigate = useNavigate();
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      const response = await api("/forgot-password", values, "post");
      toast.success(response.success);
      navigate("/auth/login");
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
              Forgot your password?
            </h1>
            <p className="text-muted-foreground text-[14px]">
              Confirm your email and we'll send you a link to reset your
              password.
            </p>
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, setFieldValue, isSubmitting }) => (
                <Form>
                  <div className="mt-5 grid gap-3">
                    <Input
                      type="text"
                      name="email"
                      label="Email"
                      labelPlacement="outside"
                      placeholder="Enter your email address or phone number"
                      radius="sm"
                      classNames={{
                        label: "font-medium text-zinc-800",
                        inputWrapper: "border shadow-none",
                      }}
                      onChange={(e) => {
                        setFieldValue("email", e.target.value);
                      }}
                      isInvalid={!!(errors.email && touched.email)}
                      color={
                        errors.email && touched.email ? "danger" : "default"
                      }
                      errorMessage={
                        errors.email && touched.email && errors.email
                      }
                    />

                    <Button type="submit" isLoading={isSubmitting}>
                      Send Link
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          <hr></hr>
          <Button
            color="primary"
            variant="secondary"
            className="font-[400] text-sm cursor-pointer"
            onClick={() => navigate("/auth/login")}
          >
            Back to sign in
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
