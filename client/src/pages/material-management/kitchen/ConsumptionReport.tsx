import ActionArea from "@/components/layout/ActionArea";
import FlexContainer from "@/components/layout/FlexContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Select, SelectItem } from "@nextui-org/react";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DataItem {
  time: string;
  productName: string;
  priceAfterUtilization: number;
}

interface ProcessedDataItem {
  time: string;
  [productName: string]: number | string;
}

interface ProcessedDataResult {
  processedData: ProcessedDataItem[];
  productNames: string[];
}

const chartConfig = {
  one: {
    color: "hsl(var(--chart-1))",
  },
  two: {
    color: "hsl(var(--chart-2))",
  },
  three: {
    color: "hsl(var(--chart-3))",
  },
  four: {
    color: "hsl(var(--chart-4))",
  },
  five: {
    color: "hsl(var(--chart-5))",
  },
};

const TopPurchasedItemsByPrice = [
  { productName: "Tomato", totalPrice: 3000 },
  { productName: "Bread", totalPrice: 2400 },
  { productName: "Milk", totalPrice: 2000 },
  { productName: "Cheese", totalPrice: 1800 },
  { productName: "Butter", totalPrice: 1600 },
];
const TopPurchasedItemsByQuantity = [
  { productName: "Tomato", totalQuantity: 150 },
  { productName: "Bread", totalQuantity: 120 },
  { productName: "Milk", totalQuantity: 100 },
  { productName: "Cheese", totalQuantity: 90 },
  { productName: "Butter", totalQuantity: 80 },
];
const TopUtilizedProductsByPrice = [
  { time: "week 1", productName: "Tomato", priceAfterUtilization: 10 },
  { time: "week 2", productName: "Bread", priceAfterUtilization: 120 },
  { time: "week 3", productName: "Milk", priceAfterUtilization: 100 },
  { time: "week 4", productName: "Cheese", priceAfterUtilization: 90 },
];

const TopExpireProductsByPrice = [
  { productName: "Tomato", price: 80 },
  { productName: "Bread", price: 120 },
  { productName: "Milk", price: 100 },
  { productName: "Cheese", price: 90 },
];

const TopExpireProductsByQuantity = [
  { productName: "Tomato", quantity: 80 },
  { productName: "Bread", quantity: 120 },
  { productName: "Milk", quantity: 100 },
  { productName: "Cheese", quantity: 90 },
];

const ConsumptionReportKitchen = () => {
  const [timePeriod, setTimePeriod] = useState("last_6_months");
  const [startDate, setStartDate] = useState(
    dayjs().subtract(6, "month").startOf("month")
  );
  const [endDate, setEndDate] = useState(dayjs());

  // const {
  //   data: consumptionReportData,
  //   error: consumptionReportError,
  //   loading: consumptionReportLoading,
  //   refresh,
  //   invalidateCache,
  //   getData: getConsumptionReportData,
  // } = useGet({ showToast: false });

  const processDataForChart = (data: DataItem[]): ProcessedDataResult => {
    const processedData: ProcessedDataItem[] = [];
    const productNames: Set<string> = new Set();

    data.forEach((item) => {
      const existingWeek = processedData.find(
        (week) => week.time === item.time
      );
      productNames.add(item.productName);

      if (existingWeek) {
        existingWeek[item.productName] = item.priceAfterUtilization;
      } else {
        processedData.push({
          time: item.time,
          [item.productName]: item.priceAfterUtilization,
        });
      }
    });

    return { processedData, productNames: Array.from(productNames) };
  };

  const { processedData, productNames } = processDataForChart(
    TopUtilizedProductsByPrice
  );

  // useEffect(() => {
  //   getConsumptionReportData(
  //     `${API_URL}/getKitchenUtilizationEntry/graph?propertyId=2a869149-342b-44c8-ad86-8f6465970638&startDate=${startDate.format(
  //       "YYYY-MM-DD"
  //     )}&endDate=${endDate.format("YYYY-MM-DD")}`,
  //     API_TAGS.GET_KITCEHN_CONSUMPTION_REPORT
  //   );
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // useEffect(() => {
  //   getConsumptionReportData(
  //     `${API_URL}/getKitchenUtilizationEntry/graph?propertyId=2a869149-342b-44c8-ad86-8f6465970638&startDate=${startDate.format(
  //       "YYYY-MM-DD"
  //     )}&endDate=${endDate.format("YYYY-MM-DD")}`
  //   );
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [startDate, endDate]);

  return (
    <FlexContainer variant="column-start" gap="xl">
      <ActionArea
        heading={"Consumption Report"}
        subheading={"Kitchen"}
        title={"Consumption Report Management"}
      />

      <FlexContainer variant="row-end">
        <Select
          name="timePeriod"
          label="Time Period"
          labelPlacement="outside"
          placeholder="Select Time Period"
          className="w-48"
          classNames={{
            trigger: "border shadow-none bg-white",
          }}
          items={[
            { value: "last_year", label: "Last Year" },
            { value: "last_6_months", label: "Last 6 Months" },
            { value: "last_3_months", label: "Last 3 Months" },
            { value: "last_month", label: "Last Month" },
            { value: "custom", label: "Custom" },
          ]}
          selectedKeys={timePeriod ? [timePeriod] : []}
          onChange={(e) => {
            setTimePeriod(e.target.value);
            if (e.target.value === "last_year") {
              setStartDate(dayjs().subtract(1, "year"));
              setEndDate(dayjs());
            }
            if (e.target.value === "last_6_months") {
              setStartDate(dayjs().subtract(6, "month"));
              setEndDate(dayjs());
            }
            if (e.target.value === "last_3_months") {
              setStartDate(dayjs().subtract(3, "month"));
              setEndDate(dayjs());
            }
            if (e.target.value === "last_month") {
              setStartDate(dayjs().subtract(1, "month"));
              setEndDate(dayjs());
            }
            if (e.target.value === "custom") {
              // setStartDate(dayjs().subtract(1, "month"));
              // setEndDate(dayjs());
            }
          }}
        >
          <SelectItem key="last_year">Last Year</SelectItem>
          <SelectItem key="last_6_months">Last 6 Months</SelectItem>
          <SelectItem key="last_3_months">Last 3 Months</SelectItem>
          <SelectItem key="last_month">Last Month</SelectItem>
          <SelectItem key="custom">Custom</SelectItem>
        </Select>
      </FlexContainer>
      <div className="grid grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Purchased Items by Price</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart
                accessibilityLayer
                data={TopPurchasedItemsByPrice}
                layout="vertical"
                margin={{
                  left: 0,
                }}
              >
                <YAxis
                  dataKey="productName"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <XAxis
                  tickFormatter={(value) => `₹${value}`}
                  dataKey="totalPrice"
                  type="number"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                  labelFormatter={(value) => `₹${value}`}
                />
                <Bar
                  dataKey="totalPrice"
                  fill={chartConfig.one.color}
                  layout="vertical"
                  radius={5}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Purchased Items by Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart
                accessibilityLayer
                data={TopPurchasedItemsByQuantity}
                // layout="vertical"
                margin={{
                  left: 0,
                }}
              >
                <XAxis
                  dataKey="productName"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `${value}`}
                  dataKey="totalQuantity"
                  type="number"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                  labelFormatter={(value) => `₹${value}`}
                />
                <Bar
                  dataKey="totalQuantity"
                  fill={chartConfig.two.color}
                  // layout="vertical"
                  radius={5}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 most used utilized items</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                {productNames.map((productName, index) => (
                  <Bar
                    key={productName as string}
                    dataKey={productName as string}
                    fill={
                      ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"][index % 4]
                    } // Cycle through colors
                    name={productName as string}
                  />
                ))}
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Expire Products by Price</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart
                accessibilityLayer
                data={TopExpireProductsByPrice}
                layout="vertical"
                margin={{
                  left: 0,
                }}
              >
                <YAxis
                  dataKey="productName"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <XAxis
                  tickFormatter={(value) => `₹${value}`}
                  dataKey="price"
                  type="number"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                  labelFormatter={(value) => `₹${value}`}
                />
                <Bar
                  dataKey="price"
                  fill={chartConfig.three.color}
                  layout="vertical"
                  radius={5}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Expire Products by Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart
                accessibilityLayer
                data={TopExpireProductsByQuantity}
                layout="vertical"
                margin={{
                  left: 0,
                }}
              >
                <YAxis
                  dataKey="productName"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <XAxis
                  tickFormatter={(value) => `${value}`}
                  dataKey="quantity"
                  type="number"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                  labelFormatter={(value) => `₹${value}`}
                />
                <Bar
                  dataKey="quantity"
                  fill={chartConfig.four.color}
                  layout="vertical"
                  radius={5}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </FlexContainer>
  );
};

export default ConsumptionReportKitchen;
