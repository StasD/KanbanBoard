import { Routes, Route, useNavigate, useHref } from 'react-router';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import MainLayout from '@/MainLayout';
import HomePage from '@/home/HomePage';
import BoardPage from '@/board/BoardPage';
import TasksPage from '@/tasks/TasksPage';
import ViteDemo from '@/vitedemo/ViteDemo';

function App() {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <ToastProvider />
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
