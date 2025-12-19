const { generateToken, verifyToken } = require('../../utils/token');

// Ensure a stable secret for tests
process.env.JWT_SECRET = 'test_secret_key';

describe('utils/token', () => {
  test('generates and verifies a token', () => {
    const token = generateToken({ id: 'u1', role: 'student' }, '1h');
    const decoded = verifyToken(token);
    expect(decoded).toBeTruthy();
    expect(decoded.id).toBe('u1');
    expect(decoded.role).toBe('student');
  });

  test('returns null for invalid token', () => {
    const bad = 'not.a.token';
    const decoded = verifyToken(bad);
    expect(decoded).toBeNull();
  });
});
