import { useState } from 'react';
import { Outlet } from 'react-router';
import { useTheme } from '@heroui/use-theme';
import Breadcrumbs from '@/components/Breadcrumbs';
import PageHeader from '@/components/PageHeader';

function MainLayout() {
  useTheme();
  const [breadcrumbPath, setBreadcrumbPath] = useState('');
  const [useFixedLayout, setUseFixedLayout] = useState(false);

  return (
    <main
      className={`flex flex-col w-full min-w-xs ${useFixedLayout ? 'h-screen' : 'min-h-screen'} items-center bg-default-100`}
    >
      <PageHeader />
      <div
        id="content"
        className="flex flex-col grow w-full overflow-auto max-w-7xl bg-background shadow-[0_0_6px_rgba(0,0,0,0.4)]"
      >
        <Breadcrumbs breadcrumbPath={breadcrumbPath} />
        <div id="page" className="flex flex-col grow w-full overflow-auto">
          <Outlet context={{ setBreadcrumbPath, setUseFixedLayout }} />
        </div>
        <footer className="w-full px-2.5 py-1.5 border-t border-divider shadow-xs">
          <p className="text-sm">Copyright © 2025 Stan D.</p>
        </footer>
      </div>
    </main>
  );
}

export default MainLayout;
