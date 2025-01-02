import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";
import { Link } from "react-router-dom";
import FlexContainer from "./FlexContainer";

type SideBarLinkProps = {
  label: string;
  link: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  sideBarStatus: boolean;
};

const SideBarLink = ({
  label,
  link,
  Icon,
  sideBarStatus,
}: SideBarLinkProps) => {
  const pathname = window.location.pathname;
  // const isActive = pathname.includes(link);

  const isActive = pathname === link;



  return (
    <Link
      to={link}
      className={cn(
        "group py-4 px-5 border border-y-0 border-r-0 border-l-4 border-l-transparent duration-300 ease-in-out hover:bg-zinc-100",

        isActive
          ? "bg-sky-100 border-l-sky-500 hover:bg-sky-100"
          : "bg-white group-hover:bg-zinc-100"
      )}
    >
      <FlexContainer
        variant="row-start"
        gap="md"
        className={cn("items-center")}
      >
        <Icon
          className={cn(
            "w-5 h-5 min-w-5 min-h-5",
            isActive
              ? "text-[#226DF6]"
              : "text-gray-600 group-hover:text-zinc-900"
          )}
        />
        {sideBarStatus && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "text-sm font-medium text-zinc-600 group-hover:text-zinc-900",
              isActive ? "text-[#226DF6]" : ""
            )}
          >
            {label}
          </motion.span>
        )}
      </FlexContainer>
    </Link>
  );
};

export default SideBarLink;
