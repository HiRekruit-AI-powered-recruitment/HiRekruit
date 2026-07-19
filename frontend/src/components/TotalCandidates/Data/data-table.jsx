"use client";

import React, { useState, useEffect } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";

export function DataTable({ data, onDelete }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRow, setExpandedRow] = useState(null);
    const rowsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [data]);

    const totalPages = Math.max(
        1,
        Math.ceil((data?.length || 0) / rowsPerPage)
    );

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const paginatedData = (data || []).slice(startIndex, endIndex);

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">

            <div className="overflow-x-auto">
                <Table className="w-full">

                    {/* HEADER */}
                    <TableHeader className="bg-gray-50 border-b border-gray-200">
                        <TableRow>
                            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Name
                            </TableHead>

                            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Email
                            </TableHead>

                            <TableHead className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                Role
                            </TableHead>

                            <TableHead className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                                Status
                            </TableHead>

                            <TableHead className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    {/* BODY */}
                    <TableBody className="divide-y divide-gray-200">
                        {paginatedData?.map((item) => (
                            <React.Fragment key={item.id}>

                                {/* MAIN ROW */}
                                <TableRow className="hover:bg-gray-50 transition">

                                    {/* NAME */}
                                    <TableCell className="px-6 py-4">
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {item.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Candidate
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* EMAIL */}
                                    <TableCell className="px-6 py-4 text-sm text-gray-600">
                                        {item.email}
                                    </TableCell>

                                    {/* ROLE */}
                                    <TableCell className="px-6 py-4 text-sm text-gray-600">
                                        {item.role}
                                    </TableCell>

                                    {/* STATUS */}
                                    <TableCell className="px-6 py-4 text-center">
                                        <span
                                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium
                                                ${item.status === "Selected"
                                                    ? "bg-green-100 text-green-700"
                                                    : item.status === "Interview Completed"
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : item.status === "Interview In Progress"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : item.status === "Interview Scheduled"
                                                                ? "bg-indigo-100 text-indigo-700"
                                                                : item.status === "Shortlisted"
                                                                    ? "bg-purple-100 text-purple-700"
                                                                    : item.status === "Applied"
                                                                        ? "bg-amber-100 text-amber-800"
                                                                        : item.status === "Rejected"
                                                                            ? "bg-red-100 text-red-700"
                                                                            : "bg-gray-100 text-gray-700"
                                                }`}
                                        >
                                            {item.status}
                                        </span>
                                    </TableCell>

                                    {/* ACTIONS */}
                                    <TableCell className="px-6 py-4 text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontalIcon className="h-5 w-5 text-gray-600" />
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        setExpandedRow(
                                                            expandedRow === item.id ? null : item.id
                                                        )
                                                    }
                                                >
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem
                                                    onClick={() => onDelete(item.id)}
                                                    className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>

                                {/* EXPANDED ROW (FIXED STRUCTURE) */}
                                {expandedRow === item.id && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="bg-gray-50 px-6 py-5"
                                        >
                                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">

                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        Candidate Details
                                                    </h3>

                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-medium
                                                            ${item.status === "Selected"
                                                                ? "bg-green-100 text-green-700"
                                                                : item.status === "Interview In Progress"
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : item.status === "Shortlisted"
                                                                        ? "bg-purple-100 text-purple-700"
                                                                        : item.status === "Rejected"
                                                                            ? "bg-red-100 text-red-700"
                                                                            : "bg-amber-100 text-amber-700"
                                                            }`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                                                            Full Name
                                                        </p>
                                                        <p className="text-gray-900 font-medium">
                                                            {item.name}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                                                            Email Address
                                                        </p>
                                                        <p className="text-gray-900">
                                                            {item.email}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                                                            Applied Role
                                                        </p>
                                                        <p className="text-gray-900">
                                                            {item.role}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                                                            Current Status
                                                        </p>
                                                        <p className="text-gray-900">
                                                            {item.status}
                                                        </p>
                                                    </div>

                                                </div>

                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-center gap-2 py-4 border-t bg-white">

                <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                    Previous
                </Button>

                {Array.from({ length: totalPages }, (_, index) => (
                    <Button
                        key={index}
                        variant={currentPage === index + 1 ? "default" : "outline"}
                        onClick={() => setCurrentPage(index + 1)}
                    >
                        {index + 1}
                    </Button>
                ))}

                <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                    Next
                </Button>

            </div>
        </div>
    );
}