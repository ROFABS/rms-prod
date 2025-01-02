import FlexContainer from "@/components/layout/FlexContainer";
import { API_URL } from "@/lib/consts/app";
import { useGlobalContext } from "@/store/GlobalContext";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const ViewStats = () => {
  const { selectedRestaurant } = useGlobalContext();
  const [weeklySales, setWeeklySales] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [yearlySales, setYearlySales] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [tableUtilization, setTableUtilization] = useState([]);
  const [discountsGiven, setDiscountsGiven] = useState([]);
  const [taxCollected, setTaxCollected] = useState([]);

  useEffect(() => {
    // Fetch stats data from the server
    const fetchStatsData = async () => {
      try {
        const response = await fetch(
          `${API_URL}/property/stats?restaurantId=${selectedRestaurant?.uniqueId}`
        );
        const data = await response.json();
        setWeeklySales(data.weeklySales);
        setMonthlySales(data.monthlySales);
        setYearlySales(data.yearlySales);
        setTopSellingProducts(data.topSellingProducts);
        setTableUtilization(data.tableUtilization);
        setDiscountsGiven(data.discountsGiven);
        setTaxCollected(data.taxCollected);
      } catch (error) {
        console.error("Error fetching stats data:", error);
      }
    };

    if (selectedRestaurant) {
      fetchStatsData();
    }
  }, [selectedRestaurant]);

  return (
    <FlexContainer variant="column-start" className="p-2.5" gap="xl">
      <div className="grid md:grid-cols-2 gap-5">
        {" "}
        <FlexContainer variant="column-start">
          <h2 className="font-semibold">Total Sales This Week</h2>
          <ResponsiveContainer
            width="100%"
            height={300}
            className={"m-0 bg-white p-3 pt-6 border rounded-xl"}
          >
            <BarChart data={weeklySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  padding: "5px 10px",
                  borderRadius: "5px",
                }}
                labelStyle={{
                  color: "#000",
                  fontWeight: "600",
                  fontSize: "12px",
                  marginBottom: "0px",
                  paddingBottom: "0px",
                }}
                itemStyle={{
                  color: "#8884d8",
                  fontWeight: "medium",
                  fontSize: "14px",
                  marginTop: "0px",
                  paddingTop: "0px",
                }}
                formatter={(value, name, item) => {
                  return [`Sales: ₹${value}`];
                }}
                // labelFormatter={(label, payload) => {
                //   return `Day: ${label}`;
                // }}
              />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </FlexContainer>
        <FlexContainer variant="column-start">
          <h2 className="font-semibold">Total Sales This Month</h2>
          <ResponsiveContainer
            width="100%"
            height={300}
            className={"m-0 bg-white p-3 pt-6 border rounded-xl"}
          >
            <BarChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  padding: "5px 10px",
                  borderRadius: "5px",
                }}
                labelStyle={{
                  color: "#000",
                  fontWeight: "600",
                  fontSize: "12px",
                  marginBottom: "0px",
                  paddingBottom: "0px",
                }}
                itemStyle={{
                  color: "#82ca9d",
                  fontWeight: "medium",
                  fontSize: "14px",
                  marginTop: "0px",
                  paddingTop: "0px",
                }}
                formatter={(value, name, item) => {
                  return [`Sales: ₹${value}`];
                }}
              />
              <Legend />
              <Bar dataKey="sales" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </FlexContainer>
        <FlexContainer variant="column-start">
          <h2 className="font-semibold">Total Sales This Year</h2>
          <ResponsiveContainer
            width="100%"
            height={300}
            className={"m-0 bg-white p-3 pt-6 border rounded-xl"}
          >
            <BarChart data={yearlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  padding: "5px 10px",
                  borderRadius: "5px",
                }}
                labelStyle={{
                  color: "#000",
                  fontWeight: "600",
                  fontSize: "12px",
                  marginBottom: "0px",
                  paddingBottom: "0px",
                }}
                itemStyle={{
                  color: "#ffc658",
                  fontWeight: "medium",
                  fontSize: "14px",
                  marginTop: "0px",
                  paddingTop: "0px",
                }}
                formatter={(value, name, item) => {
                  return [`Sales: ₹${value}`];
                }}
              />
              <Legend />
              <Bar dataKey="sales" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </FlexContainer>
        <FlexContainer variant="column-start">
          {" "}
          <h2 className="font-semibold">
            Top Selling Products
            <span className="text-xs text-gray-500"> (This Month)</span>
          </h2>
          <ResponsiveContainer
            width="100%"
            height={300}
            className={"m-0 bg-white p-3 pt-6 border rounded-xl"}
          >
            <PieChart>
              <Pie
                data={topSellingProducts}
                dataKey="quantity"
                nameKey="product"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {topSellingProducts.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  padding: "5px 10px",
                  borderRadius: "5px",
                }}
                labelStyle={{
                  color: "#000",
                  fontWeight: "600",
                  fontSize: "12px",
                  marginBottom: "0px",
                  paddingBottom: "0px",
                }}
                itemStyle={{
                  color: "#fff",
                  fontWeight: "500",
                  fontSize: "12px",
                  marginTop: "0px",
                  paddingTop: "0px",
                }}
                formatter={(value, name, item) => {
                  return [`${name}: ${value} units`];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </FlexContainer>
        <FlexContainer variant="column-start">
          <h2 className="font-semibold">
            Table Utilization{" "}
            <span className="text-xs text-gray-500">(This Week)</span>
          </h2>
          <ResponsiveContainer
            width="100%"
            height={300}
            className={"m-0 bg-white p-3 pt-6 border rounded-xl"}
          >
            <BarChart data={tableUtilization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  padding: "5px 10px",
                  borderRadius: "5px",
                }}
                labelStyle={{
                  color: "#000",
                  fontWeight: "600",
                  fontSize: "12px",
                  marginBottom: "0px",
                  paddingBottom: "0px",
                }}
                itemStyle={{
                  color: "#82ca9d",
                  fontWeight: "500",
                  fontSize: "14px",
                  marginTop: "0px",
                  paddingTop: "0px",
                }}
                formatter={(value, name, item) => {
                  return [`Sessions: ${value}`];
                }}
              />
              <Legend />
              <Bar dataKey="sessions" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </FlexContainer>
        <FlexContainer variant="column-start">
          <h2 className="font-semibold">
            Discounts Given{" "}
            <span className="text-xs text-gray-500">(This Week)</span>
          </h2>
          <ResponsiveContainer
            width="100%"
            height={300}
            className={"m-0 bg-white p-3 pt-6 border rounded-xl"}
          >
            <BarChart data={discountsGiven}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  padding: "5px 10px",
                  borderRadius: "5px",
                }}
                labelStyle={{
                  color: "#000",
                  fontWeight: "600",
                  fontSize: "12px",
                  marginBottom: "0px",
                  paddingBottom: "0px",
                }}
                itemStyle={{
                  color: "#8884d8",
                  fontWeight: "500",
                  fontSize: "14px",
                  marginTop: "0px",
                  paddingTop: "0px",
                }}
                formatter={(value, name, item) => {
                  return [`Discount: ₹${value}`];
                }}
              />
              <Legend />
              <Bar dataKey="discount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </FlexContainer>
        <FlexContainer variant="column-start">
          <h2 className="font-semibold">
            Tax Collected{" "}
            <span className="text-xs text-gray-500">(This Week)</span>
          </h2>
          <ResponsiveContainer
            width="100%"
            height={300}
            className={"m-0 bg-white p-3 pt-6 border rounded-xl"}
          >
            <BarChart data={taxCollected}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  padding: "5px 10px",
                  borderRadius: "5px",
                }}
                labelStyle={{
                  color: "#000",
                  fontWeight: "600",
                  fontSize: "12px",
                  marginBottom: "0px",
                  paddingBottom: "0px",
                }}
                itemStyle={{
                  color: "#ffc658",
                  fontWeight: "500",
                  fontSize: "14px",
                  marginTop: "0px",
                  paddingTop: "0px",
                }}
                formatter={(value, name, item) => {
                  return [`Tax: ₹${value}`];
                }}
              />
              <Legend />
              <Bar dataKey="tax" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </FlexContainer>
      </div>
    </FlexContainer>
  );
};

export default ViewStats;
