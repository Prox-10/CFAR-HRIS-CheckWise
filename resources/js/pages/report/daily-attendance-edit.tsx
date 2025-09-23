import { AppSidebar } from '@/components/app-sidebar';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// modal removed; edit renders inline
import { ComboboxDemo } from '@/components/combo-box';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { departments } from '@/hooks/data';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Calendar, ClipboardList } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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

export default function DailyAttendanceEditPage() {
    const [reportDate, setReportDate] = useState<Date | undefined>(new Date());
    const [area, setArea] = useState<string>('all');
    const titleDate = useMemo(() => (reportDate ? format(reportDate, 'MMMM dd, yyyy') : ''), [reportDate]);
    // no modal state

    // For editing entries, create arrays to bind inputs
    type DtrRow = { no: number; name: string; remarks: string; employeeId?: number | string };
    const makeRows = (count: number): DtrRow[] => Array.from({ length: count }).map((_, i) => ({ no: i + 1, name: '', remarks: '' }));
    const [micro1, setMicro1] = useState(makeRows(25));
    const [micro2, setMicro2] = useState(makeRows(25));
    const [micro3, setMicro3] = useState(makeRows(25));
    const [add1, setAdd1] = useState(makeRows(8));
    const [add2, setAdd2] = useState(makeRows(8));
    const [add3, setAdd3] = useState(makeRows(8));

    const renderEditableTable = (title: string, rows: DtrRow[], setRows: (rows: DtrRow[]) => void) => (
        <div className="border">
            <div className="border-b px-2 py-1 text-[10px] font-semibold">{title}</div>
            <div className="overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10 text-[10px]">No</TableHead>
                            <TableHead className="text-[10px]">Name</TableHead>
                            <TableHead className="w-24 text-[10px]">Remarks</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((r, idx) => (
                            <TableRow key={r.no}>
                                <TableCell className="text-[10px]">{String(r.no).padStart(2, '0')}</TableCell>
                                <TableCell className="text-[10px]">
                                    <ComboboxDemo
                                        options={getEmployeeOptionsForRow(r.employeeId)}
                                        value={r.employeeId ? String(r.employeeId) : ''}
                                        onChange={(val: string) => handleSelectEmployee(val, rows, setRows, idx)}
                                        placeholder="Select employee..."
                                        className="h-7"
                                    />
                                </TableCell>
                                <TableCell className="text-[10px]">
                                    <input
                                        className="w-full border px-1 py-0.5 text-[10px]"
                                        value={r.remarks}
                                        onChange={(e) => {
                                            const next = [...rows];
                                            next[idx] = { ...next[idx], remarks: e.target.value };
                                            setRows(next);
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );

    const handleSave = () => {
        // Wire to backend later, keep modal open/close as needed
        router.visit('/report/daily-attendance');
    };

    // ===== Employees data and helpers =====
    type Employee = {
        id: number;
        employeeid?: string;
        employee_name?: string;
        firstname?: string;
        middlename?: string | null;
        lastname?: string;
        department?: string;
    };

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoadingEmployees(true);
                const resp = await fetch('/api/employee/all');
                if (!resp.ok) throw new Error('Failed to load employees');
                const data = await resp.json();
                setEmployees(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
                setEmployees([]);
            } finally {
                setLoadingEmployees(false);
            }
        };
        load();
    }, []);

    const filteredEmployees = useMemo(() => {
        if (!area || area === 'all') return employees;
        return employees.filter((e) => (e.department || '').toLowerCase() === area.toLowerCase());
    }, [employees, area]);

    const selectedEmployeeIds = useMemo(() => {
        const ids = new Set<string>();
        [micro1, micro2, micro3, add1, add2, add3].forEach((group) => {
            group.forEach((r) => {
                if (r.employeeId !== undefined && r.employeeId !== null && r.employeeId !== '') {
                    ids.add(String(r.employeeId));
                }
            });
        });
        return ids;
    }, [micro1, micro2, micro3, add1, add2, add3]);

    const formatEmployeeDisplay = (e: Employee): string => {
        const firstnameRaw = (e.firstname || '').trim();
        const middlenameRaw = (e.middlename || '').trim();
        const lastnameRaw = (e.lastname || '').trim();

        let last = lastnameRaw;
        let firstInitials = '';
        let middleInitial = '';

        if (!firstnameRaw && e.employee_name) {
            const parts = e.employee_name.trim().split(/\s+/);
            if (parts.length > 0) {
                last = parts[parts.length - 1];
                const firstParts = parts.slice(0, parts.length - 1);
                firstInitials = firstParts.map((p) => p.charAt(0)).join('');
            }
        } else {
            firstInitials = firstnameRaw
                .split(/\s+/)
                .filter(Boolean)
                .map((p) => p.charAt(0))
                .join('');
        }

        if (middlenameRaw) {
            middleInitial = middlenameRaw.charAt(0) + '.';
        } else if (!middlenameRaw && e.employee_name) {
            // try infer middle initial if employee_name has 3+ parts
            const parts = e.employee_name.trim().split(/\s+/);
            if (parts.length >= 3) middleInitial = parts[parts.length - 2].charAt(0) + '.';
        }

        const lastCap = last;
        return `${lastCap} ${firstInitials}${middleInitial ? ' ' + middleInitial : ''}`.trim();
    };

    const getEmployeeOptionsForRow = (currentRowEmployeeId?: number | string) => {
        const options = filteredEmployees
            .filter((e) => {
                const id = String(e.id);
                // allow currently selected value to remain in the list
                if (currentRowEmployeeId && String(currentRowEmployeeId) === id) return true;
                return !selectedEmployeeIds.has(id);
            })
            .map((e) => {
                const label = formatEmployeeDisplay(e);
                const search = `${e.employeeid ?? ''} ${e.employee_name ?? ''} ${e.firstname ?? ''} ${e.middlename ?? ''} ${e.lastname ?? ''} ${label}`;
                return { value: String(e.id), label, search };
            });
        return options;
    };

    const handleSelectEmployee = (value: string, rows: DtrRow[], setRows: (rows: DtrRow[]) => void, idx: number) => {
        const emp = filteredEmployees.find((e) => String(e.id) === value);
        if (!emp) return;
        const next = [...rows];
        next[idx] = { ...next[idx], employeeId: emp.id, name: formatEmployeeDisplay(emp) };
        setRows(next);
    };

    return (
        <SidebarProvider>
            <Head title="Edit Daily Attendance Report" />
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader
                        breadcrumbs={[
                            { title: 'Report', href: '/report' },
                            { title: 'Daily Attendance', href: '/report/daily-attendance' },
                            { title: 'Edit', href: '/report/daily-attendance/edit' },
                        ]}
                        title={''}
                    />
                    <Card className="border-main m-5 space-y-4">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center">
                                <ClipboardList className="text-cfarbempco-green mr-2 h-5 w-5" />
                                Edit Daily Attendance Report (DTR)
                            </CardTitle>
                            <CardDescription>Update entries for the selected date and department.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                                    <div className="md:col-span-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !reportDate && 'text-muted-foreground',
                                                    )}
                                                >
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    {reportDate ? titleDate : <span>Select date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <CalendarComponent mode="single" selected={reportDate} onSelect={setReportDate} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div>
                                        <Select value={area} onValueChange={setArea}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Departments</SelectItem>
                                                {departments.map((dep) => (
                                                    <SelectItem key={dep} value={dep}>
                                                        {dep}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                                    {renderEditableTable('MICROTEAM - 01', micro1, setMicro1)}
                                    {renderEditableTable('MICROTEAM - 02', micro2, setMicro2)}
                                    {renderEditableTable('MICROTEAM - 03', micro3, setMicro3)}
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                                    {renderEditableTable('ADD CREW - 01', add1, setAdd1)}
                                    {renderEditableTable('ADD CREW - 02', add2, setAdd2)}
                                    {renderEditableTable('ADD CREW - 03', add3, setAdd3)}
                                </div>

                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="outline" onClick={() => router.visit('/report/daily-attendance')}>
                                        Back
                                    </Button>
                                    <Button variant="main" onClick={handleSave}>
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </SidebarInset>
            </SidebarHoverLogic>
        </SidebarProvider>
    );
}
