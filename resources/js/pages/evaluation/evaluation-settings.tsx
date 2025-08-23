import { AppSidebar } from '@/components/app-sidebar';
import { Main } from '@/components/customize/main';
import SidebarHoverZone from '@/components/sidebar-hover-zone';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useSidebarHover } from '@/hooks/use-sidebar-hover';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Settings } from 'lucide-react';
import { EvaluationSettingsManager } from './components/evaluation-settings-manager';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Evaluation Management',
        href: '/evaluation',
    },
    {
        title: 'Evaluation Settings',
        href: '/evaluation/evaluation-settings',
    },
];

interface Props {
    user_permissions?: {
        is_super_admin: boolean;
        is_supervisor: boolean;
        can_evaluate: boolean;
    };
}

export default function EvaluationSettings({ user_permissions }: Props) {
    const isAdmin = user_permissions?.is_super_admin || false;

    return (
        <SidebarProvider>
            <Head title="Evaluation Settings" />

            {/* Sidebar hover logic */}
            <SidebarHoverLogic>
                <SidebarInset>
                    <SiteHeader breadcrumbs={breadcrumbs} title={''} />
                    <Main fixed>
                        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
                            <div>
                                <div className="ms-2 flex items-center">
                                    <Settings className="size-11" />
                                    <div className="ms-2">
                                        <h2 className="flex text-2xl font-bold tracking-tight">Evaluation Settings</h2>
                                        <p className="text-muted-foreground">
                                            Manage department-specific evaluation criteria, titles, and work functions
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Evaluation Settings Manager */}
                        <div className="m-3 no-scrollbar">
                            <EvaluationSettingsManager isAdmin={isAdmin} />
                        </div>
                    </Main>
                </SidebarInset>
            </SidebarHoverLogic>
        </SidebarProvider>
    );
}

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
