import { GlobalProvider } from "@/store/GlobalContext";
import { NextUIProvider } from "@nextui-org/react";
import React from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

const Provider = (props: Props) => {
  const navigate = useNavigate();
  return (
    <NextUIProvider navigate={navigate}>
      <GlobalProvider>{props.children}</GlobalProvider>
    </NextUIProvider>
  );
};

export default Provider;
