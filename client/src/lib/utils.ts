import { Tax } from "@/pages/ksr/config/types";
import { KsrOrder } from "@/pages/ksr/types";
import { clsx, type ClassValue } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatProduct = (product: KsrOrder["products"]) => {
  const maxProductNameLength = 18;
  const header = "Product Name        Qty   Price    Total\n";
  const separator = "----------------------------------------\n";

  const formattedProducts = product
    .map((item) => {
      const { productName, quantity, price } = item;
      const total = quantity * price;
      const priceStr = price.toFixed(2);
      const totalStr = total.toFixed(2);

      // Split product name if it exceeds the max length
      const productNameLines = [];
      for (let i = 0; i < productName.length; i += maxProductNameLength) {
        productNameLines.push(productName.slice(i, i + maxProductNameLength));
      }

      // Format the first line with product name, quantity, price, and total
      let formattedLine = `${productNameLines[0].padEnd(
        maxProductNameLength,
        " "
      )}${quantity.toString().padStart(9, " ")}${priceStr.padStart(
        12,
        " "
      )}${totalStr.padStart(12, " ")}`;

      // Add remaining lines for product name if it was split
      for (let i = 1; i < productNameLines.length; i++) {
        formattedLine += `\n${productNameLines[i]}`;
      }

      return formattedLine;
    })
    .join("\n");

  return header + separator + formattedProducts;
};
export const formatProductKOT = (product: KsrOrder["products"]) => {
  const maxProductNameLength = 18;
  const header = "Product Name                           Qty\n";
  const separator = "----------------------------------------\n";

  const formattedProducts = product
    .map((item) => {
      const { productName, quantity, price } = item;

      // Split product name if it exceeds the max length
      const productNameLines = [];
      for (let i = 0; i < productName.length; i += maxProductNameLength) {
        productNameLines.push(productName.slice(i, i + maxProductNameLength));
      }

      // Format the first line with product name, quantity, price, and total
      let formattedLine = `${productNameLines[0].padEnd(
        maxProductNameLength,
        " "
      )}${quantity.toString().padStart(18, " ")}`;

      // Add remaining lines for product name if it was split
      for (let i = 1; i < productNameLines.length; i++) {
        formattedLine += `\n${productNameLines[i]}`;
      }

      return formattedLine;
    })
    .join("\n");

  return header + separator + formattedProducts;
};

// debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 100,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function (this: any, ...args: Parameters<T>) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;
    const later = function () {
      timeout = null as any;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

export const calculateItemTax = (tax: Tax, price: number) => {
  if (!tax) return 0;

  const { CGST, SGST, CESS, SERVICE } = tax;
  const totalTaxRate = (CGST || 0) + (SGST || 0) + (CESS || 0) + (SERVICE || 0);
  const totalTaxAmount = ((totalTaxRate / 100) * price).toFixed(2);
  return parseFloat(totalTaxAmount);
};

// console.log(selectedValues);
// // Convert start and end times to DateTime objects
// const today = dayjs().format("YYYY-MM-DD");
// const startDateTime = dayjs(
//   `${today} ${selectedValues.startTime}`,
//   "YYYY-MM-DD hh:mm A"
// );
// let endDateTime = dayjs(
//   `${today} ${selectedValues.endTime}`,
//   "YYYY-MM-DD hh:mm A"
// );

// // If end time is before start time, it means the end time is on the next day
// if (endDateTime.isBefore(startDateTime)) {
//   endDateTime = endDateTime.add(1, "day");
// }
// console.log(
//   startDateTime.format("YYYY-MM-DD HH:mm:ss"),
//   endDateTime.format("YYYY-MM-DD HH:mm:ss")
// );
// console.log(selectedValues);
interface TimeDurationResult {
  startDateTime: string;
  endDateTime: string;
  duration: number;
}

export const calculateTimeDuration = (
  startTime: string,
  endTime: string,
  date?: string
): TimeDurationResult => {
  // Use the provided date or default to today's date
  const today = date || dayjs().format("YYYY-MM-DD");

  // Convert start and end times to DateTime objects
  const startDateTime = dayjs(`${today} ${startTime}`, "YYYY-MM-DD hh:mm A");
  let endDateTime = dayjs(`${today} ${endTime}`, "YYYY-MM-DD hh:mm A");

  // If end time is before start time, it means the end time is on the next day
  if (endDateTime.isBefore(startDateTime)) {
    endDateTime = endDateTime.add(1, "day");
  }

  // Calculate the duration in hours
  const duration = endDateTime.diff(startDateTime, "hour", true);

  return {
    startDateTime: startDateTime.format("YYYY-MM-DD HH:mm:ss"),
    endDateTime: endDateTime.format("YYYY-MM-DD HH:mm:ss"),
    duration,
  };
};
