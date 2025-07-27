import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { cn } from '@/lib/utils';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EmployeeAuthLayout from '@/layouts/employee-auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <EmployeeAuthLayout title="Employee Login" description="Sign in to access your CheckWise HRIS account">
            <Head title="Log in" />
           
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="font-semibold text-white">
                            Employee ID
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            // required
                            className="placeholder:text-white-500 text-muted-foreground  focus:ring-0 focus:ring-offset-0"
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Employee ID"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password" className="font-semibold text-white">
                                PIN
                            </Label>
                            {/* {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                    Forgot password?
                                </TextLink>
                            )} */}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            // required
                            className="placeholder:text-white-500 text-muted-foreground focus:ring-0 focus:ring-offset-0"
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="PIN"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-cfar-400 font-bold text-white transition-all duration-200 ease-in-out hover:bg-cfar-450 hover:text-white"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Login
                    </Button>
                </div>

            </form>
            <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => window.history.back()}
            >
                Cancel
            </Button>
           
            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </EmployeeAuthLayout>
    );
}
