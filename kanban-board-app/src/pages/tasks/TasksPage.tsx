import useFixedLayout from '@/hooks/useFixedLayout';
import useBreadcrumbPath from '@/hooks/useBreadcrumbPath';

function TasksPage({ breadcrumbPath = '' }) {
  useFixedLayout(false);
  useBreadcrumbPath(breadcrumbPath);

  return (
    <>
      <p className="text-3xl font-semibold my-10 mx-auto">There will be tasks page here.</p>
    </>
  );
}

export default TasksPage;
