// Stand-in for the `cloudflare:workers` runtime module, used when the site is
// built for a host that is NOT a Cloudflare Worker (the temporary Vercel
// preview build — see `staticBuild` in vite.config.ts). No bindings exist off
// workerd, and `bindings()` callers already guard on a missing binding, so an
// empty env is the correct shape here.
export const env = {};

export default { env };
