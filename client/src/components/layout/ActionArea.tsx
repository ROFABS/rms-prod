import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import FlexContainer from "./FlexContainer";

type ActionAreaProps = {
  heading: string;
  subheading: string;
  title: string;
  showButton?: boolean;
  buttonText?: string;
  buttonHref?: string;
  showExtraButton?: boolean;
  extraButtonText?: string;
  extraButtonHref?: string;
  previousUrl?: string;
};

const ActionArea = ({
  heading,
  subheading,
  title,
  showButton = false,
  buttonText,
  buttonHref,
  showExtraButton = false,
  extraButtonText,
  extraButtonHref,
  previousUrl,
}: ActionAreaProps) => {
  const navigate = useNavigate();
  return (
    <FlexContainer
      variant="row-between"
      className="p-3 rounded-xl bg-white border"
    >
      <FlexContainer variant="row-start" gap="lg" className={"items-center"}>
        <button
          onClick={() => {
            if (previousUrl) {
              navigate(previousUrl);
            } else {
              navigate(-1);
            }
          }}
          className="p-2.5 bg-white hover:border-zinc-300 rounded-lg border duration-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <FlexContainer variant="column-start" gap="none">
          <FlexContainer gap="none" className={"items-center"}>
            <span className="text-sm">{heading} </span>
            <span className="text-sm">
              {subheading ? ` / ${subheading}` : null}
            </span>
          </FlexContainer>
          <h3 className="-mt-1.5 text-lg font-semibold">{title}</h3>
        </FlexContainer>
      </FlexContainer>
      <FlexContainer variant="row-end" gap="lg" className={"items-center"}>
        {showExtraButton && extraButtonHref && (
          <Link to={extraButtonHref}>
            <Button variant="outline">{extraButtonText}</Button>
          </Link>
        )}
        {showButton && buttonHref && (
          <Link to={buttonHref}>
            <Button variant="default" color="primary">
              {buttonText}
            </Button>
          </Link>
        )}
      </FlexContainer>
    </FlexContainer>
  );
};

export default ActionArea;
