import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Badge } from "@/components/ui/badge";
import { API_TAGS } from "@/lib/consts/API_TAGS";
import { API_URL } from "@/lib/consts/app";
import useGet from "@/lib/hooks/use-get";
import { useGlobalContext } from "@/store/GlobalContext";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useEffect } from "react";
import SessionCard from "./SessionCard";
import { KsrSession } from "./types";

const ViewAllSession = () => {
  // const { id } = useParams<{ tableId: string }>();
  const { selectedRestaurant } = useGlobalContext();
  const { data, error, loading, getData } = useGet<KsrSession[]>({
    showToast: false,
  });

  useEffect(() => {
    if (selectedRestaurant) {
      getData(
        `${API_URL}/ksr/session/all?restaurantId=${selectedRestaurant.uniqueId}`,
        API_TAGS.GET_KSR_ORDER_HISTORY
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant]);
  return (
    <FlexContainer variant="column-start" gap="xl">
      <ActionArea
        heading="Sessions"
        subheading="Active"
        title="View Active Session"
      />
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && data.length === 0 && (
        <div className="text-center text-lg font-semibold">
          No Active Sessions
        </div>
      )}
      <div className="grid grid-cols-2 gap-5">
        {" "}
        {data &&
          data?.map((session) => (
            <SessionCard key={session.sessionId} session={session} />
            // <FlexContainer variant="column-start" key={session.id}>
            //   <FlexContainer variant="row-between" className="px-5">
            //     <p className="font-semibold">{session?.table?.tableNumber}</p>
            //     <p className="font-semibold">{session?.status}</p>
            //   </FlexContainer>
            //   {session?.orders?.map((order) => (
            //     <FlexContainer
            //       variant="column-start"
            //       className="p-5 bg-white border rounded-xl"
            //     >
            //       <FlexContainer variant="row-start" gap="xl">
            //         <p className="text-sm font-medium">
            //           Order ID : #{order.orderId}
            //         </p>
            //         <p className="text-sm font-medium">
            //           Subtotal : {order.subTotal}
            //         </p>
            //         <p className="text-sm font-medium">
            //           Total : {order.totalPrice}
            //         </p>
            //       </FlexContainer>
            //       {/* //products */}
            //       <Table shadow="none" className="border rounded-xl">
            //         <TableHeader>
            //           <TableColumn>
            //             <p>Product</p>
            //           </TableColumn>
            //           <TableColumn>
            //             <p>Quantity</p>
            //           </TableColumn>
            //           <TableColumn>
            //             <p>Price</p>
            //           </TableColumn>
            //         </TableHeader>
            //         <TableBody>
            //           {order.products.map((product) => (
            //             <TableRow key={product.id}>
            //               <TableCell>
            //                 <p>{product.productName}</p>
            //               </TableCell>
            //               <TableCell>
            //                 <p>{product.quantity}</p>
            //               </TableCell>
            //               <TableCell>
            //                 <p>{product.price}</p>
            //               </TableCell>
            //             </TableRow>
            //           ))}
            //         </TableBody>
            //       </Table>
            //     </FlexContainer>
            //   ))}
            // </FlexContainer>
          ))}
      </div>
    </FlexContainer>
  );
};

export default ViewAllSession;
