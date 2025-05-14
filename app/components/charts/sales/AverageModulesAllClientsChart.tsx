import React from "react";
import { chartColors } from "../../../utils/theme";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartProps } from "./types";

interface AverageModulesAllClientsChartProps extends ChartProps {
  visualizationType?: "line" | "bar" | "area";
}

const AverageModulesAllClientsChart: React.FC<
  AverageModulesAllClientsChartProps
> = ({ data, visualizationType = "line" }) => {
  if (data.length === 0) return null;

  const commonProps = {
    data,
    height: 300,
  };

  const commonAxisProps = (
    <>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
    </>
  );

  if (visualizationType === "bar") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart {...commonProps}>
          {commonAxisProps}
          <Bar
            dataKey="averageModulesPerClient"
            name="Avg Modules per Client (All Clients)"
            fill={chartColors.primary}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (visualizationType === "area") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart {...commonProps}>
          {commonAxisProps}
          <Area
            type="monotone"
            dataKey="averageModulesPerClient"
            name="Avg Modules per Client (All Clients)"
            fill={chartColors.primary}
            stroke={chartColors.primary}
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // default to line chart
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart {...commonProps}>
        {commonAxisProps}
        <Line
          type="monotone"
          dataKey="averageModulesPerClient"
          name="Avg Modules per Client (All Clients)"
          stroke={chartColors.primary}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AverageModulesAllClientsChart;
