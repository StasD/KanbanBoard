import { Breadcrumbs, BreadcrumbItem } from '@heroui/react';
import { HomeIcon } from '@heroicons/react/24/solid';
import { getPathInfo } from '@/lib/routeTree';

function BreadcrumbsComponent({ breadcrumbPath }) {
  const pathInfo = getPathInfo(breadcrumbPath ?? '');

  if (pathInfo.length < 2) return null;

  return (
    <div id="breadcrumbs" className="w-full px-2.5 py-1.5 border-b border-divider shadow-xs">
      <Breadcrumbs underline="hover">
        {pathInfo.map((item, index) => (
          <BreadcrumbItem key={index} href={index < pathInfo.length - 1 ? item.path : undefined}>
            {index === 0 ? <HomeIcon className="w-4" /> : item.name}
          </BreadcrumbItem>
        ))}
      </Breadcrumbs>
    </div>
  );
}

export default BreadcrumbsComponent;
