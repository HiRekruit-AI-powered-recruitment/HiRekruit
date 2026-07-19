import { Users2Icon } from "lucide-react";

const Header = () => {
    return (
        <div className="bg-white border-b">
            <div className="px-6 py-6">

                <div className="flex items-center gap-3 mb-2">
                    <Users2Icon className="w-8 h-8 text-purple-600" />

                    <h1 className="text-2xl font-semibold text-gray-900">
                        All Candidates
                    </h1>
                </div>

                <p className="text-sm text-gray-600">
                    Manage and monitor all registered candidates
                </p>

            </div>
        </div>
    );
};

export default Header;