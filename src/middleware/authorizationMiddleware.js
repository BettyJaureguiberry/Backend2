export const authorizationMiddleware = (requiredRole) => {
    return (req, res, next) => {
        console.log("🧠 Middleware auth > req.user entero:", JSON.stringify(req.user, null, 2));
        const currentUser = req.user?.user || req.user;
        console.log("🧪 Middleware auth > Usuario detectado:", currentUser);
        console.log("🎯 Middleware auth > Rol detectado:", currentUser?.role);
        console.log("🔍 Usuario en autorización:", JSON.stringify(currentUser, null, 2));

        if (!currentUser?.role) {
            console.error("❌ AuthorizationMiddleware - El usuario no tiene rol definido!");
            return res.status(401).send({ message: "No autorizado, falta información de usuario" });
        }

        if (currentUser.role !== requiredRole) {
            console.error(`⛔ AuthorizationMiddleware - Acceso denegado: Se requiere ${requiredRole}, pero el usuario tiene ${currentUser.role}`);
            return res.status(403).send({ message: `Acceso denegado, se requiere rol ${requiredRole}` });
        }

        next();
    };
};