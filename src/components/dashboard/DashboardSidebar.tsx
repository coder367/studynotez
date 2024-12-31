import { NavLink } from "react-router-dom";
import {
  BookOpen,
  MessageSquare,
  Users,
  User,
  CreditCard,
} from "lucide-react";

const DashboardSidebar = () => {
  const menuItems = [
    {
      title: "Notes",
      icon: <BookOpen className="w-4 h-4" />,
      href: "/dashboard/notes",
    },
    {
      title: "Chat",
      icon: <MessageSquare className="w-4 h-4" />,
      href: "/dashboard/chat",
    },
    {
      title: "Study Room",
      icon: <Users className="w-4 h-4" />,
      href: "/dashboard/study-room",
    },
    {
      title: "Profile",
      icon: <User className="w-4 h-4" />,
      href: "/dashboard/profile",
    },
    {
      title: "Pricing",
      icon: <CreditCard className="w-4 h-4" />,
      href: "/dashboard/pricing",
    },
  ];

  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 bottom-0 bg-background border-r">
      <div className="flex h-14 items-center border-b px-6 font-semibold">
        Study Notes
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                isActive ? "bg-accent" : ""
              }`
            }
          >
            {item.icon}
            {item.title}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;