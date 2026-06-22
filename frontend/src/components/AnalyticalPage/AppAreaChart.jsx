"use client";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";

const chartConfig = {
    active: {
        label: "Active Drives",
        color: "var(--chart-1)",
    },
    completed: {
        label: "Completed Drives",
        color: "var(--chart-2)",
    },
};



const AppAreaChart = () => {
    // Data Ingestion 
    const [chartData, setChartData] = useState([]);

    // fetching backend data 

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:5000/api/companyinfo/calendar-drive-stats"
                );

                const data = res.data.monthlyStats || [];

                const formatted = data.map((month) => ({
                    month: month.month,
                    active: month.activeDrives || 0,
                    completed: month.completedDrives || 0,
                }));

                setChartData(formatted);

            } catch (err) {
                console.log("Area chart error:", err);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="">
            <h1 className="text-lg font-medium mb-6">Monthly Hiring Performance</h1>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <AreaChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                    // interval={0}
                    // tick={{ fontSize: 11 }}
                    // angle={-20}
                    // textAnchor="end"
                    />
                    <YAxis
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}

                    />
                    <ChartTooltip content={<ChartTooltipContent />} />

                    <defs>
                        <linearGradient id="fillActive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-active)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-active)" stopOpacity={0.1} />
                        </linearGradient>

                        <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-completed)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-completed)" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>

                    <Area
                        dataKey="active"
                        type="monotone"
                        fill="url(#fillActive)"
                        stroke="var(--color-active)"
                        stackId="a"
                    />

                    <Area
                        dataKey="completed"
                        type="monotone"
                        fill="url(#fillCompleted)"
                        stroke="var(--color-completed)"
                        stackId="a"
                    />
                </AreaChart>
            </ChartContainer>
        </div>
    )
}
export default AppAreaChart