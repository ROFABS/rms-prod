// import FlexContainer from "@/components/layout/FlexContainer";
// import { Button } from "@/components/ui/button";
// import { api } from "@/lib/api/api";
// import { useGlobalContext } from "@/store/GlobalContext";
// import { Input, Link } from "@nextui-org/react";
// import { Form, Formik } from "formik";
// import { Eye, EyeOff } from "lucide-react";
// import React, { useCallback, useEffect } from "react";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import * as Yup from "yup";

// function Login() {
//   const { user } = useGlobalContext();
//   const navigate = useNavigate();
//   const [showPassword, setShowPassword] = React.useState(false);

//   const navigateToDashboard = useCallback(() => {
//     navigate("/dashboard");
//   }, [navigate]);

//   const navigateToOnboarding = useCallback(() => {
//     navigate("/onboarding");
//   }, [navigate]);

//   const navigateToDayclose = useCallback(() => {
//     navigate("/day-close");
//   }, [navigate]);

//   // useEffect(() => {
//   //   const local_data = JSON.parse(localStorage.getItem("_session") as string);
//   //   if (local_data) {
//   //     console.log(local_data);
//   //     if (local_data?.user?.isOnboarded) {
//   //       if (local_data?.user?.dayEnded || !local_data?.user?.dayStarted) {
//   //         navigateToDayclose();
//   //       } else {
//   //         navigateToDashboard();
//   //       }
//   //     } else if (!local_data?.user?.isOnboarded) {
//   //       navigateToOnboarding();
//   //     }
//   //   }
//   // }, []);

//   const validationSchema = Yup.object().shape({
//     email: Yup.string()
//       .email("Invalid email address")
//       .required("Email is required"),
//     password: Yup.string().required("Password is required"),
//   });

//   const handleSubmit = async (values: any) => {
//     try {
//       const response = await api("/login", values, "post");
//       toast.success(response.success);
//       navigate("/dashboard");
//       localStorage.setItem("_session", JSON.stringify(response.data));
//     } catch (err) {
//       const error = err as Error & {
//         error: string & { email: string } & { password: string };
//       };
//       console.log(error);
//       toast.error(
//         error?.error?.email ||
//           error?.error?.password ||
//           error?.error ||
//           "An error occurred"
//       );
//     }
//   };

//   return (
//     <div className="relative h-screen flex items-center justify-center">
//       <div className="lg:p-8">
//         <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[375px]">
//           <div className="flex flex-col space-y-2 text-center">
//             <h1 className="text-2xl font-semibold tracking-tight">
//               Login to your account
//             </h1>
//             <p className="text-muted-foreground text-[14px]">
//               Enter your email below to login to your account
//             </p>
//             <Formik
//               initialValues={{ email: "", password: "" }}
//               validationSchema={validationSchema}
//               onSubmit={handleSubmit}
//             >
//               {({ values, errors, touched, setFieldValue, isSubmitting }) => (
//                 <Form>
//                   <div className="mt-5 grid gap-3">
//                     <Input
//                       type="text"
//                       name="email"
//                       label="Email"
//                       labelPlacement="outside"
//                       placeholder="Enter your email address or phone number"
//                       radius="sm"
//                       classNames={{
//                         label: "font-medium text-zinc-900",
//                         inputWrapper: "border shadow-none",
//                       }}
//                       onChange={(e) => {
//                         setFieldValue("email", e.target.value);
//                       }}
//                       isInvalid={!!(errors.email && touched.email)}
//                       color={
//                         errors.email && touched.email ? "danger" : "default"
//                       }
//                       errorMessage={
//                         errors.email && touched.email && errors.email
//                       }
//                     />

//                     <Input
//                       type={showPassword ? "text" : "password"}
//                       name="password"
//                       label="Password"
//                       labelPlacement="outside"
//                       placeholder="Enter your password"
//                       radius="sm"
//                       classNames={{
//                         label: "font-medium text-zinc-900",
//                         inputWrapper: "border shadow-none",
//                       }}
//                       onChange={(e) => {
//                         setFieldValue("password", e.target.value);
//                       }}
//                       endContent={
//                         <span
//                           className="p-2 bg-white border rounded-md cursor-pointer"
//                           onClick={() => {
//                             setShowPassword(!showPassword);
//                           }}
//                         >
//                           {showPassword ? (
//                             <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
//                           ) : (
//                             <Eye className="w-3.5 h-3.5 text-zinc-500" />
//                           )}
//                         </span>
//                       }
//                       isInvalid={!!(errors.password && touched.password)}
//                       color={
//                         errors.password && touched.password
//                           ? "danger"
//                           : "default"
//                       }
//                       errorMessage={
//                         errors.password && touched.password && errors.password
//                       }
//                     />

//                     <Button
//                       isLoading={isSubmitting}
//                       variant={"default"}
//                       type="submit"
//                       className="mt-5"
//                     >
//                       Login
//                     </Button>
//                   </div>
//                 </Form>
//               )}
//             </Formik>
//           </div>
//           <div className="block justify-between items-center mb-5 md:flex">
//             <span className="text-sm block">Having trouble signing in </span>
//             <Link href="/auth/forgot-password" className="cursor-pointer">
//               <span className="text-primary text-sm">
//                 forgot your password?
//               </span>
//             </Link>
//           </div>
//           <hr></hr>
//           {/* <Button
//             as={Link}
//             color="primary"
//             variant="light"
//             className="font-[400] text-lg"
//             onClick={() => navigate("/register")}
//           >
//             Create your account
//           </Button> */}
//           <FlexContainer variant="row-between">
//             <Link
//               href="/"
//               className="text-xs text-muted-foreground px-2 py-1 bg-zinc-200 rounded-md"
//             >
//               Back to Home
//             </Link>
//           </FlexContainer>
//           <Link href="/auth/register">
//             <Button variant={"ghost"} className="w-full">
//               Create your account
//             </Button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;


































/////////////////////////////////////////////////////////////////new automatic login /////////////////////////////////////////////////////////////////////////////






import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "@/lib/api/api";
import { useGlobalContext } from "@/store/GlobalContext";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useGlobalContext(); // Assuming you can set user in global context

  const loginAutomatically = useCallback(async () => {
    try {
      // Hardcoded credentials
      const credentials = { email: "jayandraa5@gmail.com", password: "password" };

      // Call the login API
      const response = await api("/login", credentials, "post");

      // Save session and update global context
      localStorage.setItem("_session", JSON.stringify(response.data));
      setUser(response.data.user); // Assuming you have a setUser function in your global context

      toast.success("Logged in automatically");
      navigate("/ksr/create-order?tableId=05e12443-f281-4403-93fe-1d893e1eb1fb&typeOfSale=dine-in&tableNumber="1""/); // Redirect to the dashboard
    } catch (err) {
      console.error("Auto-login failed", err);
      toast.error("Auto-login failed. Please try again.");
    }
  }, [navigate, setUser]);

  useEffect(() => {
    // Check for existing session
    const localData = JSON.parse(localStorage.getItem("_session") as string);
    if (localData && localData.user) {
      // If session exists, redirect directly
      // const tableNumber = 1; // or any dynamic value
      // navigate(`/ksr/create-order?tableId=05e12443-f281-4403-93fe-1d893e1eb1fb&typeOfSale=dine-in&tableNumber=${tableNumber}`);

       navigate("/ksr/create-order?tableId=05e12443-f281-4403-93fe-1d893e1eb1fb&typeOfSale=dine-in&tableNumber=1");
    } else {
      // Otherwise, attempt to login automatically
      loginAutomatically();
    }
  }, [loginAutomatically, navigate]);

  return null; // Since the user won't see the login screen
}

export default Login;
