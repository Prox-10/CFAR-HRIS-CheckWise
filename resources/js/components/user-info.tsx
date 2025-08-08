import { DefaultAvatar } from '@/components/default-avatar';
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false, showRole = false }: { user: User; showEmail?: boolean; showRole?: boolean }) {
    // Create full name from firstname and lastname
    const fullName = user.firstname && user.lastname ? `${user.firstname} ${user.lastname}`.trim() : user.firstname || user.lastname || '';

    // Get primary role (first role in the array)
    const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0] : null;

    return (
        <>
            <DefaultAvatar
                src={user.profile_image || '/Logo.png'}
                alt={fullName}
                fallbackText={fullName}
                size="sm"
                onError={(e) => {
                    e.currentTarget.src = '/Logo.png';
                }}
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullName}</span>
                {showRole && primaryRole && <span className="truncate text-xs text-muted-foreground">{primaryRole}</span>}
                {showEmail && <span className="truncate text-xs text-muted-foreground">{user.email}</span>}
            </div>
        </>
    );
}
