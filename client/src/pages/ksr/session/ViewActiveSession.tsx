import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { API_TAGS } from "@/lib/consts/API_TAGS";
import { API_URL } from "@/lib/consts/app";
import useGet from "@/lib/hooks/use-get";
import { useGlobalContext } from "@/store/GlobalContext";
import { useEffect } from "react";
import SessionCard from "./SessionCard";
import { KsrSession } from "./types";

const ViewActiveSession = () => {
  // const { id } = useParams<{ tableId: string }>();
  const { selectedRestaurant } = useGlobalContext();
  const { data, error, loading, getData } = useGet<KsrSession[]>({
    showToast: false,
  });

  useEffect(() => {
    if (selectedRestaurant) {
      getData(
        `${API_URL}/ksr/session/active?restaurantId=${selectedRestaurant.uniqueId}`,
        API_TAGS.GET_ACTIVE_SESSIONS
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant]);
  return (
    <FlexContainer variant="column-start" gap="xl">
      <ActionArea
        heading="Orders"
        subheading="Active"
        title="View Active Orders"
      />
      {error && <p>Error: {error.message}</p>}
      {data && data.length === 0 && <p>No Active Orders</p>}
      {!loading && data && (
        <div className="grid grid-cols-2 gap-5">
          {data.map((session) => (
            <SessionCard
              key={session.sessionId}
              session={session}
              isActiveSession
            />
          ))}
        </div>
      )}
      {loading &&
        [...Array(5)].map((_, index) => {
          return (
            <FlexContainer
              variant="column-start"
              key={index}
              wrap="nowrap"
              className="relative p-10 rounded-xl border bg-white w-full animate-pulse"
            >
              <div className="flex justify-between">
                <div className="w-1/4 h-4 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="w-1/4 h-4 bg-gray-200 rounded-md  animate-pulse delay-75"></div>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-md animate-pulse delay-100"></div>
              <div className="w-full h-4 bg-gray-200 rounded-md animate-pulse delay-150"></div>
            </FlexContainer>
          );
        })}
    </FlexContainer>
  );
};

export default ViewActiveSession;
