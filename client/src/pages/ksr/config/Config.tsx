import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Link } from "react-router-dom";

const KsrConfig = () => {
  return (
    <FlexContainer variant="column-start" gap="xl">
      <ActionArea
        heading={"KSR"}
        subheading={"Config"}
        title={"Manage KSR Configurations"}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 *:flex-1 p-5 border bg-white rounded-xl gap-5">
        <Link to={"restaurant"}>
          <FlexContainer
            variant="column-center"
            gap="none"
            className={"bg-zinc-100 rounded-xl p-3 border"}
          >
            <h3 className="text-lg font-semibold">Restaurant Layout</h3>
            <p className="text-sm font-semibold">Restaurant Configurations</p>
          </FlexContainer>
        </Link>
        <Link to={"menu"}>
          <FlexContainer
            variant="column-center"
            gap="none"
            className={"bg-zinc-100 rounded-xl p-3 border"}
          >
            <h3 className="text-lg font-semibold">Menu </h3>
            <p className="text-sm font-semibold">Menu Configurations</p>
          </FlexContainer>
        </Link>
        <Link to={"tax"}>
          <FlexContainer
            variant="column-center"
            gap="none"
            className={"bg-zinc-100 rounded-xl p-3 border"}
          >
            <h3 className="text-lg font-semibold">Tax </h3>
            <p className="text-sm font-semibold">Tax Configurations</p>
          </FlexContainer>
        </Link>
        {/* <Link to={"kot"}>
          <FlexContainer
            variant="column-center"
            gap="none"
            className={"bg-zinc-100 rounded-xl p-3 border"}
          >
            <h3 className="text-lg font-semibold">KOT</h3>
            <p className="text-sm font-semibold">KOT Configurations</p>
          </FlexContainer>
        </Link>
        <Link to={"qr-code"}>
          <FlexContainer
            variant="column-center"
            gap="none"
            className={"bg-zinc-100 rounded-xl p-3 border"}
          >
            <h3 className="text-lg font-semibold">QR Code</h3>
            <p className="text-sm font-semibold">QR Code Configurations</p>
          </FlexContainer>
        </Link> */}
      </div>
    </FlexContainer>
  );
};

export default KsrConfig;
