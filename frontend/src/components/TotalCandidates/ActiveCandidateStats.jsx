import { Card, CardContent } from "../ui/card";

const ActiveCandidateStats = ({ count = 0 }) => {
    return (
        <Card className="bg-white rounded-lg border border-gray-200 shadow-none">
            <CardContent className="p-4 pt-4">

                <p className="text-sm text-gray-600 mb-1">
                    Interviewed Candidates
                </p>

                <p className="text-2xl font-bold text-blue-600">
                    {count}
                </p>

            </CardContent>
        </Card>
    );
};

export default ActiveCandidateStats;