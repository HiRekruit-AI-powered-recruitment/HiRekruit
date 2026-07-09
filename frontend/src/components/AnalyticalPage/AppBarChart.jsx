"use client";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";

const chartConfig = {
    activeDrives: {
        label: "Active Drives",
        color: "var(--chart-1)",
    },
    completedDrives: {
        label: "Completed Drives",
        color: "var(--chart-2)",
    },
};

// const chartData = [
//     { month: "Jan", activeDrives: 4, completedDrives: 2 },
//     { month: "Feb", activeDrives: 6, completedDrives: 3 },
//     { month: "Mar", activeDrives: 3, completedDrives: 5 },
// ];

const AppBarChart = () => {
    // Getting the Backend Data 
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/companyinfo/calendar-drive-stats");

                console.log("API RESPONSE:", res.data);

                console.log("MONTHLY STATS:", res.data.monthlyStats);
                setChartData(res.data.monthlyStats);

            } catch (err) {
                console.log("Error fetching companies:", err);
            }
        };

        fetchData();
    }, []);
    return (
        <div className="">
            <h1 className="text-lg font-medium mb-6">Company Drive Statistics</h1>
            <ChartContainer config={chartConfig} className="h-[450px] w-full">
                <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 80 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                    // interval={0}
                    // tick={{ fontSize: 12 }}
                    // angle={-30}
                    // textAnchor="end"
                    />
                    <YAxis
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}

                    />
                    <ChartTooltip content={<ChartTooltipContent />} />

                    <Bar dataKey="activeDrives" barSize={30} fill="var(--color-activeDrives)" radius={4} />
                    <Bar dataKey="completedDrives" barSize={30} fill="var(--color-completedDrives)" radius={4} />
                </BarChart>
            </ChartContainer>
        </div>
    )
}
export default AppBarChart