import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import FlexContainer from "../../components/layout/FlexContainer";

const MaterialManagement = () => {
  const navigate = useNavigate();
  const heading = "Management";
  const subheading = "Material";
  const title = "Manage Materials";
  const showButton = true;
  const buttonHref = "vendors";
  const buttonText = "Vendors Management";

  return (
    <FlexContainer variant="column-start" gap="xl">
      <FlexContainer
        variant="row-between"
        alignItems="center"
        className={"p-3 bg-white border rounded-xl"}
      >
        <FlexContainer variant="row-start" gap="lg" className={"items-center"}>
          <button
            onClick={() => {
              navigate(-1);
            }}
            className="p-2 bg-zinc-100 hover:border-zinc-300 rounded-lg border duration-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <FlexContainer variant="column-start" className={"gap-0"}>
            <FlexContainer gap="sm" className={"items-center"}>
              <span className="text-sm">{heading}</span>
              <span className="text-sm">
                {subheading ? `/ ${subheading}` : null}
              </span>
            </FlexContainer>
            <h3 className="-mt-1.5 text-lg font-semibold">{title}</h3>
          </FlexContainer>
        </FlexContainer>
        <FlexContainer className={"items-center"}>
          <Link to={"inventory"}>
            <Button variant="outline">In House Inventory</Button>
          </Link>
          <Link to="categories">
            <Button variant="outline">Category Config</Button>
          </Link>
          <Link to={"market-items"}>
            <Button variant="outline">Market Management</Button>
          </Link>
          <Link to={"purchase-order"}>
            <Button variant="outline">Purchases</Button>
          </Link>
          <Link to={buttonHref}>
            <Button>{buttonText}</Button>
          </Link>
        </FlexContainer>
      </FlexContainer>
      <div className="p-5 bg-white border rounded-xl grid grid-cols-3 gap-3 lg:grid-cols-4 *:flex-1">
        <Link to={"kitchen"}>
          <FlexContainer
            variant="column-center"
            gap="none"
            className={"bg-zinc-900 text-white rounded-xl px-3 py-5 border"}
          >
            <h3 className="text-lg font-semibold">Kitchen Management</h3>
          </FlexContainer>
        </Link>
        <Link to={"laundry"}>
          <FlexContainer
            variant="column-center"
            gap="none"
            className={"bg-zinc-900 text-white rounded-xl px-3 py-5 border"}
          >
            <h3 className="text-lg font-semibold">Laundry Management</h3>
          </FlexContainer>
        </Link>
        <Link to={"house-keeping"}>
          <FlexContainer
            variant="column-center"
            gap="none"
            className={"bg-zinc-900 text-white rounded-xl px-3 py-5 border"}
          >
            <h3 className="text-lg font-semibold">House Keeping Management</h3>
          </FlexContainer>
        </Link>
        <Link to={"electronics"}>
          <FlexContainer
            variant="column-center"
            gap="none"
            className={"bg-zinc-900 text-white rounded-xl px-3 py-5 border"}
          >
            <h3 className="text-lg font-semibold">Electronics Management</h3>
          </FlexContainer>
        </Link>
      </div>
    </FlexContainer>
  );
};

export default MaterialManagement;
