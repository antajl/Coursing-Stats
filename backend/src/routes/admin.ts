import { Hono } from 'hono';
import { handleAdminEvents } from './admin/events';
import { handleAdminResults } from './admin/results';
import { handleAdminViews } from './admin/views';

type Env = {
  DB: any;
  ADMIN_API_TOKEN: string;
};

export function handleAdmin(app: Hono<{ Bindings: Env }>) {
  handleAdminEvents(app);
  handleAdminResults(app);
  handleAdminViews(app);
}
