import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Award, Building, Calendar, FileText, Star, User } from 'lucide-react';
import { Evaluation } from '../types/evaluation';

interface EvaluationModalProps {
    isOpen: boolean;
    onClose: () => void;
    evaluation: Evaluation;
    onSubmit?: () => void;
}

export default function ViewEvaluationModal({ isOpen, onClose, evaluation }: EvaluationModalProps) {
    if (!evaluation) return null;

    // Calculate rating info
    const getRatingInfo = (rating: number) => {
        if (rating >= 8) return { label: 'Very Satisfactory', color: 'text-green-600' };
        if (rating >= 5) return { label: 'Satisfactory', color: 'text-yellow-600' };
        return { label: 'Needs Improvement', color: 'text-red-600' };
    };

    const rating = evaluation.total_rating || parseFloat(evaluation.ratings || '0') || 0;
    const ratingInfo = getRatingInfo(rating);

    // Star Rating Component
    const StarRating = ({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
        const sizeClasses = {
            sm: 'h-4 w-4',
            md: 'h-5 w-5',
            lg: 'h-6 w-6',
        };

        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <Star key={star} className={`${sizeClasses[size]} ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
                <span className="ml-2 text-sm font-medium text-gray-600">{rating}/10</span>
            </div>
        );
    };

    // Get evaluation period label
    const periodLabel = evaluation.evaluation_period === 1 ? 'Jan-Jun' : 'Jul-Dec';
    const evaluationFrequency = evaluation.evaluation_frequency || 'annual';

    // Check if this is a new evaluation format
    const isNewFormat = evaluation.attendance || evaluation.attitudes || evaluation.workAttitude || evaluation.workFunctions;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[95vh] max-w-[900px] min-w-[800px] overflow-y-auto border-2 border-green-200 p-6 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-green-800">Employee Evaluation Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Top Card: Employee Profile and Contact Information */}
                    <Card className="border-2 border-green-200 bg-white shadow-lg">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                {/* Left Column: Profile Icon and Name */}
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                                        {evaluation.picture ? (
                                            <img
                                                src={evaluation.picture}
                                                alt={evaluation.employee_name}
                                                className="h-20 w-20 rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-12 w-12 text-green-600" />
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-green-800">{evaluation.employee_name}</h3>
                                        <div className="mt-2 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                                            ID: {evaluation.employeeid}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Personal and Work Details */}
                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                    {/* Personal Details */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-gray-600">Department:</span>
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                {evaluation.department}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-gray-600">Position:</span>
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                {evaluation.position}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-gray-600">Period:</span>
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                {periodLabel} {evaluation.evaluation_year || evaluation.year}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Work Details */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Award className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-gray-600">Frequency:</span>
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                {evaluationFrequency === 'semi_annual' ? 'Semi-Annual' : 'Annual'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-gray-600">Rating Date:</span>
                                            <span className="text-sm font-medium text-gray-800">
                                                {new Date(evaluation.rating_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Star className="h-4 w-4 text-green-600" />
                                            <span className="text-sm text-gray-600">Overall Rating:</span>
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                                {rating}/10
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Middle Card: Employment Information */}
                    <Card className="border-2 border-green-200 bg-white shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Employment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-green-600" />
                                    <div>
                                        <span className="text-sm text-gray-600">Evaluation Period:</span>
                                        <div className="font-semibold text-gray-800">
                                            {periodLabel} {evaluation.evaluation_year || evaluation.year}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Star className="h-5 w-5 text-green-600" />
                                    <div>
                                        <span className="text-sm text-gray-600">Employee Rating:</span>
                                        <div className="text-2xl font-bold text-green-600">{rating}/10</div>
                                    </div>
                                </div>
                            </div>

                            {/* Rating Display */}
                            <div className="mt-6 text-center">
                                <div className="mb-2 text-sm text-gray-600">Overall Performance Rating</div>
                                <div className="text-4xl font-bold text-green-600">{rating}/10</div>
                                <div className={`mt-2 text-lg font-semibold ${ratingInfo.color}`}>{ratingInfo.label}</div>
                                <div className="mt-4 flex justify-center">
                                    <StarRating rating={rating} size="lg" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bottom Card: Personal - New Evaluation Format */}
                    {isNewFormat ? (
                        <Card className="border-2 border-green-200 bg-white shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {/* 1. Attendance */}
                                    {evaluation.attendance && (
                                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                            <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-800">
                                                <Calendar className="h-5 w-5" />
                                                1. Attendance
                                            </h4>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Days Late:</span>
                                                    <div className="text-lg font-semibold text-gray-800">
                                                        {evaluation.attendance.daysLate || evaluation.attendance.days_late}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Days Absent:</span>
                                                    <div className="text-lg font-semibold text-gray-800">
                                                        {evaluation.attendance.daysAbsent || evaluation.attendance.days_absent}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Rating:</span>
                                                    <div className="text-lg font-semibold text-green-600">{evaluation.attendance.rating}/10</div>
                                                </div>
                                            </div>
                                            {evaluation.attendance.remarks && (
                                                <div className="mt-3">
                                                    <span className="text-sm font-medium text-gray-700">Remarks:</span>
                                                    <div className="mt-1 rounded border border-gray-200 bg-white p-2 text-sm text-gray-700">
                                                        {evaluation.attendance.remarks}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 2. Attitude Towards Supervisor */}
                                    {evaluation.attitudes && (
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                            <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-800">
                                                <User className="h-5 w-5" />
                                                2. Attitude Towards Supervisor
                                            </h4>
                                            <div className="mb-3">
                                                <span className="text-sm font-medium text-gray-700">Rating:</span>
                                                <div className="mt-2">
                                                    <StarRating rating={evaluation.attitudes.supervisor_rating} />
                                                </div>
                                            </div>
                                            {evaluation.attitudes.supervisor_remarks && (
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Remarks:</span>
                                                    <div className="mt-1 rounded border border-gray-200 bg-white p-2 text-sm text-gray-700">
                                                        {evaluation.attitudes.supervisor_remarks}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 3. Attitude Towards Co-worker */}
                                    {evaluation.attitudes && (
                                        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                                            <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-purple-800">
                                                <User className="h-5 w-5" />
                                                3. Attitude Towards Co-worker
                                            </h4>
                                            <div className="mb-3">
                                                <span className="text-sm font-medium text-gray-700">Rating:</span>
                                                <div className="mt-2">
                                                    <StarRating rating={evaluation.attitudes.coworker_rating} />
                                                </div>
                                            </div>
                                            {evaluation.attitudes.coworker_remarks && (
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Remarks:</span>
                                                    <div className="mt-1 rounded border border-gray-200 bg-white p-2 text-sm text-gray-700">
                                                        {evaluation.attitudes.coworker_remarks}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 4. Work Attitude/Performance */}
                                    {evaluation.workAttitude && (
                                        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                                            <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-orange-800">
                                                <FileText className="h-5 w-5" />
                                                4. Work Attitude/Performance
                                            </h4>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">Responsible in Work Assignment:</span>
                                                        <div className="mt-1">
                                                            <StarRating rating={evaluation.workAttitude.responsible} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">Job Knowledge:</span>
                                                        <div className="mt-1">
                                                            <StarRating
                                                                rating={evaluation.workAttitude.jobKnowledge || evaluation.workAttitude.job_knowledge}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">Cooperation:</span>
                                                        <div className="mt-1">
                                                            <StarRating rating={evaluation.workAttitude.cooperation} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">Work Initiative:</span>
                                                        <div className="mt-1">
                                                            <StarRating rating={evaluation.workAttitude.initiative} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">Dependability:</span>
                                                        <div className="mt-1">
                                                            <StarRating rating={evaluation.workAttitude.dependability} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {evaluation.workAttitude.remarks && (
                                                <div className="mt-4">
                                                    <span className="text-sm font-medium text-gray-700">Overall Work Attitude Remarks:</span>
                                                    <div className="mt-1 rounded border border-gray-200 bg-white p-2 text-sm text-gray-700">
                                                        {evaluation.workAttitude.remarks}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 5. Work Functions - Department Specific */}
                                    {evaluation.workFunctions && evaluation.workFunctions.length > 0 && (
                                        <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                                            <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-teal-800">
                                                <FileText className="h-5 w-5" />
                                                5. Work Functions - {evaluation.department} Department
                                            </h4>
                                            <div className="space-y-4">
                                                {evaluation.workFunctions.map((workFunction, index) => (
                                                    <div key={index} className="rounded-lg border bg-white p-4">
                                                        <h5 className="mb-3 font-medium text-gray-800">{workFunction.function_name}</h5>
                                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-700">Work Quality:</span>
                                                                <div className="mt-1">
                                                                    <StarRating rating={workFunction.work_quality} />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-700">Work Efficiency:</span>
                                                                <div className="mt-1">
                                                                    <StarRating rating={workFunction.work_efficiency} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Observations/Comments */}
                                    {evaluation.observations && (
                                        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                                            <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-indigo-800">
                                                <FileText className="h-5 w-5" />
                                                Observations / Comments
                                            </h4>
                                            <div className="rounded border border-gray-200 bg-white p-3 text-gray-700">{evaluation.observations}</div>
                                        </div>
                                    )}

                                    {/* Evaluator Information */}
                                    {evaluation.evaluator && (
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800">
                                                <User className="h-5 w-5" />
                                                Evaluation Signatures
                                            </h4>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Evaluated by:</span>
                                                    <div className="mt-1 font-semibold text-gray-800">{evaluation.evaluator}</div>
                                                </div>
                                                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                                    <div className="text-sm font-medium text-green-700">Approved by:</div>
                                                    <div className="font-semibold text-green-800">Carmela B. Pedregosa</div>
                                                    <div className="text-sm text-green-700">Manager</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        /* Legacy Evaluation Format Display */
                        <Card className="border-2 border-green-200 bg-white shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal - Legacy Format
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    {/* Legacy Evaluation Criteria */}
                                    <div>
                                        <h4 className="mb-4 text-lg font-semibold text-gray-800">Legacy Evaluation Criteria</h4>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Work Quality</label>
                                                    <div className="mt-1">
                                                        <StarRating rating={parseFloat(evaluation.work_quality || '0')} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Safety Compliance</label>
                                                    <div className="mt-1">
                                                        <StarRating rating={parseFloat(evaluation.safety_compliance || '0')} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Equipment Handling</label>
                                                    <div className="mt-1">
                                                        <StarRating rating={parseFloat(evaluation.equipment_handling || '0')} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Teamwork</label>
                                                    <div className="mt-1">
                                                        <StarRating rating={parseFloat(evaluation.teamwork || '0')} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Punctuality</label>
                                                    <div className="mt-1">
                                                        <StarRating rating={parseFloat(evaluation.punctuality || '0')} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-700">Organization</label>
                                                    <div className="mt-1">
                                                        <StarRating rating={parseFloat(evaluation.organization || '0')} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Legacy Additional Comments */}
                                    {evaluation.comment && (
                                        <div>
                                            <h4 className="mb-2 text-lg font-semibold text-gray-800">Additional Comments</h4>
                                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                                <p className="text-gray-700">{evaluation.comment}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Rating Legend */}
                    <Card className="border-2 border-green-200 bg-white shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Rating Legend
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-wrap justify-center gap-6 text-lg font-medium">
                                <span className="text-red-600">1-4 = Fail</span>
                                <span className="text-yellow-600">5-7 = Satisfactory</span>
                                <span className="text-green-600">8-9 = Very Satisfactory</span>
                                <span className="text-blue-600">10 = Excellent</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-2 border-gray-300 bg-white px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
