import React from "react";

const InterviewFooter = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200 py-4 text-center">
      <p className="text-sm text-gray-600">
        © {new Date().getFullYear()} HiRekruit. All rights reserved.
      </p>
    </footer>
  );
};

export default InterviewFooter;
