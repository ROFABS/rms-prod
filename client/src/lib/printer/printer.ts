import { Restaurant } from "@/pages/ksr/config/types";
import { KsrSession } from "@/pages/ksr/session/types";
import { KsrOrder } from "@/pages/ksr/types";
import { Property } from "@/pages/property/types/property";
import { formatProduct, formatProductKOT } from "../utils";
import { USBDevice, UsbNavigator } from "./types";

export const disconnectPrinter = async ({
  device,
  setDevice,
  setIsConnected,
  setError,
}: {
  device: USBDevice | null;
  setDevice: React.Dispatch<React.SetStateAction<USBDevice | null>>;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  if (!device) {
    setError("No device connected");
    return;
  }

  try {
    await device.close();
    localStorage.removeItem("printer");
    setDevice(null);
    setIsConnected(false);
    setError(null);
  } catch (err) {
    const error = err as Error & { message: string };
    setError(`Disconnection error: ${error.message}`);
  }
};

export const connectPrinter = async ({
  setDevice,
  setIsConnected,
  setError,
}: {
  setDevice: React.Dispatch<React.SetStateAction<USBDevice | null>>;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  try {
    const selectedDevice = await (
      navigator as unknown as UsbNavigator
    ).usb.requestDevice({
      filters: [{ vendorId: 0x04b8 }],
    });
    await selectedDevice.open();
    await selectedDevice.selectConfiguration(1);
    await selectedDevice.claimInterface(0);
    localStorage.setItem("printer", JSON.stringify(selectedDevice));
    setDevice(selectedDevice);
    setIsConnected(true);
    setError(null);
  } catch (err) {
    const error = err as Error & { message: string };
    console.log(err, "printer error");
    setError(
      `${
        error.message.includes("No device selected")
          ? "Please connect a printer"
          : error.message
      }`
    );
  }
};

// Printer command constants
const ESC = "\x1B";
const GS = "\x1D";

// Command functions
const ESC_AT = `${ESC}@`; // Initialize printer
const ESC_a = (n: number) => `${ESC}a${String.fromCharCode(n)}`; // Select justification
const GS_EXCLAMATION = (n: number) => `${GS}!${String.fromCharCode(n)}`; // Select character size
const ESC_2 = `${ESC}2`; // Select default line spacing
const ESC_d = (n: number) => `${ESC}d${String.fromCharCode(n)}`; // Print and feed n lines
const GS_V = (m: number, n: number) =>
  `${GS}V${String.fromCharCode(m)}${String.fromCharCode(n)}`; // Select cut mode and cut paper

// Alignment constants
const ALIGN_LEFT = ESC_a(0);
const ALIGN_CENTER = ESC_a(1);
const ALIGN_RIGHT = ESC_a(2);

// Font size constants
const FONT_SMALL = GS_EXCLAMATION(0);
const FONT_MEDIUM = GS_EXCLAMATION(17);

const formatLine = (label: string, value: number | string, width: number) => {
  const valueStr = typeof value === "number" ? value.toFixed(2) : value;
  return `${label.padEnd(width - valueStr.length, " ")}${valueStr}\n`;
};

export const printSession = async ({
  device,
  setError,
  restaurant,
  session,
}: {
  device: USBDevice | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  restaurant: Restaurant | null;
  session: KsrSession & {
    billDetails: {
      subTotal: number;
      tax: number;
      discount: number;
      extraDiscount: number;
      totalAmount: number;
      totalPaid: number;
    };
  };
}) => {
  console.log(device, "device");
  if (!device) {
    setError("No device connected");
    return;
  }
  const subTotal = session.billDetails.subTotal;
  const taxAmount = session.billDetails.tax;
  const discountAmount = session.billDetails.discount;
  const total = session.billDetails.totalAmount;
  const products = session.orders.map((order) => order.products).flat();

  const textEncoder = new TextEncoder();
  const commands = [
    ESC_AT,
    FONT_SMALL,
    ESC_2,
    ALIGN_CENTER,

    `${restaurant?.restaurantName}\n`,
    `${restaurant?.address}\n`,
    `${restaurant?.city}, ${restaurant?.state}, ${restaurant?.zipCode}\n`,
    `Ph. +91 ${restaurant?.phone}\n`,
    `${restaurant?.email}\n\n`,

    FONT_MEDIUM,
    "INVOICE\n\n",

    FONT_SMALL,
    ALIGN_LEFT,

    `Bill ID: ${session?.billId}\n`,
    // `Property ID: ${property?.uniqueId}\n`,
    `Type of Sale: ${session?.typeOfSale}\n`,
    `${
      session.typeOfSale == "dine_in"
        ? `Table Number: ${session?.table.tableNumber}`
        : `Delivery Partner: ${session?.deliveryPartner}`
    }\n\n`,

    FONT_MEDIUM,
    "Products\n\n",

    FONT_SMALL,
    // "Product Name      Qty   Price   Total\n",
    // "------------------------------------\n",
    // "Chicken Biryani    2    250.00   500.00\n",
    // "Butter Naan        4     40.00   160.00\n",
    // "Paneer Tikka       1    180.00   180.00\n",
    // "Mango Lassi        2     60.00   120.00\n",
    formatProduct(products),
    "\n--------------------------------------\n\n",

    ALIGN_RIGHT,
    formatLine("Subtotal:", subTotal, 15),
    formatLine(`Tax:`, taxAmount, 15),
    formatLine("Discount:", discountAmount, 15),
    FONT_MEDIUM,
    formatLine("\nTotal:", total, 5),
    "\n\n",

    ALIGN_CENTER,
    FONT_SMALL,
    "Thank you for dining with us!\n",
    "Please visit again.\n\n",

    ESC_d(3),
    GS_V(66, 3),
  ];
  try {
    for (const command of commands) {
      console.log(command, "command");
      await device.transferOut(1, textEncoder.encode(command as string));
    }
    setError(null);
  } catch (err) {
    const error = err as Error & { message: string };
    console.log(err, "printer error");
    setError(`Print error: ${error.message}`);
  }
};
export const printKOT = async ({
  device,
  setError,
  restaurant,
  order,
}: {
  device: USBDevice | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  restaurant: Restaurant;
  order: KsrOrder;
}) => {
  console.log(device, "device");
  if (!device) {
    setError("No device connected");
    return;
  }

  const textEncoder = new TextEncoder();
  const commands = [
    ESC_AT,
    FONT_SMALL,
    ESC_2,
    ALIGN_CENTER,

    `${restaurant?.restaurantName}\n\n`,

    FONT_MEDIUM,
    "KOT\n\n",

    FONT_SMALL,
    ALIGN_LEFT,

    `Order ID: ${order?.orderId}\n`,
    // `Property ID: ${property?.uniqueId}\n`,
    `Type of Sale: ${order?.typeOfSale}\n`,
    `${
      order.typeOfSale == "dine_in"
        ? `Table Number: ${order?.table.tableNumber}`
        : `Delivery Partner: ${order?.deliveryPartner}`
    }\n\n`,

    FONT_MEDIUM,
    "Products\n\n",

    FONT_SMALL,
    // "Product Name      Qty   Price   Total\n",
    // "------------------------------------\n",
    // "Chicken Biryani    2    250.00   500.00\n",
    // "Butter Naan        4     40.00   160.00\n",
    // "Paneer Tikka       1    180.00   180.00\n",
    // "Mango Lassi        2     60.00   120.00\n",
    formatProductKOT(order?.products),
    "\n--------------------------------------\n\n\n",
    ESC_d(3),
    GS_V(66, 3),
  ];
  try {
    for (const command of commands) {
      console.log(command, "command");
      await device.transferOut(1, textEncoder.encode(command as string));
    }
    setError(null);
  } catch (err) {
    const error = err as Error & { message: string };
    console.log(err, "printer error");
    setError(`Print error: ${error.message}`);
  }
};
