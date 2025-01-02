import FlexContainer from "@/components/layout/FlexContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/api";
import { API_TAGS } from "@/lib/consts/API_TAGS";
import { API_URL } from "@/lib/consts/app";
import useGet from "@/lib/hooks/use-get";
import { useGlobalContext } from "@/store/GlobalContext";
import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";
import axios from "axios";
import dayjs from "dayjs";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { KsrSession } from "../session/types";
import { KsrOrder, KsrPayment } from "../types";
import { IDayClose, IDayCloseStats } from "./types";

const DayClose = () => {
  const { user, setUser, selectedRestaurant } = useGlobalContext();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [tableId, setTableId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<KsrSession | null>(null);
  const { data, error, getData, loading, refresh } = useGet<IDayCloseStats>({
    showToast: false,
  });
  const [today, setToday] = useState(dayjs().format("YYYY-MM-DD"));
  const {
    data: dayClose,
    error: dayCloseError,
    getData: getDataDayClose,
    loading: loadingDayClose,
    refresh: refreshDayClose,
  } = useGet<IDayClose>({
    showToast: false,
  });

  const navigate = useNavigate();

  const handleStartDay = async () => {
    try {
      const response = await api(
        "/day/start",
        {
          restaurantId: selectedRestaurant?.uniqueId,
          userId: user?.uniqueId,
        },
        "post"
      );
      setUser(response?.user);
      navigate("/dashboard");
      refresh(API_TAGS.GET_DAY_CLOSE, {}, true);
    } catch (error) {
      console.log(error);
      const err = error as Error & { error: string };
      toast.error(err.error);
    }
  };

  const handleEndDay = async () => {
    try {
      const session = localStorage.getItem("_session")
        ? JSON.parse(localStorage.getItem("_session") as string)
        : null;
      if (!session) {
        toast.error("Session not found");
        return;
      }
      const response = await fetch(`${API_URL}/day/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth": session?.token,
        },
        body: JSON.stringify({
          restaurantId: selectedRestaurant?.uniqueId,
        }),
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message);
      }
      const blob = await response.blob();
      console.log(blob, "blob");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      localStorage.removeItem("_session");
      navigate("/auth/login");
    } catch (error) {
      const err = error as Error & { message: string };
      console.log(err, "abc error");
      toast.error(err.message);
    }
  };

  const handleContinue = async () => {
    try {
      const response = await api(
        "/day/continue",
        {
          restaurantId: selectedRestaurant?.uniqueId,
          userId: user?.uniqueId,
        },
        "post"
      );
      setUser(response?.user);
      navigate("/dashboard");
      refreshDayClose(API_TAGS.GET_DAY_CLOSE, {}, true);
    } catch (error) {
      console.log(error);
      const err = error as Error & { error: string };
      toast.error(err.error);
    }
  };

  const handleSettleBill = async () => {
    if (!tableId) {
      toast.error("Please select table");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/ksr/session/complete?tableId=${tableId}`
      );
      refreshDayClose(API_TAGS.GET_DAY_CLOSE, {}, true);
      refresh(API_TAGS.GET_RESTAURANTS, {}, false);
      onOpenChange();
      // navigate(/ksr/sessions/${response.data.data.uniqueId}/payments);
    } catch (error) {
      const err = error as Error & {
        response: { data: { message: string } };
      };
      toast.error(err.response.data.message);
    }
  };

  const handleClose = async () => {
    try {
      const response = await api(
        "/day/close",
        {
          restaurantId: selectedRestaurant?.uniqueId,
          userId: user?.uniqueId,
          uniqueId: dayClose?.uniqueId,
        },
        "post"
      );
      setUser(response?.user);
      navigate("/dashboard");
      refreshDayClose(API_TAGS.GET_DAY_CLOSE, {}, true);
    } catch (error) {
      console.log(error);
      const err = error as Error & { error: string };
      toast.error(err.error);
    }
  };

  useEffect(() => {
    // getData({ url: API_URL.ksr.dayClose, tag: API_TAGS.ksr.dayClose });
    if (selectedRestaurant) {
      getData(
        `${API_URL}/ksr/day-close?restaurantId=${selectedRestaurant.uniqueId}`,
        API_TAGS.GET_DAY_CLOSE_STATS
      );
      getDataDayClose(
        `${API_URL}/day/open?restaurantId=${selectedRestaurant.uniqueId}`,
        API_TAGS.GET_DAY_CLOSE
      );
    }
  }, [selectedRestaurant]);

  console.log(dayClose, "dayClose");

  if (user?.dayStarted && dayClose?.date !== today) {
    return (
      <FlexContainer variant="column-center" gap="2xl" className="min-h-[50vh]">
        <h3 className="text-xl font-semibold">
          {/* continue today */}
          You have pending day close for {dayClose?.date}
        </h3>
        <Button onClick={handleClose}>Close</Button>
      </FlexContainer>
    );
  }

  if (
    !user?.dayStarted &&
    //  user?.lastLoginDate === user?.lastLogoutDate
    dayClose?.date === today
  ) {
    return (
      <FlexContainer variant="column-center" gap="2xl" className="min-h-[50vh]">
        <h3 className="text-xl font-semibold">
          {/* continue today */}
          Are you sure you want to continue today?
        </h3>
        <Button onClick={handleContinue}>Continue</Button>
      </FlexContainer>
    );
  }

  if (!user?.dayStarted) {
    return (
      <FlexContainer variant="column-center" gap="2xl" className="min-h-[50vh]">
        <h3 className="text-xl font-semibold">Day Start</h3>
        <Button onClick={handleStartDay}>Start Day</Button>
      </FlexContainer>
    );
  }

  return (
    <FlexContainer variant="column-start" gap="2xl">
      {/* <div className="grid grid-cols-3 gap-3">
        <FlexContainer
          variant="column-start"
          gap="none"
          className="px-5 py-5 border shadow-sm rounded-xl bg-white"
        >
          <span className="text-sm font-semibold">Revenue For Today</span>
          <span className="text-lg font-semibold">
            ₹{data?.sales.salesAmount || "0.00"}
          </span>
        </FlexContainer>
        <FlexContainer
          variant="column-start"
          gap="none"
          className="px-5 py-5 border shadow-sm rounded-xl bg-white"
        >
          <span className="text-sm font-semibold">Today's Sales Count</span>
          <span className="text-lg font-semibold">
            {data?.sales.salesCount || "0.00"}
          </span>
        </FlexContainer>
        <FlexContainer
          variant="column-start"
          gap="none"
          className="px-5 py-5 border shadow-sm rounded-xl bg-white"
        >
          <span className="text-sm font-semibold">Open Orders</span>
          <span className="text-lg font-semibold">
            {data?.sessions.activeSessionsCount || "0.00"}
          </span>
        </FlexContainer>
      </div> */}

      <h3 className="text-xl font-semibold">Active Sessions</h3>
      {data?.sessions?.activeSessions.length === 0 && (
        <div className="text-left text-lg font-medium">No Active Sessions</div>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {!loading &&
          data?.sessions &&
          data?.sessions.activeSessions.map((session) => (
            <SessionCard
              key={session.billId}
              session={session}
              setTableId={setTableId}
              setSessionData={setSessionData}
              onOpen={onOpen}
              refresh={refresh}
            />
          ))}
      </div>
      {/* skeleton */}

      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(15)].map((_, index) => {
            return (
              // multiple skeleton
              <div
                className="px-5 py-10 text-center bg-white border rounded-xl shadow-lg border-zinc-300 font-medium"
                key={index}
              >
                {/* single skeleton */}
                <div className="animate-pulse flex flex-col gap-3">
                  <div className="flex justify-between">
                    <div className="w-1/4 h-4 bg-gray-200 rounded-md"></div>
                    <div className="w-1/4 h-4 bg-gray-200 rounded-md"></div>
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded-md"></div>
                  <div className="w-full h-4 bg-gray-200 rounded-md"></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <FlexContainer variant="row-end">
        <Button onClick={handleEndDay}>Day Close</Button>
      </FlexContainer>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
        <ModalContent>
          {(onClose) => {
            return (
              <Fragment>
                <ModalHeader className="flex flex-col gap-1">
                  <h4 className="text-lg font-semibold">Settle Bill</h4>
                </ModalHeader>
                <ModalBody>
                  <Payments
                    tableId={tableId as string}
                    session={sessionData}
                    refreshSession={refresh}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button variant={"ghost"} onClick={onClose}>
                    Close
                  </Button>
                  <Button color="primary" onClick={handleSettleBill}>
                    Settle Bill
                  </Button>
                </ModalFooter>
              </Fragment>
            );
          }}
        </ModalContent>
      </Modal>
    </FlexContainer>
  );
};

interface SessionCardProps {
  session: KsrSession;
  setTableId: React.Dispatch<React.SetStateAction<string | null>>;
  setSessionData: React.Dispatch<React.SetStateAction<KsrSession | null>>;
  onOpen: () => void;
  refresh: (tag: string, data: any, showToast: boolean) => void;
}

const SessionCard = ({
  session,
  setTableId,
  setSessionData,
  onOpen,
  refresh,
}: SessionCardProps) => {
  const [deleting, setDeleting] = useState(false);

  const handleDeleteSession = async () => {
    try {
      setDeleting(true);
      const response = await axios.delete(
        `${API_URL}/ksr/session?sessionId=${session.sessionId}&restaurantId${session.restaurant}`
      );
      toast.success(response?.data?.message);
      refresh(API_TAGS.GET_DAY_CLOSE, {}, true);
      refresh(API_TAGS.GET_RESTAURANTS, {}, false);
    } catch (error) {
      const err = error as Error & { response: { data: { message: string } } };
      toast.error(err.response.data.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <FlexContainer
      key={session.billId}
      variant="column-start"
      className="relative p-3 bg-white rounded-xl border"
    >
      <FlexContainer variant="row-between" className="mb-2" alignItems="center">
        <span className="text-xs font-semibold">BILL: {session?.billId}</span>
        <Badge>{session?.table?.tableNumber}</Badge>
      </FlexContainer>

      <FlexContainer variant="column-start" gap="sm">
        {session?.orders.map((order: KsrOrder) => {
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
              <FlexContainer variant="row-between">
                <p className="text-xs font-medium">
                  SUBTOTAL : {order.subTotal}
                </p>
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
          <span className="text-sm">Amount Paid</span>
          <span className="text-sm">₹{session.totalPaid}</span>
        </FlexContainer>
        <FlexContainer variant="row-between">
          <span className="text-sm">Total</span>
          <span className="text-sm">₹{session.billAmount}</span>
        </FlexContainer>
      </div>

      <FlexContainer variant="row-between" wrap="wrap" gap="sm">
        <Button
          variant={"destructive"}
          size={"sm"}
          onClick={handleDeleteSession}
          isLoading={deleting}
        >
          Delete Session & Free Table
        </Button>
        <Button
          onClick={() => {
            setTableId(session.table.uniqueId);
            setSessionData(session);
            onOpen();
          }}
          size={"sm"}
        >
          Settle Bill & Close Session
        </Button>
      </FlexContainer>
    </FlexContainer>
  );
};

interface PaymentForm {
  paymentType: string;
  amount: number;
}

const Payments = ({
  tableId,
  session,
  refreshSession,
}: {
  tableId: string;
  session: KsrSession | null;
  refreshSession: (tag: string, data: any, showToast: boolean) => void;
}) => {
  const [addingPayemnt, setAddingPayment] = useState(false);
  const [form, setForm] = useState<PaymentForm>({
    paymentType: "",
    amount: 0,
  });

  const { data, error, loading, getData, refresh } = useGet<KsrPayment[]>({
    showToast: false,
  });

  const handleAddPayment = async () => {
    if (!form.paymentType) {
      toast.error("Payment Type is required");
      return;
    }

    if (form.amount <= 0) {
      toast.error("Amount should be greater than 0");
      return;
    }
    if (!tableId) {
      toast.error("Table Id is required");
      return;
    }

    try {
      setAddingPayment(true);
      const response = await axios.post(`${API_URL}/ksr/session/payment`, {
        tableId: tableId,
        method: form.paymentType,
        amount: form.amount,
      });
      refresh(API_TAGS.GET_KSR_PAYMENT + tableId, {}, true);
      refreshSession(API_TAGS.GET_DAY_CLOSE, {}, true);
      setForm({
        paymentType: "",
        amount: 0,
      });
    } catch (error) {
      const err = error as Error & { response: { data: { message: string } } };
      toast.error(err.response.data.message);
    } finally {
      setAddingPayment(false);
    }
  };

  useEffect(() => {
    getData(
      `${API_URL}/ksr/session/payment?tableId=${tableId}`,
      API_TAGS.GET_KSR_PAYMENT + tableId
    );
  }, [tableId]);

  useEffect(() => {
    if (data?.length) {
      const freshPayments = data?.map((payment) => {
        return {
          paymentType: payment.paymentMethod,
          amount: payment.amount,
        };
      });
    }
  }, [data]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 bg-white border rounded-md">
        <FlexContainer variant="row-between">
          <h5 className="text-sm font-semibold">Bill Amount</h5>
          <p className="text-sm">₹{session?.billAmount}</p>
        </FlexContainer>
        <h5 className="text-sm font-semibold">Previous Payments</h5>
        {data?.map((payment, i) => (
          <FlexContainer variant="row-between" key={i}>
            <p className="text-sm">{payment.paymentMethod}</p>
            <p className="text-sm">₹{payment.amount}</p>
          </FlexContainer>
        ))}
        <hr />
        <FlexContainer variant="row-between">
          <p className="text-sm">Total Paid</p>
          <p className="text-sm">₹{session?.totalPaid}</p>
        </FlexContainer>
      </div>
      <div className="p-3 bg-white border rounded-md">
        <h5 className="text-sm font-semibold">Add new Payments</h5>
        <div className="grid grid-cols-3 gap-3">
          <Select
            name="paymentType"
            label="Payment Type"
            labelPlacement="outside"
            placeholder="Select Payment Type"
            radius="sm"
            size="sm"
            items={[
              {
                label: "Cash",
                key: "cash",
              },
              {
                label: "Card",
                key: "card",
              },
              {
                label: "UPI",
                key: "upi",
              },
            ]}
            classNames={{
              label: "text-zinc-900",
              trigger: "border shadow-none",
            }}
            onChange={(e) => {
              setForm({
                ...form,
                paymentType: e.target.value,
              });
            }}
            selectedKeys={form.paymentType ? [form.paymentType] : []}
          >
            {(item) => (
              <SelectItem key={item.key} value={item.key}>
                {item.label}
              </SelectItem>
            )}
          </Select>
          <Input
            type="number"
            label="Amount"
            labelPlacement="outside"
            placeholder="Enter Amount"
            radius="sm"
            size="sm"
            classNames={{
              label: "text-zinc-900",
              inputWrapper: "border shadow-none",
            }}
            value={form.amount.toString()}
            onChange={(e) => {
              setForm({
                ...form,
                amount: parseFloat(e.target.value),
              });
            }}
          />
          <div className="grid gap-2.5">
            {/* <Button
                variant="destructive"
                onClick={() => {
                  const newForm = [...form];
                  newForm.splice(i, 1);
                  setForm(newForm);
                }}
                size={"sm"}
              >
                <Trash className="w-4 h-4" />
              </Button> */}

            <Button
              isLoading={addingPayemnt}
              variant="default"
              onClick={handleAddPayment}
              size={"sm"}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayClose;