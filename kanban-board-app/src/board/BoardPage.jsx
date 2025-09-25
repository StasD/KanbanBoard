import { useEffect } from 'react';
import { useOutletContext } from 'react-router';

function BoardPage({ breadcrumbPath }) {
  const setBreadcrumbPath = useOutletContext();

  useEffect(() => {
    setBreadcrumbPath(breadcrumbPath);
  }, [setBreadcrumbPath, breadcrumbPath]);

  return (
    <>
      <p className="text-3xl font-semibold my-10 mx-auto">There will be actual kanban board here.</p>
    </>
  );
}

export default BoardPage;
