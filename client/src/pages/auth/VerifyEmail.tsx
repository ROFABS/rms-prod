import { api } from "@/lib/api/api";
import { Button, Input, Link } from "@nextui-org/react";
import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
function VerifyEmail() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function () {
      const t = toast.loading("Verifying email...");
      try {
        const response = await api("/verify-user", { token }, "post");
        if (response && response.status == 200) {
          toast.success(
            response?.data?.message ||
              response?.message ||
              "Email verified successfully"
          );
        }
        setLoading(false);
      } catch (err) {
        const error = err as Error & { error: string };
        toast.error(error.error);
        navigate("/auth/login");
      } finally {
        toast.dismiss(t);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container relative grid  h-screen max-h-[900px]  flex-col items-center justify-center lg:max-w-none lg:px-0">
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {loading ? (
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Verifying Email
              </h1>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Email Verified
              </h1>
              <p className="text-muted-foreground text-[14px]">
                Confirm your email and we'll send you a link to reset your
                password.
              </p>
            </div>
          )}

          <hr></hr>
          <Button
            as={Link}
            color="primary"
            variant="light"
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

export default VerifyEmail;
