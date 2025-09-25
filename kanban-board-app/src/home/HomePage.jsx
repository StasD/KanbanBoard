import { useEffect } from 'react';
import { useOutletContext } from 'react-router';

function HomePage({ breadcrumbPath }) {
  const setBreadcrumbPath = useOutletContext();

  useEffect(() => {
    setBreadcrumbPath(breadcrumbPath);
  }, [setBreadcrumbPath, breadcrumbPath]);

  return (
    <>
      <p className="text-3xl font-semibold my-10 mx-auto">Welcome to the Kanban Board Demo.</p>
    </>
  );
}

export default HomePage;
