// hooks/useCompanyData.ts

export const departments: string[] = ['Monthly', 'Packing Plant', 'Harvesting', 'Pest & Decease', 'Coop Area', 'Engineering', 'Utility'];

// Department-specific positions
export const monthlyPositions: string[] = ['Monthly Supervisor', 'Monthly Coordinator', 'Monthly Assistant', 'Monthly Clerk'];

export const packingPlantPositions: string[] = [
    'Packing Supervisor',
    'Packing Coordinator',
    'Packing Operator',
    'Quality Control Inspector',
    'Packing Assistant',
];

export const harvestingPositions: string[] = [
    'Harvesting Supervisor',
    'Field Supervisor',
    'Field Worker',
    'Harvesting Coordinator',
    'Field Assistant',
];

export const pestDeceasePositions: string[] = ['P&D Supervisor', 'P&D Specialist', 'P&D Technician', 'P&D Coordinator', 'P&D Assistant'];

export const coopAreaPositions: string[] = [
    'Coop Area Manager',
    'Coop Area Supervisor',
    'Coop Area Coordinator',
    'Coop Area Assistant',
    'Coop Area Clerk',
];

export const engineeringPositions: string[] = ['Chief Engineer', 'Senior Engineer', 'Engineer', 'Engineering Technician', 'Engineering Assistant'];

export const utilityPositions: string[] = [
    'Utility Supervisor',
    'Utility Technician',
    'Utility Operator',
    'Utility Assistant',
    'Maintenance Technician',
];

// Legacy positions array for backward compatibility (can be removed if not needed elsewhere)
export const positions: string[] = [
    'Admin Assistant',
    'Accountant',
    'HR Officer',
    'Quality Inspector',
    'Production Supervisor',
    'Field Worker',
    'Field Supervisor',
    'Logistics Coordinator',
    'R&D Specialist',
    'Sales Executive',
    'Maintenance Technician',
    'P&D',
];

export const workStatus = ['Regular', 'Add Crew', 'Probationary', 'Sessional'];

export const maritalStatus = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated', 'Other'];

export const gender = ['Male', 'Female'];

// Helper function to get positions for a specific department
export const getPositionsForDepartment = (department: string): string[] => {
    switch (department) {
        case 'Monthly':
            return monthlyPositions;
        case 'Packing Plant':
            return packingPlantPositions;
        case 'Harvesting':
            return harvestingPositions;
        case 'Pest & Decease':
            return pestDeceasePositions;
        case 'Coop Area':
            return coopAreaPositions;
        case 'Engineering':
            return engineeringPositions;
        case 'Utility':
            return utilityPositions;
        default:
            return [];
    }
};
