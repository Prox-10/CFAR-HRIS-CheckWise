import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCountUp } from '@/hooks/use-count-up';

interface Props {
    totalEmployee: number;
    totalDepartment: number;
    totalLeave: number;
    pendingLeave: number;
}

export function SectionCards({ totalEmployee, totalDepartment, totalLeave, pendingLeave }: Props) {
    const employeeCount = useCountUp(totalEmployee, 1000);
    const departmentCount = useCountUp(totalDepartment, 1000);
    const leaveCount = useCountUp(totalLeave, 1000);
    const pendingCount = useCountUp(pendingLeave, 1000);

    return (
        <div className="grid grid-cols-1 gap-3 px-4 *:data-[slot=card]:shadow-xs lg:px-3 @xl/main:grid-cols-4 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        {/* <div className="grid grid-cols-1 gap-3 px-4 *:data-[slot=card]:bg-gradient-to-tl *:data-[slot=card]:from-cfar-600 *:data-[slot=card]:to-cfar-200 *:data-[slot=card]:shadow-xs lg:px-3 @xl/main:grid-cols-4 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card"> */}
            <Card className="@container/card border-l-7 border-cfar-400">
                <CardHeader className="relative">
                    <CardDescription className="dark:text-darkMain font-semibold">Total Employees</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{employeeCount.toLocaleString()}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">Total unique employees</div>
                </CardFooter>
            </Card>

            <Card className="border-l-7 border-cfar-400 @container/card">
                <CardHeader className="relative">
                    <CardDescription className="dark:text-darkMain font-semibold">Departments</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{departmentCount.toLocaleString()}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">Total unique departments</div>
                </CardFooter>
            </Card>

            <Card className="border-l-7 border-cfar-400 @container/card">
                <CardHeader className="relative">
                    <CardDescription className="dark:text-darkMain font-semibold">Leave Requests</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{leaveCount.toLocaleString()}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">All leave requests</div>
                </CardFooter>
            </Card>

            <Card className="border-l-7 border-cfar-400 @container/card">
                <CardHeader className="relative">
                    <CardDescription className="dark:text-darkMain font-semibold">Pending Leaves</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{pendingCount.toLocaleString()}</CardTitle>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">Awaiting approval</div>
                </CardFooter>
            </Card>
        </div>
    );
}
