import useStorage from "@/lib/hooks/use-storage";
import { cn } from "@/lib/utils";
import { useGlobalContext } from "@/store/GlobalContext";
import { AnimatePresence } from "framer-motion";
import {
  CalendarCheck2,
  ChartNoAxesGantt,
  ChefHat,
  ChevronsLeft,
  Container,
  LayoutDashboard,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import FlexContainer from "./FlexContainer";
import Navbar from "./Navbar";
import SideBarLink from "./SideBarLink";

const Root = () => {
  const { user } = useGlobalContext();

  const { getItem, setItem } = useStorage({
    storageType: "local",
  });

  const navigate = useNavigate();
  const pathname = window.location.pathname;

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(
    JSON.parse(getItem("isSidebarOpen") as string) ?? true
  );

  useEffect(() => {
    if (pathname === "/") {
      navigate("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AnimatePresence>
      <FlexContainer
        variant="row-start"
        gap="none"
        className={"w-full h-full items-stretch"}
      >
        <FlexContainer
          variant="column-start"
          className={cn(
            "border border-r min-h-screen duration-300 ease-in-out bg-white",
            isSidebarOpen ? "min-w-[250px]" : "w-[75px]"
          )}
          gap="none"
        >
          <FlexContainer
            variant="row-between"
            className="py-6 px-5 w-full items-center relative"
          >
            {/* {isSidebarOpen ? (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src="/logo.png"
                className="w-auto h-[25px] object-contain"
                alt="logo_initial"
              />
            ) : (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src="/logo_initials.png"
                className="h-auto w-[25px] object-contain"
                alt="logo_initial"
              />
            )} */}
            {isSidebarOpen ? (
              <h3 className="text-xl font-semibold text-zinc-900 px-1.5">
                Rofabs
              </h3>
            ) : (
              <h3 className="text-xl font-semibold text-zinc-900 px-1.5">R.</h3>
            )}

            <button
              className={cn(
                "absolute top-5 p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 duration-200 ease-in-out z-[840]",
                isSidebarOpen ? "right-3" : "-right-12"
              )}
              onClick={() => {
                setIsSidebarOpen(!isSidebarOpen);
                setItem("isSidebarOpen", `${!isSidebarOpen}`);
              }}
            >
              <ChevronsLeft className="w-4 h-4 text-white" />
            </button>
          </FlexContainer>
          <SideBarLink
            label="Dashboard"
            link="/dashboard"
            Icon={LayoutDashboard}
            sideBarStatus={isSidebarOpen}
          />
          <SideBarLink
            label="KSR"
            link="/ksr"
            Icon={ChefHat}
            sideBarStatus={isSidebarOpen}
          />


          <SideBarLink
            label="Channels Menu"
            link="/channelsmenu"
            Icon={ChefHat}
            sideBarStatus={isSidebarOpen}
          />



          <SideBarLink
            label="Day Close"
            link="/day-close"
            Icon={CalendarCheck2}
            sideBarStatus={isSidebarOpen}
          />

          <SideBarLink
            label="Material Management"
            link="/material-management"
            Icon={ChartNoAxesGantt}
            sideBarStatus={isSidebarOpen}
          />
          
          <SideBarLink
            label="Channels"
            link="/channels"
            Icon={Container}
            sideBarStatus={isSidebarOpen}
          />
          <SideBarLink
            label="NotificationSystem"
            link="/NotificationSystem"
            Icon={Container}
            sideBarStatus={isSidebarOpen}
          />
          {user?.role === "owner" && (
            <SideBarLink
              label="Users"
              link="/users"
              Icon={User}
              sideBarStatus={isSidebarOpen}
            />
          )}
        </FlexContainer>
        <FlexContainer
          variant="column-start"
          gap="none"
          className={"w-full h-full"}
        >
          <Navbar />
          <FlexContainer
            variant="column-start"
            gap="none"
            className={
              "w-full p-5 h-full overflow-x-auto max-h-[calc(100vh_-_80px)] overflow-y-auto"
            }
          >
            <Outlet />
          </FlexContainer>
        </FlexContainer>
      </FlexContainer>
    </AnimatePresence>
  );
};

export default Root;
