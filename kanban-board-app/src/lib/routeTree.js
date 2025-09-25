const routeTree = {
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

const getNamePath = (node) => ({ name: node.name, path: node.path });

const getPathInfo = (path) =>
  path
    .split('/')
    .filter((s) => s)
    .reduce(
      (acc, val) => ((node, arr) => [node, node ? [...arr, getNamePath(node)] : []])(acc[0].children[val], acc[1]),
      [routeTree, [getNamePath(routeTree)]],
    )[1];

const getNavbarItems = () =>
  Object.values(routeTree.children)
    .filter((o) => o.navbarPos > 0)
    .sort((o1, o2) => o1.navbarPos - o2.navbarPos)
    .map((o) => getNamePath(o));

export { routeTree, getNamePath, getPathInfo, getNavbarItems };
