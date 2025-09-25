import { useState, useRef } from 'react';
import { Outlet } from 'react-router';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageHeader from '@/components/PageHeader';

function MainLayout() {
  const [breadcrumbPath, setBreadcrumbPath] = useState('');
  const headerRef = useRef(null);

  return (
    <main className="flex flex-col w-full min-w-xs min-h-screen items-center bg-default-100" ref={headerRef}>
      <PageHeader headerRef={headerRef} />
      <div id="content" className="flex flex-col grow w-full max-w-7xl bg-background shadow-[0_0_6px_rgba(0,0,0,0.4)]">
        <Breadcrumbs breadcrumbPath={breadcrumbPath} />
        <div id="page" className="flex flex-col grow w-full overflow-x-hidden">
          <Outlet context={setBreadcrumbPath} />
        </div>
        <footer className="w-full px-2.5 py-1.5 border-t border-divider shadow-xs">
          <p className="text-sm">Copyright © 2025 Stan D.</p>
        </footer>
      </div>
    </main>
  );
}

export default MainLayout;
