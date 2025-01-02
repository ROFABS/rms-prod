import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";

import { NextUIProvider } from "@nextui-org/react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Link,
  Route,
  RouterProvider,
} from "react-router-dom";
import Root from "./components/layout/Root";
import ProtectedRoutes from "./components/system/ProtectedRoutes";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Channels from "./pages/channels";
import ChannelConfig from "./pages/channels/config";
import Dashboard from "./pages/dashboard/Dashboard";
import ViewStats from "./pages/dashboard/ViewStats";
import KsrConfig from "./pages/ksr/config/Config";
import EditDish from "./pages/ksr/config/EditDish";
import EditRestaurantConfig from "./pages/ksr/config/EditRestaurantConfig";
import MenuConfig from "./pages/ksr/config/MenuConfig";
import RestrauntConfig from "./pages/ksr/config/RestrauntConfig";
import TaxConfig from "./pages/ksr/config/TaxConfig";
import CreateOrder from "./pages/ksr/CreateOrder";
import DayClose from "./pages/ksr/day-close";
import KSRInventory from "./pages/ksr/Inventory";
import KsrReports from "./pages/ksr/KsrReports";
import ViewActiveSession from "./pages/ksr/session/ViewActiveSession";
import ViewAllSession from "./pages/ksr/session/ViewAllSession";
import AddSubCategories from "./pages/material-management/categories/AddSubCategories";
import MaterialCategories from "./pages/material-management/categories/MaterialCategories";
import ElectronicManagement from "./pages/material-management/electronics/ElectronicManagement";
import HouseKeepingManagement from "./pages/material-management/house-keeping/HouseKeepingManagement";
import InHouseInventory from "./pages/material-management/in-house/InHouseInventory";
import ConsumptionReportKitchen from "./pages/material-management/kitchen/ConsumptionReport";
import KitchenManagement from "./pages/material-management/kitchen/KitchenManagement";
import ConfigLaundry from "./pages/material-management/laundry/ConfigLaundry";
import LaundryManagement from "./pages/material-management/laundry/LaundryManagement";
import CreateMarketItems from "./pages/material-management/market-items/CreateMarketItems";
import ManageMarketItems from "./pages/material-management/market-items/ManageMarketItems";
import MaterialManagement from "./pages/material-management/MaterialManagement";
import CreatePurchaseOrder from "./pages/material-management/purchase/CreatePurchaseOrder";
import ManagePurchaseOrder from "./pages/material-management/purchase/ManagePurchaseOrder";
import AddVendor from "./pages/material-management/vendors/AddVendor";
import VendorsManagement from "./pages/material-management/vendors/VendorsManagement";
import OnBoardUser from "./pages/property/OnBoardUser";
import AddUser from "./pages/users/AddUser";
import ChangePassword from "./pages/users/ChangePassword";
import ListUser from "./pages/users/ListUser";




import Channelsmenu from "./pages/channelsmenu";




import Profile from "./pages/users/Profile";
import { GlobalProvider } from "./store/GlobalContext";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Root />}>
          {/* protected routes start */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/stats" element={<ViewStats />} />

          <Route path="users">
            <Route index element={<ListUser />} />
            <Route path=":id" element={<div>User</div>} />
            <Route path="create" element={<AddUser />} />
          </Route>















          <Route path="ksr">
            <Route index element={<KSRInventory />} />
            <Route path="reports" element={<KsrReports />} />
            <Route path="create-order" element={<CreateOrder />} />
            <Route path="sessions">
              <Route path="active" element={<ViewActiveSession />} />
              <Route path="all" element={<ViewAllSession />} />
            </Route>
            <Route path="settings">
              <Route index element={<KsrConfig />} />
              <Route path="restaurant">
                <Route index element={<RestrauntConfig />} />
                <Route path=":id" element={<EditRestaurantConfig />} />
              </Route>
              <Route path="menu">
                <Route index element={<MenuConfig />} />
                <Route path="dish">
                  <Route path=":id" element={<EditDish />} />
                </Route>
              </Route>
              <Route path="tax" element={<TaxConfig />} />
            </Route>
          </Route>
          <Route path="day-close" element={<DayClose />} />
          <Route path="material-management">
            <Route index element={<MaterialManagement />} />
            <Route path="purchase-order">
              <Route index element={<ManagePurchaseOrder />} />
              <Route path="create" element={<CreatePurchaseOrder />} />
            </Route>
            <Route path="inventory" element={<InHouseInventory />} />
            <Route path="market-items">
              <Route index element={<ManageMarketItems />} />
              <Route path="create" element={<CreateMarketItems />} />
            </Route>
            <Route path="categories">
              <Route index element={<MaterialCategories />} />
              <Route path="sub-categories/add" element={<AddSubCategories />} />
            </Route>
            <Route path="vendors">
              <Route index element={<VendorsManagement />} />
              <Route path="add">
                <Route index element={<AddVendor />} />
              </Route>
              {/* <Route path="edit" element={<EditVendor />} /> */}
              {/* <Route path="details">
                <Route path=":id" element={<VendorDetails />} />
              </Route> */}
            </Route>
            <Route path="kitchen">
              <Route index element={<KitchenManagement />} />
              <Route
                path="consumption-report"
                element={<ConsumptionReportKitchen />}
              />
            </Route>
            <Route path="laundry">
              <Route index element={<LaundryManagement />} />
              <Route path="config" element={<ConfigLaundry />} />
            </Route>
            <Route path="house-keeping">
              <Route index element={<HouseKeepingManagement />} />

              {/* <Route
                path="consumption-report"
                element={<ConsumptionReportHouseKeeping />}
              /> */}
            </Route>
            <Route path="electronics">
              <Route index element={<ElectronicManagement />} />
              {/* <Route
                path="consumption-report"
                element={<ConsumptionReportElectronics />}
              /> */}
            </Route>
            {/* <Route path="kits-&-complementary">
              <Route index element={<KitsAndComplementaryManagement />} />
              <Route path="create" element={<CreateKitsAndComplementary />} />
            </Route> */}
          </Route>



          <Route path="channelsmenu" element={<Channelsmenu />} />



          <Route path="channels">
            <Route index element={<Channels />} />
            <Route path="config" element={<ChannelConfig />} />
          </Route>
          <Route path="onboarding" element={<OnBoardUser />} />
        </Route>



          







        {/* protected routes end */}
      </Route>
      <Route path="auth">
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="reset" element={<ResetPassword />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="verify/:token" element={<VerifyEmail />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>
      <Route
        path="*"
        element={
          <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="text-lg">Page Not Found</p>
            <Link to="/" className="text-blue-500 underline">
              Go Home
            </Link>
          </div>
        }
      />
    </Route>
  )
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NextUIProvider>
      <GlobalProvider>
        <RouterProvider router={router} />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#000",
              color: "#fff",
              borderRadius: "99px",
              // fontFamily: "Rubik",
              fontWeight: "500",
            },
          }}
        />
      </GlobalProvider>
    </NextUIProvider>
  </StrictMode>
);
