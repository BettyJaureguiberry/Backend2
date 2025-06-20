 export const  authMiddleware = (req, res, next) => {
    console.log("Headers recibidos:", req.headers); // 🔥 Depuración

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        console.error("Error: No se encontró la cabecera 'Authorization'");
        return res.status(401).send({ message: "No autorizado, falta token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token decodificado antes de asignar req.user:", decoded); // 🔍 Verificación profunda

        req.user = decoded.user; // ✅ Aquí debe ser `decoded.user`
        console.log("Usuario asignado a req.user:", req.user); // 🔥 Verificación extra

        if (!req.user || !req.user.role) {
            console.error("Error: req.user o req.user.role no están definidos!");
            return res.status(401).send({ message: "No autorizado, error en asignación de usuario" });
        }

        next();
        console.log("🛠️ Se ejecutó next(), req.user debería estar disponible!");
    } catch (error) {
        console.error("Error al verificar el token:", error);
        return res.status(403).send({ message: "Token inválido" });
    }
};
