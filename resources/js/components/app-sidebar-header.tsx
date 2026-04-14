import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-indigo-200/50 bg-gradient-to-r from-white/90 via-indigo-50/40 to-violet-50/50 px-6 shadow-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 dark:border-indigo-500/25 dark:from-zinc-950/90 dark:via-indigo-950/30 dark:to-violet-950/20">
            <div className="flex min-w-0 flex-1 items-center gap-2">
                <SidebarTrigger className="-ml-1 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-950 dark:text-indigo-200 dark:hover:bg-indigo-500/25 dark:hover:text-white" />
                <div className="min-w-0 [&_a]:font-medium [&_a]:text-indigo-700/90 [&_a]:transition-colors hover:[&_a]:text-indigo-950 [&_span[role='link']]:font-semibold [&_span[role='link']]:text-indigo-900 dark:[&_a]:text-indigo-200/90 dark:hover:[&_a]:text-white dark:[&_span[role='link']]:text-white">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
        </header>
    );
}
