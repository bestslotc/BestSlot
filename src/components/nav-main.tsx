import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { Icon } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link
                activeOptions={{ exact: true }}
                to={item.url} // Add this line
              >
                {({ isActive }) => (
                  <SidebarMenuButton
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    data-state={isActive ? 'active' : 'inactive'}
                    tooltip={item.title}
                  >
                    <div className="flex items-baseline gap-2">
                      {item.icon && <item.icon size={18} />}
                      <span>{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                )}
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
