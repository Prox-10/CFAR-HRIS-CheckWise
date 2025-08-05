import { DefaultAvatar } from '@/components/default-avatar';
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    // Create full name from firstname and lastname
    const fullName = user.firstname && user.lastname
        ? `${user.firstname} ${user.lastname}`.trim()
        : user.firstname || user.lastname || '';

    return (
        <>
            <DefaultAvatar
                src={user.avatar}
                alt={fullName}
                fallbackText={fullName}
                size="sm"
            />
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullName}</span>
                {showEmail && <span className="truncate text-xs text-muted-foreground">{user.email}</span>}
            </div>
        </>
    );
}
