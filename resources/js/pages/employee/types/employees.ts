// Filename: employee.ts
export interface Employees {
    id: string;
    employeeid: string;
    employee_name: string;
    firstname: string;
    middlename: string;
    lastname: string;
    picture: string;
    gender: string;
    department: string;
    position: string;
    phone: string;
    work_status: string;
    date_of_birth: string;
    status: string;
    service_tenure: string;
    email: string;
    fingerprints?: any[]; // Add this line to support fingerprint info from backend
}
