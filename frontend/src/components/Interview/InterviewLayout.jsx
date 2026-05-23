import { Outlet } from "react-router-dom";
import InterviewNavbar from "./InterviewNavbar";
import InterviewFooter from "./InterviewFooter";

const InterviewLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <InterviewNavbar />

      <main className="flex-grow">
        <Outlet />
      </main>

      <InterviewFooter />
    </div>
  );
};

export default InterviewLayout;
