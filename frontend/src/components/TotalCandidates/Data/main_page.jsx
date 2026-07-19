import { columns } from "./columns";
import { DataTable } from "./data-table";

const getData = async () => {
    return [
        {
            id: 1,
            name: "Aman Sharma",
            email: "aman@gmail.com",
            role: "Frontend Developer",
            status: "active",
        },
        {
            id: 2,
            name: "Priya Verma",
            email: "priya@gmail.com",
            role: "Backend Developer",
            status: "inactive",
        },
        {
            id: 3,
            name: "Rahul Singh",
            email: "rahul@gmail.com",
            role: "Full Stack Developer",
            status: "active",
        },
    ];
};

const PaymentPage = async () => {
    const data = await getData();

    return (
        <div className="">
            <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
                <h1 className="font-semibold">All Data</h1>
                <div><DataTable columns={columns} data={data} /></div>
            </div>

        </div>
    );
};

export default PaymentPage;