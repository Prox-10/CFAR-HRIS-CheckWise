import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { cn } from '@/lib/utils';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

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
        <AuthLayout title="Welcome" description="Login to your account">
            <Head title="Log in" />
           
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="mt-8 grid gap-2">
                        <Label htmlFor="email" className="font-semibold text-background">
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            // required
                            className="placeholder:text-white-500 text-background focus:ring-0 focus:ring-offset-0"
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="mt-5 flex items-center">
                            <Label htmlFor="password" className="font-semibold text-background">
                                Password
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
                            className="placeholder:text-white-500 text-background focus:ring-0 focus:ring-offset-0"
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div> */}

                    <Button
                        type="submit"
                        className="mt-10 w-full bg-background font-bold text-black transition-all duration-200 ease-in-out hover:bg-background-600 hover:text-black"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Login
                    </Button>
                </div>

                {/* <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <TextLink href={route('register')} tabIndex={5}>
                        Sign up
                    </TextLink>
                </div> */}
            </form>
            <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => window.history.back()}
            >
                Cancel
            </Button>
           
            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
