"use client";

import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="relative">

                {/* icon */}
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                {/* input */}
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="
                        w-full
                        pl-10
                        pr-4
                        py-2
                        border border-gray-300
                        rounded-lg
                        text-sm
                        focus:outline-none
                        focus:ring-2 focus:ring-blue-500
                        focus:border-blue-500
                    "
                />
            </div>
        </div>
    );
};

export default SearchBar;