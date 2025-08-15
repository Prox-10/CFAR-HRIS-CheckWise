import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { Evaluation } from '../types/evaluation';

interface EvaluationModalProps {
    isOpen: boolean;
    onClose: () => void;
    evaluation: Evaluation;
    onSubmit?: () => void;
}

const criteria = [
    { key: 'work_quality', label: 'Work Quality' },
    { key: 'safety_compliance', label: 'Safety Compliance' },
    { key: 'equipment_handling', label: 'Equipment Handling' },
    { key: 'teamwork', label: 'Teamwork' },
    { key: 'punctuality', label: 'Punctuality' },
    { key: 'organization', label: 'Organization' },
];

export default function ViewEvaluationModal({ isOpen, onClose, evaluation }: EvaluationModalProps) {
    if (!evaluation) return null;

    // Prepare criteria values from evaluation
    const criteriaValues = [
        { key: 'work_quality', label: 'Work Quality', value: Number(evaluation.work_quality) },
        { key: 'safety_compliance', label: 'Safety Compliance', value: Number(evaluation.safety_compliance) },
        { key: 'equipment_handling', label: 'Equipment Handling', value: Number(evaluation.equipment_handling) },
        { key: 'teamwork', label: 'Teamwork', value: Number(evaluation.teamwork) },
        { key: 'punctuality', label: 'Punctuality', value: Number(evaluation.punctuality) },
        { key: 'organization', label: 'Organization', value: Number(evaluation.organization) },
    ];

    // Calculate average from evaluation.ratings (already calculated in backend)
    const average = evaluation.ratings;
    const comment = evaluation.comment;
    const periodLabel = evaluation.period_label || (evaluation.period === 1 ? 'Jan-Jun' : 'Jul-Dec');
    const evaluationFrequency = evaluation.evaluation_frequency || 'annual';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] min-w-2xl overflow-y-auto border-2 border-cfar-500 p-5 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-green-800">View Evaluation</DialogTitle>
                </DialogHeader>
                {evaluation && (
                    <div className="mb-4 flex items-center gap-4 rounded bg-green-100 p-4">
                        {/* Employee Profile Image */}
                        <div className="flex-shrink-0">
                            <img
                                src={evaluation.picture || 'Logo.png'}
                                alt={`${evaluation.employee_name} profile`}
                                className="h-16 w-16 rounded-full border border-cfar-400 bg-white object-cover"
                            />
                        </div>
                        <div>
                            <div className="text-lg font-semibold">{evaluation.employee_name}</div>
                            <div className="text-sm text-gray-500">{evaluation.employeeid}</div>
                            <div className="mt-2 flex gap-2">
                                <Badge variant="outline">{evaluation.department}</Badge>
                                <Badge variant="outline">{evaluation.position}</Badge>
                            </div>
                        </div>
                    </div>
                )}

                {/* Evaluation Period and Frequency Info */}
                <div className="mb-4 rounded bg-blue-50 p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-blue-700">Evaluation Period:</span>
                            <div className="font-semibold text-blue-800">
                                {periodLabel} {evaluation.year}
                            </div>
                        </div>
                        <div>
                            <span className="font-medium text-blue-700">Frequency:</span>
                            <div className="font-semibold text-blue-800 capitalize">
                                {evaluationFrequency === 'semi_annual' ? 'Semi-Annual' : 'Annual'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="mb-2 font-semibold text-green-700">Evaluation Criteria</div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {criteriaValues.map((c) => (
                            <div key={c.key} className="flex flex-col gap-1">
                                <span>{c.label}</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-5 w-5 ${c.value >= star ? 'fill-green-600 text-green-600' : 'text-gray-300'}`}
                                        />
                                    ))}
                                    <span className="ml-2 text-sm text-gray-700">{c.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mb-4">
                    <div className="mb-1 font-medium text-green-700">Additional Notes</div>
                    <Textarea value={comment} readOnly className="cursor-not-allowed resize-none bg-gray-100" />
                </div>
                <div className="mb-4 rounded bg-green-100 p-4 text-center">
                    <div className="text-sm text-green-700">Average Score</div>
                    <div className="text-3xl font-bold text-green-800">{average}</div>
                    <div className="mt-1 flex justify-center">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                            <Star key={star} className={`h-6 w-6 ${Number(average) >= star ? 'fill-green-600 text-green-600' : 'text-gray-300'}`} />
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
