import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface PerformanceOverviewProps {
    overallRating?: number;
    attendance?: number;
    productivity?: number;
}

export function PerformanceOverview({ overallRating = 4.5, attendance = 95, productivity = 88 }: PerformanceOverviewProps) {
    const hasEvaluation = overallRating > 0;

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 10; i++) {
            if (i < fullStars) {
                stars.push(<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
            } else {
                stars.push(<Star key={i} className="h-5 w-5 text-gray-300" />);
            }
        }
        return stars;
    };

    const ProgressBar = ({ percentage, label }: { percentage: number; label: string }) => (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="text-gray-600">{percentage}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-green-600 transition-all duration-300" style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );

    return (
        <Card className="bg-white shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Performance Overview</CardTitle>
                <CardDescription>Your current performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Overall Rating */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Overall Rating</span>
                        <span className="text-sm text-gray-600">{hasEvaluation ? `${overallRating}/10.0` : 'No evaluation'}</span>
                    </div>
                    {hasEvaluation ? (
                        <div className="flex gap-1">{renderStars(overallRating)}</div>
                    ) : (
                        <div className="flex gap-1">
                            {[...Array(10)].map((_, i) => (
                                <Star key={i} className="h-5 w-5 text-gray-300" />
                            ))}
                        </div>
                    )}
                </div>

                {/* Attendance */}
                <ProgressBar percentage={attendance} label="Attendance" />

                {/* Productivity */}
                <ProgressBar percentage={productivity} label="Productivity" />
            </CardContent>
        </Card>
    );
}
