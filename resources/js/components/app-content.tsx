import { SidebarInset } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import * as React from 'react';

/** Matches app-sidebar vivid theme: soft gradient + subtle depth on bordered panels inside pages */
const pageShellClassName = cn(
    'bg-gradient-to-br from-indigo-50/50 via-background to-violet-50/40 dark:from-indigo-950/25 dark:via-background dark:to-violet-950/20',
    // Lift common page cards / bordered regions slightly toward the palette
    '[&_.rounded-xl.border]:border-indigo-200/35 [&_.rounded-xl.border]:shadow-sm dark:[&_.rounded-xl.border]:border-indigo-500/20',
);

interface AppContentProps extends React.ComponentProps<'div'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({ variant = 'header', children, className, ...props }: AppContentProps) {
    if (variant === 'sidebar') {
        return (
            <SidebarInset className={cn(pageShellClassName, 'min-w-0', className)} {...props}>
                {children}
            </SidebarInset>
        );
    }

    return (
        <main className={cn('mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl', pageShellClassName, className)} {...props}>
            {children}
        </main>
    );
}
