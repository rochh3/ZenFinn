const { authClient } = require('../config/supabase');

const authenticateUser = async (req, res, next) => {
  try {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Falta el token de autorización' });
    }

    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(500).json({ error: 'Error interno en la autenticación' });
  }
};

module.exports = { authenticateUser };
