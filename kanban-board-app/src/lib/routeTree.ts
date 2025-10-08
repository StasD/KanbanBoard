interface TreeNodeBase {
  name: string;
  path: string;
}

interface TreeNode extends TreeNodeBase {
  navbarPos?: number;
  children?: { [key: string]: TreeNode };
}

const routeTree: TreeNode = {
  name: 'Home',
  path: '/',
  children: {
    board: {
      name: 'Board',
      path: '/board',
      navbarPos: 1,
    },
    tasks: {
      name: 'Tasks',
      path: '/tasks',
      navbarPos: 2,
      children: {
        create: {
          name: 'Create',
          path: '/tasks/create',
        },
        edit: {
          name: 'Edit',
          path: '/tasks/:id/edit',
        },
      },
    },
    vitedemo: {
      name: 'Vite Demo',
      path: '/vitedemo',
      navbarPos: 3,
    },
    login: {
      name: 'Login',
      path: '/login',
    },
    admin: {
      name: 'Admin Area',
      path: '/admin',
    },
  },
};

const getNamePath = (node: TreeNode) => ({ name: node.name, path: node.path }) as TreeNodeBase;

type AccType = [TreeNode | undefined, TreeNodeBase[]];

const getPathInfo = (path: string) =>
  path
    .split('/')
    .filter((s) => s)
    .reduce(
      (acc, val) =>
        ((node, arr) => [node, node ? [...arr, getNamePath(node)] : []] as AccType)(acc[0]?.children?.[val], acc[1]),
      [routeTree, [getNamePath(routeTree)]] as AccType,
    )[1];

const getNavbarItems = () =>
  Object.values(routeTree?.children ?? {})
    .filter((o) => o.navbarPos !== undefined && o.navbarPos > 0)
    .sort((o1, o2) => (o1.navbarPos as number) - (o2.navbarPos as number))
    .map((o) => getNamePath(o));

export { routeTree, getNamePath, getPathInfo, getNavbarItems };
