import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface FlexContainerProps {
  children: React.ReactNode;
  wrap?: "wrap" | "nowrap" | "wrap-reverse";
  gap?:
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "none";
  variant?:
    | "row-center"
    | "column-center"
    | "row-start"
    | "column-start"
    | "row-end"
    | "column-end"
    | "row-between"
    | "column-between";
  alignItems?: "start" | "center" | "end" | "stretch";
  justifyContent?: "start" | "center" | "end" | "between" | "around";
  className?: string;
  onClick?: () => void;
}

const getVariantClass = (variant: FlexContainerProps["variant"]) => {
  switch (variant) {
    case "row-center":
      return "flex-row justify-center items-center";
    case "column-center":
      return "flex-col justify-center items-center";
    case "row-start":
      return "flex-row justify-start items-start";
    case "column-start":
      return "flex-col justify-start items-start *:w-full";
    case "row-end":
      return "flex-row justify-end items-end";
    case "column-end":
      return "flex-col justify-end items-end";
    case "row-between":
      return "flex-row justify-between items-between";
    case "column-between":
      return "flex-col justify-between items-between";
    default:
      return "flex-row justify-start items-start";
  }
};

const getGapClass = (gap: FlexContainerProps["gap"]) => {
  switch (gap) {
    case "xs":
      return "gap-1";
    case "sm":
      return "gap-2";
    case "md":
      return "gap-3";
    case "lg":
      return "gap-4";
    case "xl":
      return "gap-5";
    case "2xl":
      return "gap-6";
    case "3xl":
      return "gap-7";
    case "4xl":
      return "gap-8";
    case "5xl":
      return "gap-9";
    case "none":
      return "gap-0";
    default:
      return "gap-0";
  }
};

const getAlignItemsClass = (alignItems: FlexContainerProps["alignItems"]) => {
  switch (alignItems) {
    case "start":
      return "items-start";
    case "center":
      return "items-center";
    case "end":
      return "items-end";
    case "stretch":
      return "items-stretch";
    default:
      return "";
  }
};

const getJustifyContentClass = (
  justifyContent: FlexContainerProps["justifyContent"]
) => {
  switch (justifyContent) {
    case "start":
      return "justify-start";
    case "center":
      return "justify-center";
    case "end":
      return "justify-end";
    case "between":
      return "justify-between";
    case "around":
      return "justify-around";
    default:
      return "";
  }
};

const getWrapClass = (wrap: FlexContainerProps["wrap"]) => {
  switch (wrap) {
    case "wrap":
      return "flex-wrap";
    case "nowrap":
      return "flex-nowrap";
    case "wrap-reverse":
      return "flex-wrap-reverse";
    default:
      return "flex-wrap";
  }
};

const FlexContainer = forwardRef<HTMLDivElement, FlexContainerProps>(
  (
    {
      children,
      wrap = "nowrap",
      gap = "md",
      variant = "row-start",
      alignItems,
      justifyContent,
      className,
      onClick,
    },
    ref
  ) => {
    const variantClass = getVariantClass(variant);
    const gapClass = getGapClass(gap);
    const wrapClass = getWrapClass(wrap);
    const alignItemsClass = getAlignItemsClass(alignItems);
    const justifyContentClass = getJustifyContentClass(justifyContent);
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          "flex",
          wrapClass,
          gapClass,
          variantClass,
          alignItemsClass,
          justifyContentClass,
          className
        )}
      >
        {children}
      </div>
    );
  }
);

FlexContainer.displayName = "FlexContainer";

export default FlexContainer;
