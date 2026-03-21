import React from "react";
import * as XLSX from "xlsx";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "react-hot-toast";

const ExportExcel = ({ candidates, data, fileName = "Exported_Data" }) => {
  // Accept either 'candidates' or 'data' prop so it's fully reusable anywhere
  const sourceData = candidates || data;

  // Utility function to flatten nested objects and arrays dynamically
  const flattenObject = (obj, parentKey = "") => {
    let result = {};

    if (obj === null || typeof obj !== "object") return result;

    Object.keys(obj).forEach((key) => {
      // Skip redundant raw backend data to keep Excel clean
      if (key === "raw" || key === "__v") return;

      const value = obj[key];
      // Create a readable key by combining parent and current key
      const newKey = parentKey ? `${parentKey}_${key}` : key;

      if (value instanceof Date) {
        result[newKey] = value.toLocaleDateString();
      } else if (Array.isArray(value)) {
        // Convert arrays to comma-separated strings
        result[newKey] = value
          .map((item) => (typeof item === "object" ? JSON.stringify(item) : item))
          .join(", ");
      } else if (value !== null && typeof value === "object") {
        // Recursively flatten nested objects (e.g., user.name -> user_name)
        Object.assign(result, flattenObject(value, newKey));
      } else if (value !== null && value !== undefined && value !== "") {
        // Base case: strings, numbers, booleans
        result[newKey] = value;
      }
    });

    return result;
  };

  const handleExport = () => {
    if (!sourceData || sourceData.length === 0) {
      toast.error("No data available to export.");
      return;
    }

    try {
      const excelData = sourceData.map((item, index) => {
        // 1. Always start with S.No
        const row = { "S.No": index + 1 };

        // 2. Flatten the entire object dynamically (catches s_id, nested data, etc.)
        const flattenedItem = flattenObject(item);

        // 3. Format the keys to look like clean Excel Column Headers
        Object.keys(flattenedItem).forEach((key) => {
          const formattedColumnName = key
            .replace(/_/g, " ") // Replace underscores with spaces
            .replace(/([A-Z])/g, " $1") // Add space before capital letters
            .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize each word
            .trim();

          row[formattedColumnName] = flattenedItem[key];
        });

        return row;
      });

      // Generate the Worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Auto-size the first few columns
      worksheet["!cols"] =[
        { wch: 6 },  // S.No
        { wch: 25 }, // First dynamic col
        { wch: 25 }, // Second dynamic col
        { wch: 30 }, // Third dynamic col
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      toast.success("Excel file downloaded successfully!");
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("Failed to export data to Excel.");
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={!sourceData || sourceData.length === 0}
      className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FileSpreadsheet className="w-4 h-4" />
      Export to Excel
    </button>
  );
};

export default ExportExcel;