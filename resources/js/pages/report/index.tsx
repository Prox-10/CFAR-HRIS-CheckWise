import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarInset, SidebarProvider, SidebarSeparator } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Calendar, CalendarDays, ChartBar, ClipboardList, Clock, Download, FileText, Filter, Users } from 'lucide-react';
import { Toaster } from 'sonner';
// import { format } from 'path';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/employee-site-header';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ContentLoading } from '@/components/ui/loading';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Report',
        href: '/report',
    },
];

const ReportCard = ({
    title,
    description,
    icon: Icon,
    buttonText = 'Generate Report',
    variant = 'default',
}: {
    title: string;
    description: string;
    icon: React.ElementType;
    buttonText?: string;
    variant?: 'default' | 'attendance' | 'employee' | 'leave' | 'evaluation' | 'payroll';
}) => {
    return (
        <Card>
            <CardHeader
                className={cn(
                    'pb-2',
                    variant === 'attendance' && 'border-cfarbempco-green border-l-4',
                    variant === 'employee' && 'border-l-4 border-blue-500',
                    variant === 'leave' && 'border-l-4 border-yellow-500',
                    variant === 'evaluation' && 'border-l-4 border-purple-500',
                    variant === 'payroll' && 'border-l-4 border-orange-500',
                )}
            >
                <CardTitle className="flex items-center text-base">
                    <Icon
                        className={cn(
                            'mr-2 h-5 w-5',
                            variant === 'default' && 'text-cfarbempco-green',
                            variant === 'attendance' && 'text-cfarbempco-green',
                            variant === 'employee' && 'text-blue-500',
                            variant === 'leave' && 'text-yellow-500',
                            variant === 'evaluation' && 'text-purple-500',
                            variant === 'payroll' && 'text-orange-500',
                        )}
                    />
                    {title}
                </CardTitle>
                <CardDescription className="text-xs">{description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                <Button variant="outline" className="flex w-full items-center justify-center">
                    <Download className="mr-2 h-4 w-4" />
                    {buttonText}
                </Button>
            </CardContent>
        </Card>
    );
};

const ReportPage = () => {
    // const [date, setDate] = useState<Date | undefined>(new Date());
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, []);

    return (
        <SidebarProvider>
            <Head title="Leave" />
            <Toaster position="top-right" richColors />
            {loading ? (
                <ContentLoading />
            ) : (
                <>
                    <AppSidebar />
                    <SidebarInset>
                        {/* <HeaderShrink/> */}
                        <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                        <Card className="m-5 space-y-4 border-main">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center">
                                    <ClipboardList className="text-cfarbempco-green mr-2 h-5 w-5" />
                                    Report Generation
                                </CardTitle>
                                <CardDescription>Select the report type and filters before generating</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4 rounded-lg bg-green-50 p-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium">Report Period</h3>
                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                'w-35 justify-start text-left font-normal',
                                                                !startDate && 'text-muted-foreground',
                                                            )}
                                                        >
                                                            <Calendar className="mr-2 h-4 w-4" />
                                                            {startDate ? format(startDate, 'MMM dd, yyyy') : <span>Start date</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={startDate}
                                                            onSelect={setStartDate}
                                                            initialFocus
                                                            className="pointer-events-auto"
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                'w-35 justify-start text-left font-normal',
                                                                !endDate && 'text-muted-foreground',
                                                            )}
                                                        >
                                                            <Calendar className="mr-2 h-4 w-4" />
                                                            {endDate ? format(endDate, 'MMM dd, yyyy') : <span>End date</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="end">
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={endDate}
                                                            onSelect={setEndDate}
                                                            initialFocus
                                                            className="pointer-events-auto"
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                        <div className="ml-auto md:w-40">
                                            <h3 className="text-sm font-medium">Export Format</h3>
                                            <Select defaultValue="pdf">
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pdf">PDF Document</SelectItem>
                                                    <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                                                    <SelectItem value="csv">CSV File</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <SidebarSeparator />
                                    <Tabs defaultValue="attendance " className="space-y-4 p-5">
                                        <TabsList className="mb-4 grid grid-cols-2 bg-main py-[5px] md:grid-cols-4">
                                            <TabsTrigger className="mx-3 mb-5 hover:bg-main-600" value="attendance">
                                                Attendance
                                            </TabsTrigger>
                                            <TabsTrigger className="mx-3 mb-5 hover:bg-main-600" value="employee">
                                                Employee
                                            </TabsTrigger>
                                            <TabsTrigger className="mx-3 mb-5 hover:bg-main-600" value="leave">
                                                Leave
                                            </TabsTrigger>
                                            <TabsTrigger className="mx-3 mb-5 hover:bg-main-600" value="evaluation">
                                                Evaluation
                                            </TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="attendance" className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                <ReportCard
                                                    title="Daily Attendance Summary"
                                                    description="Summary of daily attendance across all departments"
                                                    icon={Clock}
                                                    variant="attendance"
                                                    buttonText="Generate Daily Report"
                                                />
                                                <ReportCard
                                                    title="Monthly Attendance Report"
                                                    description="Complete monthly attendance records by employee"
                                                    icon={Calendar}
                                                    variant="attendance"
                                                    buttonText="Generate Monthly Report"
                                                />
                                                <ReportCard
                                                    title="Attendance By Area"
                                                    description="Breakdown of attendance by packing, field, and office areas"
                                                    icon={Users}
                                                    variant="attendance"
                                                    buttonText="Generate Area Report"
                                                />
                                                <ReportCard
                                                    title="Custom Attendance Filter"
                                                    description="Create custom attendance report with specific filters"
                                                    icon={Filter}
                                                    variant="attendance"
                                                    buttonText="Generate Custom Report"
                                                />
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="employee" className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                <ReportCard
                                                    title="Employee Information"
                                                    description="Complete employee information with contact information"
                                                    icon={Users}
                                                    variant="employee"
                                                    buttonText="Generate Employee Info"
                                                />
                                                <ReportCard
                                                    title="Employee Tenure"
                                                    description="Report on employee service length and anniversaries"
                                                    icon={Calendar}
                                                    variant="employee"
                                                    buttonText="Generate Tenure Report"
                                                />
                                                <ReportCard
                                                    title="Department Headcount"
                                                    description="Headcount breakdown by department and position"
                                                    icon={Users}
                                                    variant="employee"
                                                    buttonText="Generate Headcount Report"
                                                />
                                                <ReportCard
                                                    title="New Hires Report"
                                                    description="List of new employees within selected period"
                                                    icon={Users}
                                                    variant="employee"
                                                    buttonText="Generate New Hires Report"
                                                />
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="leave" className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                <ReportCard
                                                    title="Leave Balance Report"
                                                    description="Current leave balances for all employees"
                                                    icon={CalendarDays}
                                                    variant="leave"
                                                    buttonText="Generate Leave Balance"
                                                />
                                                <ReportCard
                                                    title="Leave Usage Summary"
                                                    description="Summary of leave usage by type and department"
                                                    icon={CalendarDays}
                                                    variant="leave"
                                                    buttonText="Generate Usage Summary"
                                                />
                                                <ReportCard
                                                    title="Pending Leave Requests"
                                                    description="List of all pending leave requests awaiting approval"
                                                    icon={CalendarDays}
                                                    variant="leave"
                                                    buttonText="Generate Pending List"
                                                />
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="evaluation" className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                <ReportCard
                                                    title="Performance Summary"
                                                    description="Summary of employee performance ratings"
                                                    icon={FileText}
                                                    variant="evaluation"
                                                    buttonText="Generate Performance Report"
                                                />
                                                <ReportCard
                                                    title="Department Performance"
                                                    description="Performance analysis by department"
                                                    icon={FileText}
                                                    variant="evaluation"
                                                    buttonText="Generate Department Report"
                                                />
                                                <ReportCard
                                                    title="Evaluation Completion"
                                                    description="Status report on completed vs. pending evaluations"
                                                    icon={FileText}
                                                    variant="evaluation"
                                                    buttonText="Generate Status Report"
                                                />
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="payroll" className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                <ReportCard
                                                    title="Payroll Summary"
                                                    description="Complete payroll summary for selected period"
                                                    icon={ChartBar}
                                                    variant="payroll"
                                                    buttonText="Generate Payroll Summary"
                                                />
                                                <ReportCard
                                                    title="Deductions Report"
                                                    description="Breakdown of all deductions by category"
                                                    icon={ChartBar}
                                                    variant="payroll"
                                                    buttonText="Generate Deductions Report"
                                                />
                                                <ReportCard
                                                    title="Overtime Analysis"
                                                    description="Analysis of overtime hours and payments"
                                                    icon={ChartBar}
                                                    variant="payroll"
                                                    buttonText="Generate Overtime Report"
                                                />
                                                <ReportCard
                                                    title="Payroll Comparison"
                                                    description="Compare payroll data across periods"
                                                    icon={ChartBar}
                                                    variant="payroll"
                                                    buttonText="Generate Comparison"
                                                />
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </CardContent>
                        </Card>
                    </SidebarInset>
                </>
            )}
        </SidebarProvider>
    );
};

export default ReportPage;
