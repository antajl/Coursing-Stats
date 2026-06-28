import app from './app';

export default {
  async fetch(request, env) {
    return app.fetch(request, env);
  }
};
