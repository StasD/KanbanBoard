import { useEffect } from 'react';
import { useOutletContext } from 'react-router';

function TasksPage({ breadcrumbPath }) {
  const setBreadcrumbPath = useOutletContext();

  useEffect(() => {
    setBreadcrumbPath(breadcrumbPath);
  }, [setBreadcrumbPath, breadcrumbPath]);

  return (
    <>
      <p className="text-3xl font-semibold my-10 mx-auto">There will be tasks page here.</p>
    </>
  );
}

export default TasksPage;
