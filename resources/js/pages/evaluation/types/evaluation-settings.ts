// Evaluation Settings Configuration
// This file contains department-specific settings for evaluations

export interface DepartmentEvaluationSettings {
    title: string;
    subtitle: string;
    description: string;
    sectionNumber?: number;
    showWorkFunctions?: boolean;
    showAttitudeTowardsCoworker?: boolean;
    criteria?: {
        attendance?: string;
        attitudeTowardsSupervisor?: string;
        attitudeTowardsCoworker?: string;
        workAttitude?: string;
        workOperations?: string;
        workFunctions?: string;
    };
    workFunctions:
        | string[]
        | {
              sections: {
                  title: string;
                  items: string[];
              }[];
          };
    category: 'operations' | 'functions' | 'maintenance' | 'specialized';
}

export const evaluationSettings: Record<string, DepartmentEvaluationSettings> = {
    'Management & Staff(Admin)': {
        title: 'Work Functions',
        subtitle: 'Management&Staff(Admin)',
        description: 'Evaluate employee performance in Management & Staff(Admin) department operations',
        criteria: {
            attendance: '1. Attendance',
            attitudeTowardsSupervisor: '2. Attitude Towards Supervisor',
            attitudeTowardsCoworker: '3. Attitude Towards Co-Worker',
            workAttitude: '4. Work Attitude/Performance',
            workOperations: '4. Work Operations',
            workFunctions: '5. Work Functions',
        },
        workFunctions: {
            sections: [
                {
                    title: '',
                    items: [
                        'Encode workers daily time & accomplishment report (WDTAR)',
                        'Prepare the payroll of periodic paid employees, COOP leave, honorarium and hired workers',
                        'Maintain files of timesheets and other source documents',
                        'Update generation of the following documents in order to catch up with the remittance/payments schedules',
                        "Prepare and furnish the bookeeper summary of beneficiary's deduction made againts their respective proceeds",
                        'Prepare individual billing of beneficiaries based on the individual production report summary submitted by the AGRI & PROD.Facilitator',
                        'Perform other duties as may be assigned by his/her immediate superior and nor the manager',
                    ],
                },
                // {
                //     title: 'Document Management',
                //     items: [
                //         'Update generation of documents for remittance/payment schedules',
                //         'Prepare and furnish the bookkeeper summary of beneficiary deductions made against their respective prooneds',
                //     ],
                // },
                // {
                //     title: 'Reporting & Billing',
                //     items: [
                //         'Prepare individual billing of beneficiaries based on the individual production report summary submitted by the AGRI & PROD. Facilitator',
                //     ],
                // },
                // {
                //     title: 'Additional Duties',
                //     items: ['Perform other duties as maybe assigned by his/her immediate superior and nor the manager'],
                // },
            ],
        },
        category: 'functions',
    },
    'Packing Plant': {
        title: 'Work Operations',
        subtitle: 'Packing Plant Department',
        description: 'Evaluate employee performance in packaging and production operations',
        criteria: {
            attendance: '1. Attendance',
            attitudeTowardsSupervisor: '2. Attitude Towards Supervisor',
            attitudeTowardsCoworker: '3. Attitude Towards Co-worker',
            workAttitude: '4. Work Attitude/Performance',
            workOperations: '5. Work Operations',
        },
        workFunctions: {
            sections: [
                {
                    title: '',
                    items: ['Patio', 'Dehander', 'Selector'],
                },
                {
                    title: 'WTS',
                    items: ['Rejector/Utility'],
                },
                {
                    title: '',
                    items: ['Weigher'],
                },
                {
                    title: 'Labeller',
                    items: ['Inspector'],
                },
                {
                    title: "CP'S",
                    items: ['Crew'],
                },
                {
                    title: '',
                    items: ['Packer'],
                },
                {
                    title: 'Topper',
                    items: ['Box Former'],
                },
                {
                    title: 'Final Weigher',
                    items: ['Boxes Counter'],
                },
                {
                    title: 'Box Former',
                    items: ['Palletizer'],
                },
            ],
        },
        category: 'operations',
    },
    Harvesting: {
        title: 'Work Operations',
        subtitle: 'Harvesting Department',
        description: 'Evaluate employee performance in harvesting and field operations',
        criteria: {
            attendance: '1. Attendance',
            attitudeTowardsSupervisor: '2. Attitude Towards Supervisor',
            attitudeTowardsCoworker: '3. Attitude Towards Co-worker',
            workAttitude: '4. Work Attitude/Performance',
            workOperations: '5. Work Operations',
        },
        workFunctions: [
            'Follow S.O.P. in calibrating the fruit',
            'Proper cutting of bunch',
            'Proper placement of harvested stumps',
            'Use of latex in actual receiving',
            'Observe ideal NO. of stems of Guyod/Trip',
            'Timely delivery of roller',
        ],
        category: 'operations',
    },
    'Pest & Decease': {
        title: 'Work Operations',
        subtitle: 'Pest & Disease Department',
        description: 'Evaluate employee performance in pest control and disease management',
        criteria: {
            attendance: '1. Attendance',
            attitudeTowardsSupervisor: '2. Attitude Towards Supervisor',
            attitudeTowardsCoworker: '3. Attitude Towards Co-worker',
            workAttitude: '4. Work Attitude/Performance',
            workOperations: '5. Work Operations',
        },
        workFunctions: {
            sections: [
                {
                    title: 'Monitoring',
                    items: ['Area Survey', 'Aerial Spray', 'F.O.C. Area', 'Moko Area'],
                },
                {
                    title: 'Eradication',
                    items: ['Fence/Repair', 'Footbath', 'Weed Slashing', 'Sticking', 'Digging Socker'],
                },
                {
                    title: 'Maintenance',
                    items: [],
                },
            ],
        },
        category: 'operations',
    },
    'Coop Area': {
        title: 'Work Operations',
        subtitle: 'Cooperative Area Department',
        description: 'Evaluate employee performance in cooperative management and operations',
        sectionNumber: 4,
        showWorkFunctions: false,
        showAttitudeTowardsCoworker: false,
        criteria: {
            attendance: '1. Attendance',
            attitudeTowardsSupervisor: '2. Attitude Towards ARB',
            workAttitude: '3. Work Attitude/Performance',
            workOperations: '4. Work Operations',
        },
        workFunctions: {
            sections: [
                {
                    title: 'Plant Care:',
                    items: ['Weed Control', 'Cleaning/Cutting Stumps', 'Pruning', 'Replanting', 'Fertilization Application', 'Propping'],
                },
                {
                    title: 'Fruit Care:',
                    items: ['Bud Bugging', 'Caloco/DE & DE', 'Bunch Spray', 'Bagging', 'Hand Bagging/Soksok', 'Deleafing', 'Sigatoka Trimming'],
                },
                {
                    title: 'Pest & Disease Control/Actual:',
                    items: ['Moko Eradication', 'Fusarium Eradication', 'Scale Insect/Mealy Bug', 'Bunchy Top Eradication'],
                },
                {
                    title: 'OHCP/Actual:',
                    items: [''],
                },
            ],
        },
        category: 'operations',
    },
    Engineering: {
        title: 'Work Operations',
        subtitle: 'Engineering Department',
        description: 'Evaluate employee performance in engineering and maintenance operations',
        criteria: {
            attendance: '1. Attendance',
            attitudeTowardsSupervisor: '2. Attitude Towards Supervisor',
            attitudeTowardsCoworker: '3. Attitude Towards Co-worker',
            workAttitude: '4. Work Attitude/Performance',
            workOperations: '5. Work Operations',
        },
        workFunctions: {
            sections: [
                {
                    title: '',
                    items: ['Welding', 'Electrical Wiring'],
                },
                {
                    title: 'Maintenance',
                    items: ['Glueing', 'Conveyor', 'Spray Can', 'Vacuum', 'Roller', 'Cable Way', 'Bridge'],
                },
                {
                    title: 'Obtructions',
                    items: ['Trimming'],
                },
                {
                    title: 'Spare',
                    items: ['Driving'],
                },
            ],
        },
        category: 'maintenance',
    },
    Utility: {
        title: 'Work Operations',
        subtitle: 'Utility Department',
        description: 'Evaluate employee performance in utility maintenance and operations',
        criteria: {
            attendance: '1. Attendance',
            attitudeTowardsSupervisor: '2. Attitude Towards ARP',
            attitudeTowardsCoworker: '2. Attitude Towards ARP',
            workAttitude: '3. Work Attitude/Performance',
            workOperations: '4. Work Operations',
            workFunctions: '5. Work Functions',
        },
        workFunctions: {
            sections: [
                {
                    title: 'Sanitation For:',
                    items: ['Office Areas', 'Garden', 'Kitchen Area', 'Toilet', 'Garbage Disposal'],
                },
                {
                    title: 'Office Beautification',
                    items: [],
                },
                {
                    title: 'Safekeeping:',
                    items: ['Office Equipment', 'Supplies', 'Kitchen Utensils'],
                },
                {
                    title: '',
                    items: ['Other Duties Priscribed By Immediate Superior'],
                },
            ],
        },
        category: 'maintenance',
    },
};

// Helper function to get department settings
export const getDepartmentSettings = (department: string): DepartmentEvaluationSettings | null => {
    return evaluationSettings[department] || null;
};

// Helper function to get all available departments
export const getAvailableDepartments = (): string[] => {
    return Object.keys(evaluationSettings);
};

// Helper function to check if workFunctions is structured
export const isStructuredWorkFunctions = (workFunctions: any): workFunctions is { sections: { title: string; items: string[] }[] } => {
    return workFunctions && typeof workFunctions === 'object' && 'sections' in workFunctions;
};

// Helper function to get all work functions as a flat array (for backward compatibility)
export const getAllWorkFunctions = (department: string): string[] => {
    const settings = evaluationSettings[department];
    if (!settings) return [];

    if (isStructuredWorkFunctions(settings.workFunctions)) {
        return settings.workFunctions.sections.flatMap((section) => section.items);
    }

    return settings.workFunctions as string[];
};

// Helper function to get structured work functions
export const getStructuredWorkFunctions = (department: string) => {
    const settings = evaluationSettings[department];
    if (!settings) return null;

    if (isStructuredWorkFunctions(settings.workFunctions)) {
        return settings.workFunctions;
    }

    return null;
};

// Helper function to get custom criteria labels
export const getCriteriaLabel = (department: string, criteriaType: keyof NonNullable<DepartmentEvaluationSettings['criteria']>): string => {
    const settings = evaluationSettings[department];
    if (!settings?.criteria?.[criteriaType]) {
        // Return empty string if no custom label is defined
        return '';
    }
    return settings.criteria[criteriaType]!;
};

// Helper function to get departments by category
export const getDepartmentsByCategory = (category: DepartmentEvaluationSettings['category']): string[] => {
    return Object.entries(evaluationSettings)
        .filter(([_, settings]) => settings.category === category)
        .map(([department, _]) => department);
};

// Helper function to get evaluator information (now returns default values only)
// Note: Actual evaluator information is now fetched from database supervisor assignments
export const getEvaluatorInfo = (department: string) => {
    return {
        supervisor: 'Supervisor',
        hrPersonnel: 'HR Personnel',
        manager: 'Manager',
    };
};

// Default settings for unknown departments
export const getDefaultDepartmentSettings = (department: string): DepartmentEvaluationSettings => {
    return {
        title: 'Work Functions',
        subtitle: `${department} Department`,
        description: `Evaluate employee performance in ${department} department operations`,
        workFunctions: [
            'Perform assigned duties and responsibilities',
            'Maintain quality standards in work output',
            'Follow department procedures and protocols',
            'Collaborate with team members effectively',
            'Contribute to department goals and objectives',
        ],
        category: 'functions',
    };
};
