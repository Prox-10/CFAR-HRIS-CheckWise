import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, router } from '@inertiajs/react';
import { Calendar, Download, MapPin, Star, User } from 'lucide-react';
import { EmployeeLayout } from './components/layout/employee-layout';

interface Employee {
    id: string;
    employeeid: string;
    employee_name: string;
    firstname: string;
    lastname: string;
    department: string;
    position: string;
    picture?: string;
}

interface Evaluation {
    id: number;
    ratings: string;
    rating_date: string;
    work_quality: string;
    safety_compliance: string;
    punctuality: string;
    teamwork: string;
    organization: string;
    equipment_handling: string;
    comment: string;
    evaluator_name?: string;
    evaluator_position?: string;
}

interface EvaluationsPageProps {
    employee: Employee;
    evaluation?: Evaluation;
}

const convertRatingToNumber = (rating: string | number) => {
    // Handle both string and number inputs
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;

    // If it's already a number (1-10 scale), return it as is
    if (!isNaN(numRating) && numRating >= 1 && numRating <= 10) {
        return numRating;
    }

    // Fallback for old text-based ratings
    const ratingMap: { [key: string]: number } = {
        Excellent: 10,
        'Very Good': 8,
        Good: 6,
        Fair: 4,
        Poor: 2,
    };
    return ratingMap[rating as string] || 6;
};

const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 10; i++) {
        if (i < rating) {
            stars.push(<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
        } else {
            stars.push(<Star key={i} className="h-5 w-5 text-gray-300" />);
        }
    }
    return stars;
};

const getPerformanceLevel = (rating: number) => {
    if (rating >= 9.0) return 'Excellent Performance';
    if (rating >= 8.0) return 'Very Good Performance';
    if (rating >= 7.0) return 'Good Performance';
    if (rating >= 6.0) return 'Fair Performance';
    return 'Needs Improvement';
};

export default function EvaluationsPage({ employee, evaluation }: EvaluationsPageProps) {
    const handleLogout = () => {
        router.post(
            route('employee_logout'),
            {},
            {
                onSuccess: () => {
                    window.location.href = route('employee_login');
                },
                onError: () => {
                    window.location.href = route('employee_login');
                },
            },
        );
    };

    const handleDownloadPDF = () => {
        // TODO: Implement PDF download functionality
        console.log('Downloading evaluation PDF...');
    };

    // If no evaluation exists, show a message
    if (!evaluation) {
        return (
            <>
                <Head title="Performance Evaluation" />
                <EmployeeLayout employee={employee} currentPage="view evaluation" onLogout={handleLogout}>
                    {/* Page Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
                                <Star className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Performance Evaluation</h1>
                                <p className="text-gray-600">View your latest performance review</p>
                            </div>
                        </div>
                    </div>

                    {/* No Evaluation Message */}
                    <Card>
                        <CardContent className="p-8">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                    <Star className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">No Evaluation Available</h3>
                                <p className="mb-4 text-gray-600">
                                    You don't have any performance evaluations yet. Evaluations are typically conducted quarterly or annually.
                                </p>
                                <p className="text-sm text-gray-500">
                                    Please contact your supervisor or HR department if you have questions about your performance evaluation schedule.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </EmployeeLayout>
            </>
        );
    }

    // Calculate overall rating from real evaluation data
    const overallRating =
        (convertRatingToNumber(evaluation.work_quality) +
            convertRatingToNumber(evaluation.safety_compliance) +
            convertRatingToNumber(evaluation.punctuality) +
            convertRatingToNumber(evaluation.teamwork) +
            convertRatingToNumber(evaluation.organization) +
            convertRatingToNumber(evaluation.equipment_handling)) /
        6;

    const performanceAreas = [
        {
            name: 'Work Quality',
            rating: convertRatingToNumber(evaluation.work_quality),
            description: 'Consistently delivers high-quality work with attention to detail.',
        },
        {
            name: 'Productivity',
            rating: convertRatingToNumber(evaluation.punctuality),
            description: 'Meets and often exceeds daily targets.',
        },
        {
            name: 'Teamwork',
            rating: convertRatingToNumber(evaluation.teamwork),
            description: 'Collaborates with teammates and contributes positively to group projects.',
        },
        {
            name: 'Safety Compliance',
            rating: convertRatingToNumber(evaluation.safety_compliance),
            description: 'Follows all safety protocols and maintains a safe work environment.',
        },
        {
            name: 'Organization',
            rating: convertRatingToNumber(evaluation.organization),
            description: 'Maintains organized workspace and manages time effectively.',
        },
        {
            name: 'Equipment Handling',
            rating: convertRatingToNumber(evaluation.equipment_handling),
            description: 'Properly operates and maintains assigned equipment.',
        },
    ];

    return (
        <>
            <Head title="Performance Evaluation" />
            <EmployeeLayout employee={employee} currentPage="view evaluation" onLogout={handleLogout}>
                {/* Page Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
                            <Star className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Performance Evaluation</h1>
                            <p className="text-gray-600">View your latest performance review</p>
                        </div>
                    </div>
                    <Button onClick={handleDownloadPDF} className="bg-green-600 hover:bg-green-700">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </div>

                {/* Overall Performance Rating Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Overall Performance Rating</CardTitle>
                        <CardDescription>Evaluation Period: January 2024 - June 2024</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {renderStars(overallRating)}
                                <span className="text-lg font-semibold">{overallRating.toFixed(1)}</span>
                            </div>
                            <Badge className="bg-green-100 text-green-800">{overallRating.toFixed(1)}/10.0</Badge>
                        </div>

                        <div className="mb-6 text-center">
                            <div className="mb-1 text-3xl font-bold text-green-600">{overallRating.toFixed(1)}</div>
                            <div className="text-sm text-gray-600">{getPerformanceLevel(overallRating)}</div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-3">
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium">Evaluator</p>
                                    <p className="text-sm text-gray-600">{evaluation?.evaluator_name || 'Maria Santos'}</p>
                                    <p className="text-xs text-gray-500">{evaluation?.evaluator_position || 'Department Supervisor'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium">Evaluated On</p>
                                    <p className="text-sm text-gray-600">
                                        {evaluation?.rating_date ? new Date(evaluation.rating_date).toLocaleDateString() : 'July 15, 2024'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium">Department</p>
                                    <p className="text-sm text-gray-600">{employee.department}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Areas Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Areas</CardTitle>
                        <CardDescription>Detailed breakdown of your performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {performanceAreas.map((area, index) => (
                                <div key={index} className="flex items-start justify-between rounded-lg border p-4">
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900">{area.name}</h3>
                                            <div className="flex items-center gap-1">
                                                {renderStars(area.rating)}
                                                <span className="text-sm font-medium text-gray-600">{area.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">{area.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </EmployeeLayout>
        </>
    );
}
