export interface Evaluation {
    id: number;
    employee_id: number;
    department: string;
    evaluation_frequency: string;
    evaluator: string;
    observations: string;
    total_rating: number;
    evaluation_year: number;
    evaluation_period: number;
    rating_date: string;

    // Employee info (joined from employees table)
    employee_name: string;
    picture: string;
    position: string;
    employeeid: string;

    // Related data (joined from related tables)
    attendance?: EvaluationAttendance;
    attitudes?: EvaluationAttitudes;
    workAttitude?: EvaluationWorkAttitude;
    workFunctions?: EvaluationWorkFunction[];

    // Legacy fields for backward compatibility (can be removed later)
    ratings?: string;
    work_quality?: string;
    safety_compliance?: string;
    punctuality?: string;
    teamwork?: string;
    organization?: string;
    equipment_handling?: string;
    comment?: string;
    period?: number;
    year?: number;
}

export interface EvaluationAttendance {
    id: number;
    evaluation_id: number;
    days_late: number;
    days_absent: number;
    rating: number;
    remarks: string;
}

export interface EvaluationAttitudes {
    id: number;
    evaluation_id: number;
    supervisor_rating: number;
    supervisor_remarks: string;
    coworker_rating: number;
    coworker_remarks: string;
}

export interface EvaluationWorkAttitude {
    id: number;
    evaluation_id: number;
    responsible: number;
    job_knowledge: number;
    cooperation: number;
    initiative: number;
    dependability: number;
    remarks: string;
}

export interface EvaluationWorkFunction {
    id: number;
    evaluation_id: number;
    function_name: string;
    work_quality: number;
    work_efficiency: number;
}

// Department-specific work functions mapping
export const departmentWorkFunctions = {
    Monthly: [
        'Encode workers daily time & accomplishment report',
        'Prepare the payroll of periodic paid employees, COOP leave, honorarium and hired workers',
        'Maintain files of timesheets and other source documents',
        'Update generation of documents for remittance/payment schedules',
        'Prepare and furnish the bookkeeper summary of beneficiary deductions made against their respective prooneds',
        'Prepare individual billing of beneficiaries based on the individual production report summary submitted by the AGRI & PROD. Facilitator',
        'Perform other duties as maybe assigned by his/her immediate superior and nor the managers'
    ],
    'Packing Plant': [
        'Package products according to quality standards',
        'Maintain packaging material inventory',
        'Ensure proper labeling and documentation',
        'Follow safety protocols during packaging',
        'Meet daily packaging targets and deadlines',
    ],
    Harvesting: [
        'Harvest crops at optimal maturity',
        'Sort and grade harvested produce',
        'Maintain harvest equipment and tools',
        'Follow sustainable harvesting practices',
        'Coordinate with logistics for timely delivery',
    ],
    'Pest & Decease': [
        'Monitor and control pest populations',
        'Apply appropriate pest management strategies',
        'Maintain pest control equipment',
        'Document pest control activities',
        'Coordinate with agricultural specialists',
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
    Admin: [
        'Manage administrative tasks and procedures',
        'Coordinate with different departments',
        'Maintain office records and documentation',
        'Handle customer inquiries and support',
        'Assist in policy implementation',
    ],
    Utility: [
        'Maintain utility systems and equipment',
        'Perform routine maintenance tasks',
        'Respond to utility-related emergencies',
        'Monitor utility consumption and efficiency',
        'Coordinate with maintenance teams',
    ],
} as const;

export type DepartmentType = keyof typeof departmentWorkFunctions;
