const { requireAuth, requireRole } = require('../../middleware/auth');

function makeRes() {
  const res = { redirectPath: null, statusCode: null, view: null, locals: {} };
  res.redirect = (p) => { res.redirectPath = p; return res; };
  res.status = (c) => { res.statusCode = c; return res; };
  res.render = (v) => { res.view = v; return res; };
  return res;
}

describe('middleware/auth', () => {
  test('requireAuth redirects HTML clients to login when not authenticated', () => {
    const req = { user: null, accepts: () => true };
    const res = makeRes();
    const next = jest.fn();
    requireAuth(req, res, next);
    expect(res.redirectPath).toBe('/auth/login');
    expect(next).not.toHaveBeenCalled();
  });

  test('requireAuth calls next when authenticated', () => {
    const req = { user: { id: 'u1' }, accepts: () => true };
    const res = makeRes();
    const next = jest.fn();
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('requireRole denies wrong role with 403 and forbidden view', () => {
    const req = { user: { role: 'student' } };
    const res = makeRes();
    const next = jest.fn();
    requireRole('donor')(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(res.view).toBe('auth/forbidden');
    expect(next).not.toHaveBeenCalled();
  });

  test('requireRole allows correct role', () => {
    const req = { user: { role: 'donor' } };
    const res = makeRes();
    const next = jest.fn();
    requireRole('donor')(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
