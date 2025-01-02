import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/api";
import { useGlobalContext } from "@/store/GlobalContext";
import { Input } from "@nextui-org/react";
import { Form, Formik } from "formik";
import { cloneDeep } from "lodash";
import { TrashIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as Yup from "yup";

function Profile() {
  const [selectImg, setSelectedImg] = useState<string | ArrayBuffer | null>();
  const { user, setUser } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);

  const validationSchema = Yup.object().shape({
    fname: Yup.string().required("please enter firstname"),
    lname: Yup.string().required("please enter lastname"),
  });

  const handleImageRemove = () => {
    setSelectedImg(null);
  };

  function previewImage(imageInput: React.ChangeEvent<HTMLInputElement>) {
    if (imageInput.target.files && imageInput.target.files.length > 0) {
      const file = imageInput.target.files[0];
      const reader = new FileReader();
      reader.onload = function (e) {
        setSelectedImg(e.target?.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("No image selected");
    }
  }

  const getUserData = async () => {
    try {
      const response = await api(
        `/user/${
          JSON.parse(localStorage.getItem("_session") as string).uniqueId
        }`,
        {},
        "get"
      );
      setUser(response.data);
      // setUserData(response.data);
      setSelectedImg(response.data.profile_pic);
    } catch (err) {
      const error = err as Error & { error: string };
      console.log(error);
    }
  };

  useEffect(() => {
    getUserData().then((response) => {
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);

  console.log(user);

  const initialValues = {
    fname: user?.fname || "",
    lname: user?.lname || "",
    email: user?.email || "",
    company_name: user?.company_name || "",
    profile_pic: user?.profile_pic || "",
  };

  const handleDelete = async (url: string) => {
    if (!url) {
      toast.error("No url to delete");
      return;
    }
    try {
      const res = await api(`/delete-file`, { url }, "post");
    } catch (err) {
      const error = err as Error & { error: string };
      console.log(error);
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
    setSubmitting(true);
    delete selectedValues.email;
    delete selectedValues.company_name;
    selectedValues.country_code = user?.country_code || "";
    selectedValues.phone = user?.phone || "";
    selectedValues.isActive = user?.isActive || false;
    selectedValues.properties = user?.properties || [];

    if (
      selectedValues.profile_pic &&
      typeof selectedValues.profile_pic === "object"
    ) {
      if (user?.profile_pic) {
        await handleDelete(user?.profile_pic);
      }
      const formData = new FormData();
      formData.append("file", selectedValues.profile_pic);
      const res = await api(`/upload-profile-image`, formData, "postFile");
      if (res && res.success) {
        selectedValues.profile_pic = res.data.url;
      }
    }
    if (!selectedValues.profile_pic) {
      selectedValues.profile_pic = "";
    }

    const formData = new FormData();
    Object.keys(selectedValues).forEach((fieldName) => {
      formData.append(fieldName, selectedValues[fieldName]);
    });

    try {
      const response = await api(
        `/user/${user?.uniqueId}`,
        selectedValues,
        "patch"
      );
      toast.success(response.success);
    } catch (err) {
      const error = err as Error & { error: string };
      console.log(error);
      toast.error(error.error);
    } finally {
      setSubmitting(false);
      setReload(!reload);
    }
  };

  return (
    <FlexContainer variant="column-start" gap="2xl">
      <ActionArea
        heading="Profile"
        subheading="Profile Settings"
        title="Profile / Edit"
      />

      {!loading && (
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
          }) => (
            <Form>
              <div className="block md:flex gap-[20px]">
                <div className="md:grid md:grid-cols-2 gap-5 bg-white p-5 rounded-xl border w-full md:w-[70%] md:mb-0">
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
                    value={values.fname}
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
                    value={values.lname}
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
                    placeholder="Enter your email address or phone number"
                    radius="sm"
                    classNames={{
                      label: "font-medium text-zinc-900",
                      inputWrapper: "border shadow-none",
                    }}
                    disabled
                    value={values.email}
                  />

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
                    value={values.company_name}
                    disabled
                  />
                </div>
                <div className="w-full md:w-[30%] bg-white p-5 rounded-xl border">
                  <div className="max-w-sm mx-auto bg-white rounded-lg shadow-md overflow-hidden items-center">
                    <div
                      id="image-preview"
                      className="max-w-sm p-6 bg-white border-dashed border-2 border-gray-400 rounded-lg items-center mx-auto text-center cursor-pointer"
                    >
                      {selectImg ? (
                        <>
                          <img
                            src={(selectImg as string) || ""}
                            className="max-h-48 rounded-lg mx-auto"
                          />
                          <Button
                            className="bg-red-100 mt-3"
                            onClick={handleImageRemove}
                            size={"icon"}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <input
                            id="profile_pic"
                            type="file"
                            name="profile_pic"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              if (
                                e.currentTarget.files &&
                                e.currentTarget.files.length > 0
                              ) {
                                previewImage(e);
                                setFieldValue(
                                  "profile_pic",
                                  e.currentTarget.files[0]
                                );
                              } else {
                                toast.error("No image selected");
                              }
                            }}
                          />

                          <label
                            htmlFor="profile_pic"
                            className="cursor-pointer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="w-8 h-8 text-gray-700 mx-auto mb-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                              />
                            </svg>
                            <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-700">
                              Upload Profile Image
                            </h5>
                            <p className="font-normal text-sm text-gray-400 md:px-6">
                              Choose photo size should be less than{" "}
                              <b className="text-gray-600">2mb</b>
                            </p>
                            <p className="font-normal text-sm text-gray-400 md:px-6">
                              and should be in{" "}
                              <b className="text-gray-600">JPG, JPEG</b> format.
                            </p>
                            <span
                              id="filename"
                              className="text-gray-500 bg-gray-200 z-50"
                            ></span>
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex bg-[#F8F8F8] rounded-[12px] mt-5 p-4">
                <Button
                  type="submit"
                  variant={"default"}
                  isLoading={isSubmitting}
                >
                  Submit
                </Button>
                {/* <div>
                  <button
                    type="submit"
                    name="submit"
                    className={`py-[12px] px-[48px] text-center text-white w-full rounded-[12px] text-[18px] ${
                      isSubmitting ? "bg-gray-300" : "bg-[#1C1C20]"
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div> */}
              </div>
            </Form>
          )}
        </Formik>
      )}
    </FlexContainer>
  );
}

export default Profile;
