
import AppAreaChart from "./AppAreaChart";
import AppBarChart from "./AppBarChart";
import AppPieChart from "./AppPieChart";
import ActivityTracker from "./ActivityTracker";
const AnalyticsDashboard = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
            <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-3">
                <AppBarChart />
            </div>

            <div className="bg-primary-foreground p-4 rounded-lg"><AppPieChart /></div>

            <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
                <AppAreaChart />
            </div>

            <div className="bg-primary-foreground p-4 rounded-lg"><ActivityTracker /></div>
        </div>
    )
}
export default AnalyticsDashboard;