import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Employee {
    id: number;
    employeeid: string;
    employee_name: string;
    firstname: string;
    lastname: string;
    department: string;
    position: string;
    picture?: string;
}

interface WelcomeBannerProps {
    employee: Employee;
}

export function WelcomeBanner({ employee }: WelcomeBannerProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const currentTime = new Date();
    const hour = currentTime.getHours();
    let greeting = 'Good morning';

    if (hour >= 12 && hour < 17) {
        greeting = 'Good afternoon';
    } else if (hour >= 17) {
        greeting = 'Good evening';
    }

    return (
        <Card className="bg-gradient-to-r from-cfar-400 to-cfar-500 text-white">
            <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16 border-2 border-white/20">
                        <AvatarImage
                            src={employee.picture || '/Logo.png'}
                            alt={employee.employee_name}
                            onError={(e) => {
                                e.currentTarget.src = '/Logo.png';
                            }}
                        />
                    </Avatar>

                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">
                            {greeting}, {employee.firstname}!
                        </h1>
                        <p className="text-sm text-white/80">Welcome back to your dashboard</p>
                        <div className="mt-2 flex items-center space-x-3">
                            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                                {employee.position}
                            </Badge>
                            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                                {employee.department}
                            </Badge>
                            <span className="text-sm text-white/60">ID: {employee.employeeid}</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-white/80">Today</p>
                        <p className="text-lg font-semibold">
                            {currentTime.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
