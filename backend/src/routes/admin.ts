import { Hono } from 'hono';
import { handleAdminDogs } from './admin/dogs';
import { handleAdminEvents } from './admin/events';
import { handleAdminResults } from './admin/results';
import { handleAdminViews } from './admin/views';

type Env = {
  DB: any;
  ADMIN_API_TOKEN: string;
};

export function handleAdmin(app: Hono<{ Bindings: Env }>) {
  handleAdminDogs(app);
  handleAdminEvents(app);
  handleAdminResults(app);
  handleAdminViews(app);
}
