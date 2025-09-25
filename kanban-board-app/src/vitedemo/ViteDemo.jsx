import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { useTheme } from '@heroui/use-theme';
import { Button, Select, SelectItem } from '@heroui/react';
import reactLogo from '@/assets/react.svg';
import viteLogo from '/vite.svg';
import styles from './ViteDemo.module.css';

const themes = [
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' },
  { id: 'purple-dark', name: 'Purple Dark' },
];

function ViteDemo({ breadcrumbPath }) {
  const { theme, setTheme } = useTheme();
  const [count, setCount] = useState(0);
  const setBreadcrumbPath = useOutletContext();

  useEffect(() => {
    setBreadcrumbPath(breadcrumbPath);
  }, [setBreadcrumbPath, breadcrumbPath]);

  function setNewTheme(newTheme) {
    document.documentElement.classList.remove(theme);
    setTheme(newTheme);
  }

  return (
    <div id="page" className="flex flex-col items-center justify-center grow w-full p-2">
      <div className="flex flex-row">
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className={styles.logo} alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className={`${styles.logo} ${styles.react}`} alt="React logo" />
        </a>
      </div>
      <h1 className="text-5xl font-bold m-8">Vite + React</h1>
      <div className="p-8 text-center">
        <Button color="primary" isLoading={false} onPress={() => setCount((_count) => _count + 1)}>
          count is {count}
        </Button>
        <p className="my-4">
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="my-4 text-foreground-500">Click on the Vite and React logos to learn more</p>
      <div className="flex items-center gap-2">
        <span>The current theme is:</span>
        <div className="inline w-48 max-w-xs">
          <Select
            label="Theme"
            disallowEmptySelection
            selectedKeys={new Set([theme])}
            onSelectionChange={(v) => setNewTheme(v.currentKey)}
          >
            {themes.map((_theme) => (
              <SelectItem key={_theme.id}>{_theme.name}</SelectItem>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}

export default ViteDemo;
