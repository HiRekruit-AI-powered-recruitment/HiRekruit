"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar1Icon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

import { useEffect, useState } from "react";
import axios from "axios";

const ActivityTracker = () => {

    // Hooks 
    const [date, setDate] = useState();
    const [open, setOpen] = useState(false);

    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);

    // API Calling 
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:5000/api/companyinfo/calendar-drive-stats"
                );

                setData(res.data.events);
                setFilteredData(res.data.events);

            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Keep UI synced with backend data
    useEffect(() => {
        setFilteredData(data);
    }, [data]);

    return (
        <div>
            <h1 className="text-lg font-medium mb-6">Activity Calendar</h1>

            <div className="mb-4">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full flex gap-2">
                            <Calendar1Icon />
                            {date ? format(date, "PPP") : <span>Pick a Date</span>}
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-2">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(date) => {
                                if (!date) return;

                                setDate(date);
                                setOpen(false);

                                // 1. Data Filtering 

                                // 2. Date Formating 
                                const selectedDate = format(date, "yyyy-MM-dd");

                                // 3. Data filtering 
                                const filtered = data.filter(
                                    item => item.date === selectedDate
                                );

                                setFilteredData(filtered);
                            }}
                            className="rounded-lg border"
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* List */}
            <ScrollArea className="h-[400px]">
                <div className="flex flex-col gap-4">

                    {loading ? (
                        <p className="text-sm text-muted-foreground">
                            Loading...
                        </p>
                    ) : filteredData.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No data found
                        </p>
                    ) : (
                        filteredData.map((item, index) => (
                            <Card key={index} className="p-4">
                                <div className="flex items-center justify-between">

                                    <div className="flex items-center gap-4">
                                        <Checkbox
                                            id={`item-${index}`}
                                            checked={item.status === "completed"}
                                        />
                                        <label
                                            htmlFor={`item-${index}`}
                                            className="text-sm text-muted-foreground"
                                        >
                                            {item.company}
                                        </label>
                                    </div>

                                    <div className="text-xs text-right">
                                        <div
                                            className="font-medium"
                                            style={{
                                                color:
                                                    item.status === "active"
                                                        ? "oklch(76.532% 0.16295 68.338)"
                                                        : "oklch(24.799% 0.16532 265.371)"
                                            }}
                                        >
                                            {item.status === "active"
                                                ? "Active Drive"
                                                : "Completed Drive"}
                                        </div>

                                        <div className="text-muted-foreground">
                                            {item.date}
                                        </div>
                                    </div>

                                </div>
                            </Card>
                        ))
                    )}

                </div>
            </ScrollArea>
        </div>
    );
};

export default ActivityTracker;