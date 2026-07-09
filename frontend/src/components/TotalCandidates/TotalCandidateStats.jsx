import { Card, CardContent } from "../ui/card";

const TotalCandidateStats = ({ count = 0 }) => {
    return (
        <Card className="bg-white rounded-lg border border-gray-200 shadow-none">
            <CardContent className="p-4 pt-4">

                <p className="text-sm text-gray-600 mb-1">
                    Total Candidates
                </p>

                <p className="text-2xl font-bold text-gray-900">
                    {count}
                </p>

            </CardContent>
        </Card>
    );
};

export default TotalCandidateStats;