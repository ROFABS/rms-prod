import { cn } from "@nextui-org/react";
import React from "react";
import FlexContainer from "./FlexContainer";

type TabProps = {
  title: string;
  isActiveTab: boolean;
  isError?: boolean;
  onClick: () => void;
};

export const BORDER_EFFECT =
  "bg-white hover:border-zinc-300 border duration-100";

export const BORDER_EFFECT_ACTIVE =
  "bg-zinc-900 border-zinc-900 text-zinc-100 hover:bg-zinc-700 hover:border-zinc-700 duration-100";

export const BORDER_EFFECT_ERROR =
  "bg-red-100 border-red-300 text-red-500 hover:bg-red-200 hover:border-red-400 duration-100";

export const Tab = ({
  title,
  isActiveTab,
  isError,
  onClick,
  ...props
}: TabProps) => {
  return (
    <div
      className={cn(
        "px-3 py-2 font-medium text-sm rounded-xl cursor-pointer active:scale-95 text-nowrap",
        BORDER_EFFECT,
        isActiveTab && BORDER_EFFECT_ACTIVE,
        isError && BORDER_EFFECT_ERROR
      )}
      onClick={onClick}
      {...props}
    >
      {title}
    </div>
  );
};

export const TabContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <FlexContainer variant="row-start" gap="lg">
      {children}
    </FlexContainer>
  );
};
