import passport from "passport";

export const passportCall = (strategy) => {
  return async (req, res, next) => {
    console.log("🧭 Entrando a passportCall con strategy:", strategy);

    passport.authenticate(strategy, { session: false }, (err, user, info) => {
      console.log("🧪 Resultado de passport.authenticate:");
      console.log("   → err:", err);
      console.log("   → user:", user);
      console.log("   → info:", info);

      if (err) return next(err);
      if (!user) {
        console.warn("⛔ No se autenticó usuario desde token.");
        return res.status(401).send({ error: "No autorizado: usuario inválido." });
      }

      req.user = user;
      console.log("✅ Usuario autenticado:", user);
      next();
    })(req, res, next);
  };
};

export const authorization = (role) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).send("Unauthorized: User not found in JWT");

        if (req.user.role !== role) {
            return res.status(403).send("Forbidden: El usuario no tiene permisos con este rol.");
        }
        next();
    };
};