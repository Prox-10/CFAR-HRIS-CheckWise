import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ContentLoading } from '@/components/ui/loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { Employees } from '@/hooks/employees';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Calendar, Download, FileText, RotateCcw, Star, User, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Evaluation Management',
        href: '/evaluation',
    },
    {
        title: 'Department Evaluation',
        href: '/evaluation/department-evaluation',
    },
];

interface Props {
    departments: string[];
    employees_all: Employees[];
    evaluation_configs: any[];
    user_permissions: {
        can_evaluate: boolean;
        is_super_admin: boolean;
        is_supervisor: boolean;
        evaluable_departments: string[];
    };
}

interface EvaluationData {
    attendance: {
        daysLate: number;
        daysAbsent: number;
        rating: number;
        remarks: string;
    };
    attitudeSupervisor: {
        rating: number;
        remarks: string;
    };
    attitudeCoworker: {
        rating: number;
        remarks: string;
    };
    workAttitude: {
        responsible: number;
        jobKnowledge: number;
        cooperation: number;
        initiative: number;
        dependability: number;
        remarks: string;
    };
    workFunctions: {
        [key: string]: {
            workQuality: number;
            workEfficiency: number;
        };
    };
    observations: string;
    evaluator: string;
}

// Department-specific work functions
const departmentWorkFunctions = {
    Monthly: [
        'Encode workers daily time & accomplishment report (WDTAR)',
        'Prepare the payroll of periodic paid employees, COOP leave, honorarium and hired workers',
        'Maintain files of timesheets and other source documents',
        'Update generation of documents for remittance/payment schedules',
        'Prepare and furnish the bookkeeper summary of beneficiary deductions',
    ],
    Packing: [
        'Package products according to quality standards',
        'Maintain packaging material inventory',
        'Ensure proper labeling and documentation',
        'Follow safety protocols during packaging',
        'Meet daily packaging targets and deadlines',
    ],
    Harvest: [
        'Harvest crops at optimal maturity',
        'Sort and grade harvested produce',
        'Maintain harvest equipment and tools',
        'Follow sustainable harvesting practices',
        'Coordinate with logistics for timely delivery',
    ],
    PDC: [
        'Process and package dried crops',
        'Maintain drying facility equipment',
        'Monitor moisture content and quality',
        'Ensure proper storage conditions',
        'Coordinate with quality control team',
    ],
    'Coop Area': [
        'Manage cooperative area operations',
        'Coordinate with member farmers',
        'Maintain cooperative facilities',
        'Process member applications and records',
        'Organize cooperative meetings and events',
    ],
    Engineering: [
        'Repair & Maintenance of Vehicles/Equipment',
        'Assist in Farm Equipment Needs',
        'Machine Operation and Troubleshooting',
        'Equipment Safety Inspections',
        'Perform Other Duties as Assigned',
    ],
};

export default function DepartmentEvaluation({ departments, employees_all, evaluation_configs, user_permissions }: Props) {
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [evaluationData, setEvaluationData] = useState<EvaluationData>({
        attendance: { daysLate: 0, daysAbsent: 0, rating: 10, remarks: '' },
        attitudeSupervisor: { rating: 0, remarks: '' },
        attitudeCoworker: { rating: 0, remarks: '' },
        workAttitude: {
            responsible: 0,
            jobKnowledge: 0,
            cooperation: 0,
            initiative: 0,
            dependability: 0,
            remarks: '',
        },
        workFunctions: {},
        observations: '',
        evaluator: '',
    });

    // State for existing evaluation
    const [existingEvaluation, setExistingEvaluation] = useState<any>(null);
    const [isFormReadOnly, setIsFormReadOnly] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Allowed departments based on role/permissions
    const allowedDepartments = useMemo(() => {
        if (user_permissions?.is_super_admin) return departments;
        if (Array.isArray(user_permissions?.evaluable_departments) && user_permissions.evaluable_departments.length > 0) {
            return departments.filter((dept) => user_permissions.evaluable_departments.includes(dept));
        }
        return departments;
    }, [departments, user_permissions]);

    // Filter employees by selected department
    const filteredEmployees = useMemo(() => {
        if (!selectedDepartment) return [];
        return employees_all.filter((emp) => emp.department === selectedDepartment);
    }, [selectedDepartment, employees_all]);

    // Get selected employee details
    const selectedEmployeeData = useMemo(() => {
        const matchId = (emp: any) => String((emp as any).id ?? (emp as any).employee_id ?? (emp as any).employeeid) === String(selectedEmployee);
        return employees_all.find((emp: any) => matchId(emp));
    }, [selectedEmployee, employees_all]);

    // Check for existing evaluation when employee is selected
    const checkExistingEvaluation = async (employeeId: string, department: string) => {
        if (!employeeId || !department) return;

        try {
            const response = await fetch(`/evaluation/check-existing/${employeeId}/${department}`);
            const data = await response.json();

            if (data.exists) {
                setExistingEvaluation(data.evaluation);
                setIsFormReadOnly(true);

                // Populate form with existing data
                if (data.evaluation.attendance) {
                    const newEvaluationData = {
                        attendance: {
                            daysLate: parseInt(data.evaluation.attendance.days_late) || 0,
                            daysAbsent: parseInt(data.evaluation.attendance.days_absent) || 0,
                            rating: parseFloat(data.evaluation.attendance.rating) || 10,
                            remarks: data.evaluation.attendance.remarks || '',
                        },
                        attitudeSupervisor: {
                            rating: parseFloat(data.evaluation.attitudes?.supervisor_rating) || 0,
                            remarks: data.evaluation.attitudes?.supervisor_remarks || '',
                        },
                        attitudeCoworker: {
                            rating: parseFloat(data.evaluation.attitudes?.coworker_rating) || 0,
                            remarks: data.evaluation.attitudes?.coworker_remarks || '',
                        },
                        workAttitude: {
                            responsible: parseFloat(data.evaluation.workAttitude?.responsible) || 0,
                            jobKnowledge: parseFloat(data.evaluation.workAttitude?.job_knowledge) || 0,
                            cooperation: parseFloat(data.evaluation.workAttitude?.cooperation) || 0,
                            initiative: parseFloat(data.evaluation.workAttitude?.initiative) || 0,
                            dependability: parseFloat(data.evaluation.workAttitude?.dependability) || 0,
                            remarks: data.evaluation.workAttitude?.remarks || '',
                        },
                        workFunctions: {} as { [key: string]: { workQuality: number; workEfficiency: number } },
                        observations: data.evaluation.observations || '',
                        evaluator: data.evaluation.evaluator || '',
                    };

                    // Handle work functions separately to ensure proper structure
                    // First, initialize with department's default work functions
                    if (departmentWorkFunctions[department as keyof typeof departmentWorkFunctions]) {
                        const functions = departmentWorkFunctions[department as keyof typeof departmentWorkFunctions];
                        functions.forEach((func) => {
                            (newEvaluationData.workFunctions as any)[func] = {
                                workQuality: 0,
                                workEfficiency: 0,
                            };
                        });
                    }

                    // Then, overlay any existing work functions data
                    if (data.evaluation.workFunctions && Array.isArray(data.evaluation.workFunctions)) {
                        data.evaluation.workFunctions.forEach((func: any) => {
                            if (func.function_name) {
                                // Check if this function exists in our department's work functions
                                if ((newEvaluationData.workFunctions as any)[func.function_name]) {
                                    (newEvaluationData.workFunctions as any)[func.function_name] = {
                                        workQuality: parseFloat(func.work_quality) || 0,
                                        workEfficiency: parseFloat(func.work_efficiency) || 0,
                                    };
                                }
                            }
                        });
                    }

                    // Set the complete evaluation data
                    setEvaluationData(newEvaluationData);
                }
            } else {
                setExistingEvaluation(null);
                setIsFormReadOnly(false);
                // Keep current selections and initialized form; do not reset on no existing evaluation
            }
        } catch (error) {
            console.error('Error checking existing evaluation:', error);
        }
    };

    // Debug: Monitor evaluationData changes - REMOVED to prevent infinite loop
    // useEffect(() => {
    //     console.log('evaluationData changed:', evaluationData);
    //     console.log('workAttitude values:', {
    //         responsible: evaluationData.workAttitude.responsible,
    //         jobKnowledge: evaluationData.workAttitude.jobKnowledge,
    //         cooperation: evaluationData.workAttitude.cooperation,
    //         initiative: evaluationData.workAttitude.initiative,
    //         dependability: evaluationData.workAttitude.dependability,
    //     });
    //     console.log('workFunctions values:', evaluationData.workFunctions);
    // }, [evaluationData]);

    // Get evaluation frequency for selected department
    const departmentEvaluationFrequency = useMemo(() => {
        if (!selectedDepartment) return 'annual';
        // Ensure evaluation_configs is an array before using .find()
        if (!Array.isArray(evaluation_configs)) return 'annual';
        const config = evaluation_configs.find((cfg) => cfg.department === selectedDepartment);
        return config ? config.evaluation_frequency : 'annual';
    }, [selectedDepartment, evaluation_configs]);

    // Initialize work functions when department changes
    useEffect(() => {
        if (selectedDepartment && departmentWorkFunctions[selectedDepartment as keyof typeof departmentWorkFunctions]) {
            const functions = departmentWorkFunctions[selectedDepartment as keyof typeof departmentWorkFunctions];
            const initialWorkFunctions: { [key: string]: { workQuality: number; workEfficiency: number } } = {};

            functions.forEach((func) => {
                // Always initialize with default values - existing data will be loaded separately
                initialWorkFunctions[func] = { workQuality: 0, workEfficiency: 0 };
            });

            // Initialize work functions structure for the department
            setEvaluationData((prev) => {
                // Only initialize if work functions are empty or don't match the current department
                const currentWorkFunctions = prev.workFunctions || {};
                const expectedFunctions = departmentWorkFunctions[selectedDepartment as keyof typeof departmentWorkFunctions] || [];

                // Check if we need to initialize (empty or different structure)
                const needsInitialization =
                    Object.keys(currentWorkFunctions).length === 0 || !expectedFunctions.every((func) => currentWorkFunctions[func]);

                if (needsInitialization) {
                    return {
                        ...prev,
                        workFunctions: initialWorkFunctions,
                    };
                } else {
                    return prev;
                }
            });
        }
    }, [selectedDepartment]);

    // Calculate attendance rating
    const calculateAttendanceRating = (late: number, absent: number) => {
        const total = late + absent;
        // Better formula: Perfect attendance (0 late/absent) = 10, Max penalty = 0
        // Formula: 10 - (total / 24) * 10, capped at 0
        const rating = Math.max(0, 10 - (total / 24) * 10);
        return Math.round(rating * 10) / 10;
    };

    // Update attendance rating when late/absent changes
    useEffect(() => {
        const rating = calculateAttendanceRating(evaluationData.attendance.daysLate, evaluationData.attendance.daysAbsent);
        setEvaluationData((prev) => ({
            ...prev,
            attendance: { ...prev.attendance, rating },
        }));
    }, [evaluationData.attendance.daysLate, evaluationData.attendance.daysAbsent]);

    // Calculate total rating
    const totalRating = useMemo(() => {
        const attendanceScore = evaluationData.attendance.rating || 0;
        const attitudeSupervisorScore = evaluationData.attitudeSupervisor.rating || 0;
        const attitudeCoworkerScore = evaluationData.attitudeCoworker.rating || 0;

        const workAttitudeScores = [
            evaluationData.workAttitude.responsible || 0,
            evaluationData.workAttitude.jobKnowledge || 0,
            evaluationData.workAttitude.cooperation || 0,
            evaluationData.workAttitude.initiative || 0,
            evaluationData.workAttitude.dependability || 0,
        ];
        const workAttitudeAvg = workAttitudeScores.reduce((a, b) => a + b, 0) / workAttitudeScores.length;

        const workFunctionScores = Object.values(evaluationData.workFunctions || {}).map((func: any) => {
            const quality = func?.workQuality || 0;
            const efficiency = func?.workEfficiency || 0;
            return (quality + efficiency) / 2;
        });
        const workFunctionAvg = workFunctionScores.length > 0 ? workFunctionScores.reduce((a, b) => a + b, 0) / workFunctionScores.length : 0;

        const total = (attendanceScore + attitudeSupervisorScore + attitudeCoworkerScore + workAttitudeAvg + workFunctionAvg) / 5;

        // Ensure we don't return NaN
        return isNaN(total) ? 0 : Math.round(total * 10) / 10;
    }, [evaluationData, existingEvaluation]);

    // Get rating label and color
    const getRatingInfo = (rating: number) => {
        if (rating >= 8) return { label: 'Very Satisfactory', color: 'text-green-600' };
        if (rating >= 5) return { label: 'Satisfactory', color: 'text-yellow-600' };
        return { label: 'Needs Improvement', color: 'text-red-600' };
    };

    // Initialize Inertia form
    const { data, setData, post, processing, errors } = useForm({
        department: '',
        employee_id: '',
        attendance: {
            daysLate: 0,
            daysAbsent: 0,
            rating: 10,
            remarks: '',
        },
        attitudeSupervisor: {
            rating: 0,
            remarks: '',
        },
        attitudeCoworker: {
            rating: 0,
            remarks: '',
        },
        workAttitude: {
            responsible: 0,
            jobKnowledge: 0,
            cooperation: 0,
            initiative: 0,
            dependability: 0,
            remarks: '',
        },
        workFunctions: {},
        observations: '',
        evaluator: '',
    });

    // Remove problematic useEffect hooks that cause infinite loops
    // useEffect(() => {
    //     if (Object.keys(evaluationData.workFunctions).length > 0) {
    //         setData((prev) => ({
    //             ...prev,
    //             workFunctions: evaluationData.workFunctions,
    //         }));
    //     }
    // }, [evaluationData.workFunctions, setData]);

    // Sync all evaluation data with Inertia form when it changes
    useEffect(() => {
        // Keep Inertia form data in sync with component state at all times
        setData((prev) => ({
            ...prev,
            attendance: evaluationData.attendance,
            attitudeSupervisor: evaluationData.attitudeSupervisor,
            attitudeCoworker: evaluationData.attitudeCoworker,
            workAttitude: evaluationData.workAttitude,
            workFunctions: evaluationData.workFunctions,
            observations: evaluationData.observations,
            evaluator: evaluationData.evaluator,
        }));
    }, [evaluationData, setData]);

    const handleSubmit = () => {
        if (isFormReadOnly) {
            toast.error('Cannot submit evaluation for an employee who has already been evaluated');
            return;
        }

        if (!selectedDepartment || !selectedEmployee) {
            toast.error('Please select both department and employee');
            return;
        }

        if (!evaluationData.evaluator.trim()) {
            toast.error('Please enter evaluator name and position');
            return;
        }

        // Check if workFunctions has data
        if (Object.keys(evaluationData.workFunctions).length === 0) {
            toast.error('Please complete the work functions evaluation');
            return;
        }

        const payload = {
            department: selectedDepartment,
            employee_id: selectedEmployee,
            attendance: evaluationData.attendance,
            attitudeSupervisor: evaluationData.attitudeSupervisor,
            attitudeCoworker: evaluationData.attitudeCoworker,
            workAttitude: evaluationData.workAttitude,
            workFunctions: evaluationData.workFunctions,
            observations: evaluationData.observations,
            evaluator: evaluationData.evaluator,
        } as const;

        setSubmitting(true);
        const submitPromise = new Promise<void>((resolve, reject) => {
            router.post('/evaluation/department-evaluation', payload, {
                onSuccess: () => {
                    setSubmitting(false);
                    resolve();
                    handleReset();
                },
                onError: (errors: any) => {
                    setSubmitting(false);
                    console.error('Form errors:', errors);
                    reject(errors);
                },
                onFinish: () => {
                    setSubmitting(false);
                },
                preserveScroll: true,
            });
        });

        toast.promise(submitPromise, {
            loading: 'Submitting evaluation... calculating ratings...',
            success: 'Evaluation submitted successfully!',
            error: 'Failed to submit evaluation. Please check your inputs.',
        });
    };

    const handleReset = () => {
        setSelectedDepartment('');
        setSelectedEmployee('');
        setExistingEvaluation(null);
        setIsFormReadOnly(false);
        setEvaluationData({
            attendance: { daysLate: 0, daysAbsent: 0, rating: 10, remarks: '' },
            attitudeSupervisor: { rating: 0, remarks: '' },
            attitudeCoworker: { rating: 0, remarks: '' },
            workAttitude: {
                responsible: 0,
                jobKnowledge: 0,
                cooperation: 0,
                initiative: 0,
                dependability: 0,
                remarks: '',
            },
            workFunctions: {},
            observations: '',
            evaluator: '',
        });

        // Reset Inertia form data
        setData({
            department: '',
            employee_id: '',
            attendance: { daysLate: 0, daysAbsent: 0, rating: 10, remarks: '' },
            attitudeSupervisor: { rating: 0, remarks: '' },
            attitudeCoworker: { rating: 0, remarks: '' },
            workAttitude: {
                responsible: 0,
                jobKnowledge: 0,
                cooperation: 0,
                initiative: 0,
                dependability: 0,
                remarks: '',
            },
            workFunctions: {},
            observations: '',
            evaluator: '',
        });
    };

    const StarRating = ({
        rating,
        onRatingChange,
        size = 'md',
        disabled = false,
    }: {
        rating: number;
        onRatingChange: (rating: number) => void;
        size?: 'sm' | 'md' | 'lg';
        disabled?: boolean;
    }) => {
        const sizeClasses = {
            sm: 'h-4 w-4',
            md: 'h-5 w-5',
            lg: 'h-6 w-6',
        };

        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onRatingChange(star)}
                        className={`transition-colors hover:scale-110 focus:outline-none ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                        disabled={disabled}
                    >
                        <Star className={`${sizeClasses[size]} ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    </button>
                ))}
                <span className="ml-2 text-sm font-medium text-gray-600">{rating}/10</span>
            </div>
        );
    };

    return (
        <SidebarProvider>
            <Head title="Department Evaluation" />
            <Toaster position="top-center" richColors />

            {/* Sidebar hover logic */}
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    {processing ? (
                        <ContentLoading />
                    ) : (
                        <>
                            <Main fixed>
                                <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                                    <div>
                                        <div className="ms-2 flex items-center">
                                            <Users className="size-11" />
                                            <div className="ms-2">
                                                <h2 className="flex text-2xl font-bold tracking-tight">Department Evaluation</h2>
                                                <p className="text-muted-foreground">Evaluate employees by department with specific criteria</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Department and Employee Selection */}
                                <Card className="border-main dark:bg-backgrounds mb-6 bg-background drop-shadow-lg">
                                    <CardHeader>
                                        <CardTitle>Department & Employee Selection</CardTitle>
                                        <CardDescription>Select department and employee to begin evaluation</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                            {/* Department Selection */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-700">
                                                    Department
                                                    <span className="ms-1 text-sm text-red-500">*</span>
                                                </Label>
                                                <Select
                                                    value={selectedDepartment}
                                                    onValueChange={async (value) => {
                                                        setSelectedDepartment(value);
                                                        setData((prev) => ({ ...prev, department: value }));
                                                        // Clear employee selection when department changes
                                                        setSelectedEmployee('');
                                                        setExistingEvaluation(null);
                                                        setIsFormReadOnly(false);
                                                        // Reset evaluation data to clear any previous data
                                                        setEvaluationData({
                                                            attendance: { daysLate: 0, daysAbsent: 0, rating: 10, remarks: '' },
                                                            attitudeSupervisor: { rating: 0, remarks: '' },
                                                            attitudeCoworker: { rating: 0, remarks: '' },
                                                            workAttitude: {
                                                                responsible: 0,
                                                                jobKnowledge: 0,
                                                                cooperation: 0,
                                                                initiative: 0,
                                                                dependability: 0,
                                                                remarks: '',
                                                            },
                                                            workFunctions: {},
                                                            observations: '',
                                                            evaluator: '',
                                                        });
                                                    }}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select Department" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {allowedDepartments.map((dept) => (
                                                            <SelectItem key={dept} value={dept}>
                                                                {dept}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Employee Selection */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-700">
                                                    Employee
                                                    <span className="ms-1 text-sm text-red-500">*</span>
                                                </Label>
                                                <Select
                                                    value={selectedEmployee}
                                                    onValueChange={(value) => {
                                                        setSelectedEmployee(value);
                                                        setData((prev) => ({ ...prev, employee_id: value }));
                                                        checkExistingEvaluation(value, selectedDepartment);
                                                    }}
                                                    disabled={!selectedDepartment}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue
                                                            placeholder={selectedDepartment ? 'Select Employee' : 'Select Department First'}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {filteredEmployees.map((emp: any) => (
                                                            <SelectItem
                                                                key={String((emp as any).id ?? (emp as any).employee_id ?? (emp as any).employeeid)}
                                                                value={String((emp as any).id ?? (emp as any).employee_id ?? (emp as any).employeeid)}
                                                            >
                                                                {emp.employee_name} - {emp.position}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Work Status Display */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-700">Work Status</Label>
                                                <div className="rounded-lg border bg-gray-50 px-3 py-2">
                                                    {selectedEmployeeData ? (
                                                        <Badge variant="secondary" className="text-sm">
                                                            {selectedEmployeeData.work_status}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">Select employee to view status</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Department Evaluation Frequency */}
                                        {selectedDepartment && (
                                            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                                <div className="text-sm text-blue-700">
                                                    <strong>Evaluation Frequency:</strong>{' '}
                                                    {departmentEvaluationFrequency === 'semi_annual' ? 'Semi-Annual (Jan-Jun & Jul-Dec)' : 'Annual'}
                                                </div>
                                            </div>
                                        )}

                                        {/* Selected Employee Info */}
                                        {selectedEmployeeData && (
                                            <div className="mt-6 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={
                                                            typeof selectedEmployeeData.picture === 'string'
                                                                ? selectedEmployeeData.picture
                                                                : '/Logo.png'
                                                        }
                                                        alt={selectedEmployeeData.employee_name}
                                                        className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-lg"
                                                    />
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-800">{selectedEmployeeData.employee_name}</h3>
                                                        <p className="text-gray-600">{selectedEmployeeData.position}</p>
                                                        <p className="text-sm text-gray-500">ID: {selectedEmployeeData.employeeid}</p>
                                                    </div>
                                                </div>

                                                {/* Evaluation Status */}
                                                <div className="mt-4 rounded-lg border border-blue-200 bg-white p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-sm text-blue-700">
                                                            <strong>Evaluation Status:</strong>
                                                        </div>
                                                        <div className="text-right">
                                                            {(() => {
                                                                const now = new Date();
                                                                const currentPeriod = now.getMonth() <= 5 ? 1 : 2;
                                                                const currentYear = now.getFullYear();
                                                                const periodLabel = currentPeriod === 1 ? 'Jan-Jun' : 'Jul-Dec';
                                                                const frequency = departmentEvaluationFrequency;

                                                                return (
                                                                    <div className="text-sm">
                                                                        <div className="font-medium text-blue-800">
                                                                            {frequency === 'semi_annual' ? 'Semi-Annual' : 'Annual'}
                                                                        </div>
                                                                        <div className="text-blue-600">
                                                                            Current Period: {periodLabel} {currentYear}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Existing Evaluation Warning */}
                                                {existingEvaluation && (
                                                    <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-orange-600">⚠️</div>
                                                            <div>
                                                                <div className="font-medium text-orange-800">Employee Already Evaluated</div>
                                                                <div className="text-sm text-orange-700">
                                                                    {existingEvaluation.message ||
                                                                        'This employee has already been evaluated for the current period.'}
                                                                </div>
                                                                <div className="mt-1 text-xs text-orange-600">
                                                                    Evaluation Date: {existingEvaluation.rating_date}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Evaluation Form */}
                                {selectedEmployeeData && (
                                    <div className="space-y-6">
                                        {/* Read-Only Message */}
                                        {isFormReadOnly && (
                                            <Card className="border-main dark:bg-backgrounds border-orange-200 bg-orange-50 drop-shadow-lg">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-2xl">📋</div>
                                                        <div>
                                                            <div className="font-medium text-orange-800">Viewing Existing Evaluation</div>
                                                            <div className="text-sm text-orange-700">
                                                                This form is read-only because the employee has already been evaluated for the current
                                                                period. You can view the evaluation details or clear the form to start a new
                                                                evaluation.
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* 1. Attendance */}
                                        <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Calendar className="h-5 w-5" />
                                                    1. Attendance
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-gray-700">Days Late</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={evaluationData.attendance.daysLate}
                                                            onChange={(e) =>
                                                                setEvaluationData((prev) => ({
                                                                    ...prev,
                                                                    attendance: { ...prev.attendance, daysLate: parseInt(e.target.value) || 0 },
                                                                }))
                                                            }
                                                            className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                                                            readOnly={isFormReadOnly}
                                                            disabled={isFormReadOnly}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-gray-700">Days Absent</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={evaluationData.attendance.daysAbsent}
                                                            onChange={(e) =>
                                                                setEvaluationData((prev) => ({
                                                                    ...prev,
                                                                    attendance: { ...prev.attendance, daysAbsent: parseInt(e.target.value) || 0 },
                                                                }))
                                                            }
                                                            className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-green-500"
                                                            readOnly={isFormReadOnly}
                                                            disabled={isFormReadOnly}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                                                    <div className="mb-2 text-sm text-green-700">
                                                        <strong>Formula:</strong> 10 - ((Late + Absent) / 24 × 10) = Rating (minimum: 0)
                                                    </div>
                                                    <div className="mb-2 text-sm text-green-700">
                                                        <strong>Calculation:</strong> 10 - ({evaluationData.attendance.daysLate} +{' '}
                                                        {evaluationData.attendance.daysAbsent}) / 24 × 10 ={' '}
                                                        {(
                                                            10 -
                                                            ((evaluationData.attendance.daysLate + evaluationData.attendance.daysAbsent) / 24) * 10
                                                        ).toFixed(1)}
                                                    </div>
                                                    <div className="text-lg font-semibold text-green-800">
                                                        Calculated Rating: {evaluationData.attendance.rating}
                                                    </div>
                                                    <div className="mt-2 text-sm text-green-600">
                                                        {evaluationData.attendance.rating >= 8
                                                            ? 'Excellent Attendance'
                                                            : evaluationData.attendance.rating >= 5
                                                              ? 'Good Attendance'
                                                              : evaluationData.attendance.rating >= 3
                                                                ? 'Fair Attendance'
                                                                : 'Poor Attendance'}
                                                    </div>
                                                </div>

                                                <div className="mt-4 space-y-2">
                                                    <label className="text-sm font-medium text-gray-700">Remarks</label>
                                                    <Textarea
                                                        placeholder="Enter remarks about attendance..."
                                                        value={evaluationData.attendance.remarks}
                                                        onChange={(e) =>
                                                            setEvaluationData((prev) => ({
                                                                ...prev,
                                                                attendance: { ...prev.attendance, remarks: e.target.value },
                                                            }))
                                                        }
                                                        className="resize-none"
                                                        readOnly={isFormReadOnly}
                                                        disabled={isFormReadOnly}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* 2. Attitude Towards Supervisor */}
                                        <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                                <CardTitle className="flex items-center gap-2">
                                                    <User className="h-5 w-5" />
                                                    2. Attitude Towards Supervisor
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium text-gray-700">Rating</label>
                                                        <StarRating
                                                            rating={evaluationData.attitudeSupervisor.rating}
                                                            onRatingChange={(rating) =>
                                                                setEvaluationData((prev) => ({
                                                                    ...prev,
                                                                    attitudeSupervisor: { ...prev.attitudeSupervisor, rating },
                                                                }))
                                                            }
                                                            disabled={isFormReadOnly}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700">Remarks</label>
                                                        <Textarea
                                                            placeholder="Enter remarks about attitude towards supervisor..."
                                                            value={evaluationData.attitudeSupervisor.remarks}
                                                            onChange={(e) =>
                                                                setEvaluationData((prev) => ({
                                                                    ...prev,
                                                                    attitudeSupervisor: { ...prev.attitudeSupervisor, remarks: e.target.value },
                                                                }))
                                                            }
                                                            className="resize-none"
                                                            readOnly={isFormReadOnly}
                                                            disabled={isFormReadOnly}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* 3. Attitude Towards Co-worker */}
                                        <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                                <CardTitle className="flex items-center gap-2">
                                                    <User className="h-5 w-5" />
                                                    3. Attitude Towards Co-worker
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium text-gray-700">Rating</label>
                                                        <StarRating
                                                            rating={evaluationData.attitudeCoworker.rating}
                                                            onRatingChange={(rating) =>
                                                                setEvaluationData((prev) => ({
                                                                    ...prev,
                                                                    attitudeCoworker: { ...prev.attitudeCoworker, rating },
                                                                }))
                                                            }
                                                            disabled={isFormReadOnly}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700">Remarks</label>
                                                        <Textarea
                                                            placeholder="Enter remarks about attitude towards co-workers..."
                                                            value={evaluationData.attitudeCoworker.remarks}
                                                            onChange={(e) =>
                                                                setEvaluationData((prev) => ({
                                                                    ...prev,
                                                                    attitudeCoworker: { ...prev.attitudeCoworker, remarks: e.target.value },
                                                                }))
                                                            }
                                                            className="resize-none"
                                                            readOnly={isFormReadOnly}
                                                            disabled={isFormReadOnly}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* 4. Work Attitude/Performance */}
                                        <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                                                <CardTitle className="flex items-center gap-2">
                                                    <FileText className="h-5 w-5" />
                                                    4. Work Attitude/Performance
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                                Responsible in Work Assignment
                                                            </label>
                                                            <StarRating
                                                                rating={evaluationData.workAttitude.responsible}
                                                                onRatingChange={(rating) =>
                                                                    setEvaluationData((prev) => ({
                                                                        ...prev,
                                                                        workAttitude: { ...prev.workAttitude, responsible: rating },
                                                                    }))
                                                                }
                                                                disabled={isFormReadOnly}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="mb-2 block text-sm font-medium text-gray-700">Job Knowledge</label>
                                                            <StarRating
                                                                rating={evaluationData.workAttitude.jobKnowledge}
                                                                onRatingChange={(rating) =>
                                                                    setEvaluationData((prev) => ({
                                                                        ...prev,
                                                                        workAttitude: { ...prev.workAttitude, jobKnowledge: rating },
                                                                    }))
                                                                }
                                                                disabled={isFormReadOnly}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="mb-2 block text-sm font-medium text-gray-700">Cooperation</label>
                                                            <StarRating
                                                                rating={evaluationData.workAttitude.cooperation}
                                                                onRatingChange={(rating) =>
                                                                    setEvaluationData((prev) => ({
                                                                        ...prev,
                                                                        workAttitude: { ...prev.workAttitude, cooperation: rating },
                                                                    }))
                                                                }
                                                                disabled={isFormReadOnly}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="mb-2 block text-sm font-medium text-gray-700">Work Initiative</label>
                                                            <StarRating
                                                                rating={evaluationData.workAttitude.initiative}
                                                                onRatingChange={(rating) =>
                                                                    setEvaluationData((prev) => ({
                                                                        ...prev,
                                                                        workAttitude: { ...prev.workAttitude, initiative: rating },
                                                                    }))
                                                                }
                                                                disabled={isFormReadOnly}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="mb-2 block text-sm font-medium text-gray-700">Dependability</label>
                                                            <StarRating
                                                                rating={evaluationData.workAttitude.dependability}
                                                                onRatingChange={(rating) =>
                                                                    setEvaluationData((prev) => ({
                                                                        ...prev,
                                                                        workAttitude: { ...prev.workAttitude, dependability: rating },
                                                                    }))
                                                                }
                                                                disabled={isFormReadOnly}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-6">
                                                    <label className="text-sm font-medium text-gray-700">Overall Work Attitude Remarks</label>
                                                    <Textarea
                                                        placeholder="Enter overall remarks about work attitude and performance..."
                                                        value={evaluationData.workAttitude.remarks}
                                                        onChange={(e) =>
                                                            setEvaluationData((prev) => ({
                                                                ...prev,
                                                                workAttitude: { ...prev.workAttitude, remarks: e.target.value },
                                                            }))
                                                        }
                                                        className="resize-none"
                                                        readOnly={isFormReadOnly}
                                                        disabled={isFormReadOnly}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* 5. Work Functions - Department Specific */}
                                        {selectedDepartment && (
                                            <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                                <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                                                    <CardTitle className="flex items-center gap-2">
                                                        <FileText className="h-5 w-5" />
                                                        5. Work Functions - {selectedDepartment} Department
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-6">
                                                    <div className="space-y-6">
                                                        {departmentWorkFunctions[selectedDepartment as keyof typeof departmentWorkFunctions]?.map(
                                                            (workFunction, index) => (
                                                                <div key={index} className="rounded-lg border bg-gray-50 p-4">
                                                                    <h4 className="mb-4 font-medium text-gray-800">{workFunction}</h4>
                                                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                                        <div>
                                                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                                                Work Quality (1-10)
                                                                            </label>
                                                                            <StarRating
                                                                                rating={evaluationData.workFunctions[workFunction]?.workQuality || 0}
                                                                                onRatingChange={(rating) =>
                                                                                    setEvaluationData((prev) => ({
                                                                                        ...prev,
                                                                                        workFunctions: {
                                                                                            ...prev.workFunctions,
                                                                                            [workFunction]: {
                                                                                                ...prev.workFunctions[workFunction],
                                                                                                workQuality: rating,
                                                                                            },
                                                                                        },
                                                                                    }))
                                                                                }
                                                                                disabled={isFormReadOnly}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                                                Work Efficiency (1-10)
                                                                            </label>
                                                                            <StarRating
                                                                                rating={
                                                                                    evaluationData.workFunctions[workFunction]?.workEfficiency || 0
                                                                                }
                                                                                onRatingChange={(rating) =>
                                                                                    setEvaluationData((prev) => ({
                                                                                        ...prev,
                                                                                        workFunctions: {
                                                                                            ...prev.workFunctions,
                                                                                            [workFunction]: {
                                                                                                ...prev.workFunctions[workFunction],
                                                                                                workEfficiency: rating,
                                                                                            },
                                                                                        },
                                                                                    }))
                                                                                }
                                                                                disabled={isFormReadOnly}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Total Rating */}
                                        <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                            <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                                                <CardTitle className="flex items-center gap-2">
                                                    <Star className="h-5 w-5" />
                                                    Total Rating
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6 text-center">
                                                <div className="mb-2 text-6xl font-bold text-yellow-600">{totalRating}/10</div>
                                                <div className={`text-xl font-semibold ${getRatingInfo(totalRating).color}`}>
                                                    {getRatingInfo(totalRating).label}
                                                </div>
                                                <div className="mt-4 flex justify-center">
                                                    <StarRating rating={totalRating} onRatingChange={() => {}} size="lg" />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Observations/Comments */}
                                        <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                                                <CardTitle className="flex items-center gap-2">
                                                    <FileText className="h-5 w-5" />
                                                    Observations / Comments
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <Textarea
                                                    placeholder="Enter detailed observations and comments about the employee's performance..."
                                                    value={evaluationData.observations}
                                                    onChange={(e) =>
                                                        setEvaluationData((prev) => ({
                                                            ...prev,
                                                            observations: e.target.value,
                                                        }))
                                                    }
                                                    className="min-h-[120px] resize-none"
                                                    readOnly={isFormReadOnly}
                                                    disabled={isFormReadOnly}
                                                />
                                            </CardContent>
                                        </Card>

                                        {/* Evaluation Signatures */}
                                        <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                            <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                                                <CardTitle className="flex items-center gap-2">
                                                    <User className="h-5 w-5" />
                                                    Evaluation Signatures
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium text-gray-700">Evaluated by:</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter evaluator's name and position"
                                                            value={evaluationData.evaluator}
                                                            onChange={(e) =>
                                                                setEvaluationData((prev) => ({
                                                                    ...prev,
                                                                    evaluator: e.target.value,
                                                                }))
                                                            }
                                                            className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                                            readOnly={isFormReadOnly}
                                                            disabled={isFormReadOnly}
                                                        />
                                                    </div>
                                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                                        <div className="mb-2 text-sm font-medium text-green-700">Approved by:</div>
                                                        <div className="font-semibold text-green-800">Carmela B. Pedregosa</div>
                                                        <div className="text-sm text-green-700">Manager</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Rating Legend */}
                                        <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
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

                                        {/* Form Errors */}
                                        {Object.keys(errors).length > 0 && (
                                            <Card className="border-main dark:bg-backgrounds border-red-200 bg-background drop-shadow-lg">
                                                <CardContent className="p-4">
                                                    <div className="mb-2 font-medium text-red-600">Please fix the following errors:</div>
                                                    <ul className="list-inside list-disc space-y-1 text-sm text-red-600">
                                                        {Object.entries(errors).map(([field, error]) => (
                                                            <li key={field}>{error}</li>
                                                        ))}
                                                    </ul>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                            {!isFormReadOnly ? (
                                                <Button
                                                    onClick={handleSubmit}
                                                    className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                                                    disabled={processing || submitting}
                                                >
                                                    <FileText className={`${processing || submitting ? 'animate-spin' : ''} mr-2 h-5 w-5`} />
                                                    {processing || submitting ? 'Submitting...' : 'Submit Evaluation'}
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={handleReset}
                                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
                                                >
                                                    <RotateCcw className="mr-2 h-5 w-5" />
                                                    Clear & Start New Evaluation
                                                </Button>
                                            )}

                                            <Button
                                                variant="outline"
                                                className="border-0 bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:from-yellow-600 hover:to-orange-600 hover:shadow-xl"
                                            >
                                                <Download className="mr-2 h-5 w-5" />
                                                Export to PDF
                                            </Button>

                                            {!isFormReadOnly && (
                                                <Button
                                                    variant="outline"
                                                    onClick={handleReset}
                                                    className="border-2 border-gray-300 bg-white px-8 py-3 text-lg font-semibold text-gray-700 shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl"
                                                >
                                                    <RotateCcw className="mr-2 h-5 w-5" />
                                                    Reset Form
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Instructions when no department/employee selected */}
                                {!selectedDepartment && (
                                    <Card className="border-main dark:bg-backgrounds bg-background drop-shadow-lg">
                                        <CardContent className="p-12 text-center">
                                            <div className="mb-4 text-6xl">⭐</div>
                                            <h3 className="mb-2 text-2xl font-semibold text-gray-700">Get Started with Evaluation</h3>
                                            <p className="text-gray-600">Select a department and employee above to begin the evaluation process</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </Main>
                        </>
                    )}
                </SidebarInset>
            </SidebarHoverLogic>
        </SidebarProvider>
    );
}

function SidebarHoverLogic({ children }: { children: React.ReactNode }) {
    const { state } = useSidebar();
    const { handleMouseEnter, handleMouseLeave } = useSidebarHover();
    return (
        <>
            <SidebarHoverZone show={state === 'collapsed'} onMouseEnter={handleMouseEnter} />
            <AppSidebar onMouseLeave={handleMouseLeave} />
            {children}
        </>
    );
}
