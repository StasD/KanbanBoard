import useFixedLayout from '@/hooks/useFixedLayout';
import useBreadcrumbPath from '@/hooks/useBreadcrumbPath';

function HomePage({ breadcrumbPath = '' }) {
  useFixedLayout(false);
  useBreadcrumbPath(breadcrumbPath);

  return (
    <>
      <p className="text-3xl font-semibold my-10 mx-auto">Welcome to the Kanban Board Demo.</p>
    </>
  );
}

export default HomePage;
