import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Button } from "@/components/ui/button";
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
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect } from "react";
import { KsrOrder } from "./types";

const KsrReports = () => {
  const { property, selectedRestaurant } = useGlobalContext();

  const {
    data: ordersData,
    error: ordersError,
    loading: ordersLoading,
    invalidateCache: invalidateOrdersCache,
    refresh: refreshOrdersData,
    getData: getOrdersData,
  } = useGet<{ orders: KsrOrder[] }>({ showToast: false });

  const handleExportCSV = () => {
    const csv = ordersData?.orders.map((item) => {
      return {
        "Order Id": item?.orderId,
        "Order Date": dayjs(item?.createdAt).format("DD MMM YYYY, hh:mm A"),
        "Type Of Sale": item?.typeOfSale,
        "Table Number": item?.table.tableNumber || "N/P",
        "Delivery Partner": item?.deliveryPartner || "N/P",
        "Tax Amt": item.taxAmount,
        // "IGST Amt": (item?.taxesList.IGST / 100) * item.subTotal,
        "Discount Amount": item?.discountAmount,
        "Sub Total": item?.subTotal,
        "Total Price": item?.totalPrice,
      };
    });
    const csvData = csv?.map((row) =>
      Object.values(row)
        .map((value) => `"${value}"`)
        .join(",")
    );
    csvData?.unshift(
      Object.keys(csv ?? [0])
        .map((value) => `"${value}"`)
        .join(",")
    );
    const csvString = csvData?.join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([csvString || ""], { type: "text/csv" })
    );
    const date = new Date();
    const dateString = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
    a.download = `ksr_reports_${dateString}.csv`;
    a.click();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    autoTable(doc, {
      head: [
        [
          "Order Id",
          "Order Date",
          "Type Of Sale",
          "Table Number",
          "Delivery Partner",
          "User Role",
          "User Name",
          "Discount Amount",
          "Tax Amt",
          "Sub Total",
          "Total Price",
        ],
      ],
      body: ordersData?.orders.map((item) => [
        item?.orderId,
        dayjs(item?.createdAt).format("DD MMM YYYY"),
        item?.typeOfSale,
        item?.table.tableNumber || "N/P",
        item?.deliveryPartner || "N/P",
        item.role,
        item.user,
        item?.discountAmount,
        item?.taxAmount,
        item?.subTotal,
        item?.totalPrice,
      ]),
    });
    const date = new Date();
    const dateString = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
    doc.save(`ksr_reports_${dateString}.pdf`);
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch(
        `${API_URL}/ksr/session/excel?restaurantId=${
          selectedRestaurant?.uniqueId
        }&startDate=${dayjs().startOf("month").toISOString()}&endDate=${dayjs()
          .endOf("month")
          .toISOString()}`,
        {}
      );
      if (!response.ok) {
        throw new Error("An error occurred");
        return;
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
    } catch (error) {
      const err = error as Error & { response: { data: { error: string } } };
      console.log(err?.response?.data?.error || "An error occurred");
    }
  };

  useEffect(() => {
    if (selectedRestaurant) {
      getOrdersData(
        `${API_URL}/ksr/getOrders?restaurantId=${selectedRestaurant?.uniqueId}`,
        API_TAGS.GET_KSR_ORDER_HISTORY
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurant]);
  return (
    <FlexContainer variant="column-start" gap="2xl">
      {" "}
      <ActionArea
        heading={"KSR"}
        subheading={"Reports"}
        title={"Manage Ksr Reports"}
      />
      <FlexContainer variant="row-between" alignItems="center">
        <h2 className="font-semibold text-xl">KSR Reports</h2>
        <FlexContainer>
          <Button variant={"outline"} onClick={handleExportExcel}>
            Export Excel
          </Button>
          <Button variant={"outline"} onClick={handleExportPDF}>
            Export PDF
          </Button>
          <Button variant={"outline"} onClick={handleExportCSV}>
            Export CSV{" "}
          </Button>
        </FlexContainer>
      </FlexContainer>
      {!ordersLoading &&
        ordersData?.orders &&
        ordersData?.orders?.map((item, index) => {
          return (
            <Table key={index} aria-label="ksr_reports">
              <TableHeader>
                <TableColumn className="flex-1 w-full">Order ID</TableColumn>
                <TableColumn>Order Date</TableColumn>
                <TableColumn>Type Of Sale</TableColumn>
                <TableColumn>Table Number</TableColumn>
                <TableColumn>Delivery Partner</TableColumn>
                <TableColumn>Sub Total</TableColumn>
                <TableColumn>Tax Amount</TableColumn>
                <TableColumn>Discount Amount</TableColumn>
                <TableColumn>Total Amount</TableColumn>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="w-full">{item?.orderId}</TableCell>
                  <TableCell className="text-nowrap">
                    {dayjs(item?.createdAt).format("DD MMM YYYY, hh:mm A")}
                  </TableCell>
                  <TableCell>{item?.typeOfSale}</TableCell>
                  <TableCell>{item?.table?.tableNumber || "N/P"}</TableCell>
                  <TableCell>{item?.deliveryPartner || "N/P"}</TableCell>
                  <TableCell>₹{item?.subTotal}</TableCell>
                  <TableCell> {item?.taxAmount}</TableCell>
                  <TableCell>₹{item?.discountAmount}</TableCell>
                  <TableCell>₹{item?.totalPrice}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          );
        })}
    </FlexContainer>
  );
};

export default KsrReports;
