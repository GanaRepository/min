'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LogOut,
  Briefcase,
  FileText,
  LayoutDashboard,
  Menu,
  Users,
  Edit3,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import useSessionStore from '@/stores/useSessionStore';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Get session data and fetch function from store
  const { session, loading: sessionLoading, fetchSession } = useSessionStore();

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    const verifyAuth = async () => {
      // First check Zustand store
      if (session) {
        setLoading(false);
        return;
      }

      // If no session in store, try to fetch it
      await fetchSession();

      // After fetch, check if we have a session
      const currentSession = useSessionStore.getState().session;

      if (!currentSession) {
        router.push('/admin/login');
      } else {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [pathname, router, session, fetchSession]);

  if (loading && pathname !== '/admin/login') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F6F9FC]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#7E69AB] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return children;
  }

  const isActive = (path: string) => {
    return pathname === path;
  };

  const NavButton = ({
    path,
    icon: Icon,
    label,
    className = '',
  }: {
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    className?: string;
  }) => (
    <Button
      variant={isActive(path) ? 'default' : 'ghost'}
      className={`justify-start ${
        isActive(path)
          ? 'bg-[#7E69AB] text-white'
          : 'text-gray-700 hover:text-[#7E69AB] hover:bg-[#7E69AB]/10'
      } ${className}`}
      onClick={() => router.push(path)}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );

  return (
    <div className="min-h-screen bg-[#F6F9FC]">
      {/* Desktop Navigation (Two-Row) - Only visible on lg and above */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 hidden lg:block w-full">
        <div className="w-full px-4">
          {/* First row - Logo and company name */}
          <div className="flex justify-between h-16 border-b  border-gray-200">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="text-2xl text-gray-900 font-heading mr-1">
                  Pioneer
                </div>
                <div className="text-2xl text-[#7E69AB] font-heading">IT</div>
                <div className="text-2xl text-gray-900 font-heading ml-1">
                  Systems
                </div>
                <div className="text-xl text-gray-900 ml-1">🚀</div>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/logout" passHref legacyBehavior>
                <Button
                  variant="outline"
                  className="gradient-button text-white rounded-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </Link>
            </div>
          </div>

          {/* Second row - Navigation buttons */}
          <div className="flex flex-wrap items-center h-auto p-2">
            <div className="flex justify-center space-x-4 flex-wrap">
              <NavButton
                path="/admin/dashboard"
                icon={LayoutDashboard}
                label="Inquiry/Feedback"
                className="mx-4 lg:ml-10"
              />
              <NavButton
                path="/admin/job-openings"
                icon={Briefcase}
                label="Post Job Openings"
                className="mx-4"
              />
              <NavButton
                path="/admin/applications"
                icon={FileText}
                label="Job Applications Received"
                className="mx-4"
              />
              <NavButton
                path="/admin/manage-employees"
                icon={Users}
                label="Create & Manage Employees"
                className="mx-4"
              />
              <NavButton
                path="/admin/manage-users"
                icon={Users}
                label="Manage Users"
                className="mx-4"
              />
              <NavButton
                path="/admin/timesheets"
                icon={Clock}
                label="Manage Timesheets"
                className="mx-4"
              />
              <NavButton
                path="/admin/blogs"
                icon={Edit3}
                label="Post Blogs"
                className="mx-4"
              />
              <NavButton
                path="/admin/comments"
                icon={MessageSquare}
                label="Blog Comments"
                className="mx-4"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Tablet Navigation (Single Row with Hamburger) - Only visible on sm to md */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 hidden sm:block lg:hidden w-full">
        <div className="w-full px-4 sm:px-6">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="text-2xl text-gray-900 font-heading mr-1">
                  Pioneer
                </div>
                <div className="text-2xl text-[#7E69AB] font-heading">IT</div>
                <div className="text-2xl text-gray-900 font-heading ml-1">
                  Systems
                </div>
                <div className="text-xl text-gray-900 ml-1">🚀</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/logout" passHref legacyBehavior>
                <Button
                  variant="outline"
                  className="text-gray-700 border-gray-300 hover:bg-[#7E69AB]/10 hover:text-[#7E69AB] rounded-full mr-2"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </Link>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-700 hover:bg-[#7E69AB]/10"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="bg-white border-gray-100 w-64"
                >
                  <SheetHeader>
                    <SheetTitle className="text-gray-900">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-4 pt-6">
                    <SheetClose asChild>
                      <NavButton
                        path="/admin/dashboard"
                        icon={LayoutDashboard}
                        label="Inquiry/Feedback"
                        className="w-full"
                      />
                    </SheetClose>

                    <SheetClose asChild>
                      <NavButton
                        path="/admin/job-openings"
                        icon={Briefcase}
                        label="Post Job Openings"
                        className="w-full"
                      />
                    </SheetClose>

                    <SheetClose asChild>
                      <NavButton
                        path="/admin/applications"
                        icon={FileText}
                        label="Job Applications Received"
                        className="w-full"
                      />
                    </SheetClose>

                    <SheetClose asChild>
                      <NavButton
                        path="/admin/manage-employees"
                        icon={Users}
                        label="Create & Manage Employees"
                        className="w-full"
                      />
                    </SheetClose>

                    <SheetClose asChild>
                      <NavButton
                        path="/admin/manage-users"
                        icon={Users}
                        label="Manage Users"
                        className="w-full"
                      />
                    </SheetClose>

                    <SheetClose asChild>
                      <NavButton
                        path="/admin/timesheets"
                        icon={Clock}
                        label="Manage Timesheets"
                        className="w-full"
                      />
                    </SheetClose>

                    <SheetClose asChild>
                      <NavButton
                        path="/admin/blogs"
                        icon={Edit3}
                        label="Post Blogs"
                        className="w-full"
                      />
                    </SheetClose>

                    <SheetClose asChild>
                      <NavButton
                        path="/admin/comments"
                        icon={MessageSquare}
                        label="Blog Comments"
                        className="w-full"
                      />
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="sm:hidden fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 w-full">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center">
            <div className="text-xl text-gray-900 font-heading mr-1">
              Pioneer
            </div>
            <div className="text-xl text-[#7E69AB] font-heading">IT</div>
            <div className="text-xl text-gray-900 font-heading ml-1">
              Systems
            </div>
            <div className="text-lg text-gray-900 ml-1">🚀</div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:bg-[#7E69AB]/10"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-white border-gray-100 w-64"
            >
              <SheetHeader>
                <SheetTitle className="text-gray-900">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 pt-6">
                <SheetClose asChild>
                  <NavButton
                    path="/admin/dashboard"
                    icon={LayoutDashboard}
                    label="Inquiry/Feedback"
                    className="w-full"
                  />
                </SheetClose>

                <SheetClose asChild>
                  <NavButton
                    path="/admin/job-openings"
                    icon={Briefcase}
                    label="Post Job Openings"
                    className="w-full"
                  />
                </SheetClose>

                <SheetClose asChild>
                  <NavButton
                    path="/admin/applications"
                    icon={FileText}
                    label="Job Applications Received"
                    className="w-full"
                  />
                </SheetClose>

                <SheetClose asChild>
                  <NavButton
                    path="/admin/manage-employees"
                    icon={Users}
                    label="Create & Manage Employees"
                    className="w-full"
                  />
                </SheetClose>

                <SheetClose asChild>
                  <NavButton
                    path="/admin/manage-users"
                    icon={Users}
                    label="Manage Users"
                    className="w-full"
                  />
                </SheetClose>

                <SheetClose asChild>
                  <NavButton
                    path="/admin/timesheets"
                    icon={Clock}
                    label="Manage Timesheets"
                    className="w-full"
                  />
                </SheetClose>

                <SheetClose asChild>
                  <NavButton
                    path="/admin/blogs"
                    icon={Edit3}
                    label="Post Blogs"
                    className="w-full"
                  />
                </SheetClose>

                <SheetClose asChild>
                  <NavButton
                    path="/admin/comments"
                    icon={MessageSquare}
                    label="Blog Comments"
                    className="w-full"
                  />
                </SheetClose>

                <SheetClose asChild>
                  <Link href="/logout" passHref legacyBehavior>
                    <Button
                      variant="ghost"
                      className="justify-start w-full text-white gradient-button"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </Link>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <div className="sm:hidden fixed bottom-4 left-0 right-0 z-50 flex justify-center w-full">
        <div className="flex items-center space-x-1 rounded-full bg-white backdrop-blur-lg border border-gray-100 p-1.5 shadow-lg">
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full p-2 ${
              isActive('/admin/dashboard')
                ? 'bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] text-white'
                : 'text-gray-700'
            }`}
            onClick={() => router.push('/admin/dashboard')}
          >
            <LayoutDashboard className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full p-2 ${
              isActive('/admin/job-openings')
                ? 'bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] text-white'
                : 'text-gray-700'
            }`}
            onClick={() => router.push('/admin/job-openings')}
          >
            <Briefcase className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full p-2 ${
              isActive('/admin/applications')
                ? 'bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] text-white'
                : 'text-gray-700'
            }`}
            onClick={() => router.push('/admin/applications')}
          >
            <FileText className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full p-2 ${
              isActive('/admin/manage-employees')
                ? 'bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] text-white'
                : 'text-gray-700'
            }`}
            onClick={() => router.push('/admin/manage-employees')}
          >
            <Users className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full p-2 ${
              isActive('/admin/manage-users')
                ? 'bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] text-white'
                : 'text-gray-700'
            }`}
            onClick={() => router.push('/admin/manage-users')}
          >
            <Users className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full p-2 ${
              isActive('/admin/timesheets')
                ? 'bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] text-white'
                : 'text-gray-700'
            }`}
            onClick={() => router.push('/admin/timesheets')}
          >
            <Clock className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full p-2 ${
              isActive('/admin/blogs')
                ? 'bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] text-white'
                : 'text-gray-700'
            }`}
            onClick={() => router.push('/admin/blogs')}
          >
            <Edit3 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full p-2 ${
              isActive('/admin/comments')
                ? 'bg-gradient-to-r from-[#7E69AB] to-[#33C3F0] text-white'
                : 'text-gray-700'
            }`}
            onClick={() => router.push('/admin/comments')}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Link href="/logout">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full p-2 text-gray-700"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      <main className="w-full pt-32 lg:pt-28 pb-24 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30 pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-[#7E69AB]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-[#33C3F0]/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
