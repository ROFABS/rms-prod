import FlexContainer from "./FlexContainer";

const Loader = () => {
  return (
    <FlexContainer
      variant="row-center"
      className="w-full px-10 py-10"
      alignItems="center"
    >
      <div className="h-6 w-6 font-medium border-2 border-t-transparent border-zinc-700 rounded-3xl animate-spin" />{" "}
      loading...
    </FlexContainer>
  );
};

export default Loader;
