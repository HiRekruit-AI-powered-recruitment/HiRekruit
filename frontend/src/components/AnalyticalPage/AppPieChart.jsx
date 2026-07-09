"use client";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Label, Pie, PieChart } from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";

const AppPieChart = () => {
    const [chartData, setChartData] = useState([]);

    const chartConfig = {
        active: {
            label: "Active Hiring Drives",
            color: "var(--chart-1)",
        },
        completed: {
            label: "Completed Hiring Drives",
            color: "var(--chart-2)",
        },
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:5000/api/companyinfo/company-drive-stats"
                );

                const data = res.data.data || [];

                const active = data.reduce(
                    (sum, c) => sum + (c.activeDrives || 0),
                    0
                );

                const completed = data.reduce(
                    (sum, c) => sum + (c.completedDrives || 0),
                    0
                );

                setChartData([
                    {
                        status: "Active Hiring Drives",
                        value: active,
                        fill: "var(--chart-1)",
                    },
                    {
                        status: "Completed Hiring Drives",
                        value: completed,
                        fill: "var(--chart-2)",

                    },
                ]);
            } catch (err) {
                console.log("Pie chart API error:", err);
            }
        };

        fetchData();
    }, []);

    const total = (chartData || []).reduce(
        (acc, curr) => acc + (curr.value || 0),
        0
    );

    if (!chartData || chartData.length === 0) {
        return (
            <div className="text-center text-gray-500">
                Loading chart...
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-lg font-medium mb-6">
                Hiring Drive Status Distribution
            </h1>

            <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />

                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="status"
                        innerRadius={60}
                        strokeWidth={5}
                    >
                        <Label
                            content={({ viewBox }) => {
                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                    return (
                                        <text
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            <tspan
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                className="fill-foreground text-3xl font-bold"
                                            >
                                                {total.toLocaleString()}
                                            </tspan>
                                            <tspan
                                                x={viewBox.cx}
                                                y={(viewBox.cy || 0) + 24}
                                                className="fill-muted-foreground"
                                            >
                                                Total Drives
                                            </tspan>
                                        </text>
                                    );
                                }
                            }}
                        />
                    </Pie>
                </PieChart>
            </ChartContainer>
        </div>
    );
};

export default AppPieChart;