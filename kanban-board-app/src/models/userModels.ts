interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
}

const getFullName = (user?: User | null) => (user ? `${user.firstName} ${user.lastName}`.trim() : '');

export { type User, getFullName };
