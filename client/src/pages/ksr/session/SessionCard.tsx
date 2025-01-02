import FlexContainer from "@/components/layout/FlexContainer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { KsrSession } from "./types";

interface SessionCardProps {
  session: KsrSession;
  isActiveSession?: boolean;
}

const SessionCard = ({
  session,
  isActiveSession = false,
}: SessionCardProps) => {
  const navigate = useNavigate();

  return (
    <FlexContainer
      key={session.billId}
      variant="column-start"
      className={cn(
        "relative p-3 bg-white rounded-xl border duration-200",
        isActiveSession && "cursor-pointer hover:shadow-xl"
      )}
      onClick={() => {
        if (isActiveSession) {
          navigate(
            `/ksr/create-order?tableId=${session.table.uniqueId}&typeOfSale=${session.typeOfSale}&tableNumber=${session.table.tableNumber}`
          );
        }
      }}
    >
      <FlexContainer variant="row-between" className="mb-2" alignItems="center">
        <span className="text-xs font-semibold">BILL: {session?.billId}</span>
        <Badge>{session?.table?.tableNumber}</Badge>
      </FlexContainer>

      <FlexContainer variant="column-start" gap="sm">
        {session?.orders.map((order) => {
          return (
            <FlexContainer
              variant="column-start"
              gap="sm"
              className="relative p-2 bg-indigo-50 rounded-xl border min-w-fit"
            >
              <FlexContainer
                variant="row-start"
                gap="xs"
                className="text-black"
              >
                <p className="text-xs font-medium">
                  ORDER ID : #{order.orderId}
                </p>
              </FlexContainer>
              <FlexContainer variant="row-between" alignItems="center">
                <FlexContainer>
                  {" "}
                  <p className="text-xs font-medium">
                    SUBTOTAL : {order.subTotal}
                  </p>
                  <p className="text-xs font-medium">TAX : {order.taxAmount}</p>
                  <p className="text-xs font-medium">
                    DISCOUNT : {order.discountAmount}
                  </p>
                </FlexContainer>
                <p className="text-xs font-medium">
                  TOTAL : {order.totalPrice}
                </p>
              </FlexContainer>

              <div className="p-3 bg-indigo-100 rounded-xl">
                <div className="grid grid-cols-3 gap-2 text-left text-black pb-2 border-b border-b-indigo-200">
                  <span className="text-xs font-semibold">NAME</span>
                  <span className="text-xs font-semibold">PRICE</span>
                  <span className="text-xs font-semibold">QUANTITY</span>
                </div>
                {order.products.map((product) => {
                  return (
                    <div
                      key={product.uniqueId}
                      className="py-2 last:pb-0 grid grid-cols-3 gap-2 text-left border-b border-b-indigo-200 last:border-b-0 text-black"
                    >
                      <span className="text-xs break-all">
                        {product.productName}
                      </span>
                      <span className="text-xs">₹{product.price}</span>
                      <span className="text-xs">{product.quantity}</span>
                    </div>
                  );
                })}
              </div>
            </FlexContainer>
          );
        })}
      </FlexContainer>
      <div className="px-3 rounded-xl grid gap-3">
        <FlexContainer variant="row-between">
          <span className="text-sm">Bill Amount</span>
          <span className="text-sm">₹{session.billAmount}</span>
        </FlexContainer>
        <FlexContainer variant="row-between">
          <span className="text-sm">Amount Paid</span>
          <span className="text-sm">₹{session.totalPaid}</span>
        </FlexContainer>
      </div>
    </FlexContainer>
  );
};

export default SessionCard;
