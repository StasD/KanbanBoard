import { Routes, Route, useNavigate, useHref } from 'react-router';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import MainLayout from '@/MainLayout';
import HomePage from '@/pages/home/HomePage';
import BoardPage from '@/pages/board/BoardPage';
import TasksPage from '@/pages/tasks/TasksPage';
import ViteDemo from '@/pages/vitedemo/ViteDemo';

function App() {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <ToastProvider
        placement="top-center"
        toastProps={{
          classNames: {
            base: 'rounded-lg shadow-lg sm:w-fit sm:min-w-[356px] sm:max-w-[500px]',
          },
        }}
      />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage breadcrumbPath={'/'} />} />
          <Route path="/board" element={<BoardPage breadcrumbPath={'/board'} />} />
          <Route path="/tasks" element={<TasksPage breadcrumbPath={'/tasks'} />} />
          <Route path="/vitedemo" element={<ViteDemo breadcrumbPath={'/vitedemo'} />} />
        </Route>
      </Routes>
    </HeroUIProvider>
  );
}

export default App;
