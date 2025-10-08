import axios from '@/api/axios';
import { type User } from '@/models/userModels';

const _usersUrl = '/Users';

const getUsers = () => axios.get(_usersUrl).then(({ data }) => data as User[]);

export { getUsers };
