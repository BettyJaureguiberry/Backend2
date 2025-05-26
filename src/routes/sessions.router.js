import { Router } from 'express';
import userModel from '../models/user.model.js'
import { createHash, isValidPassword, generateJWToken } from '../utils.js';
import passport from 'passport';




const router = Router();


// Register
// 📌 Register - Se eliminó `tokenUser` y `access_token` de la respuesta
router.post('/register', passport.authenticate('register', { failureRedirect: '/api/sessions/fail-register' }), async (req, res) => {
    res.send({ status: "success", message: "Usuario creado exitosamente!" });
});


// 📌 Login - Se agregaron logs para depuración y ajuste de `secure: req.secure`
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Buscando usuario en la base de datos con email:", email);
        
        const user = await userModel.findOne({ email: email });
        console.log("Usuario encontrado para login:", user);

        if (!user) {
            console.warn("User doesn't exist with username:", email);
            return res.status(204).send({ error: "Not found", message: "Usuario no encontrado con username: " + email });
        }

        console.log("Contraseña ingresada:", password);
        console.log("Contraseña almacenada en BD:", user.password);
        console.log("Validación de contraseña:", isValidPassword(user, password));

        if (!isValidPassword(user, password)) {
            console.warn("Invalid credentials for user:", email);
            return res.status(401).send({ status: "error", error: "El usuario y la contraseña no coinciden!" });
        }

        const tokenUser = {
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            age: user.age,
            role: user.role
        };

        const access_token = generateJWToken(tokenUser);
        console.log("Token generado:", access_token);

        // 📌 Ajuste en `res.cookie` con `secure: req.secure`
        res.cookie('jwtCookieToken', access_token, {
            maxAge: 60000,
            httpOnly: true,
            secure: req.secure // Solo activo en HTTPS
        });

        res.send({
            status: "success",
            message: "Login exitoso, bienvenido!",
            user: tokenUser,
            token: access_token
        });

    } catch (error) {
        console.error("Error en el proceso de login:", error);
        res.status(400).json({ error: error.message });
    }
});


// 📌 Manejo de errores en login y register
router.get("/fail-register", (req, res) => {
    res.status(401).send({ error: "Failed to process register!" });
});

router.get("/fail-login", (req, res) => {
    res.status(401).send({ error: "Failed to process login!" });
});


// 📌 Nueva ruta `/api/sessions/current` para obtener usuario autenticado
router.get('/current', passport.authenticate('current', { session: false }), async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.user.email }).populate('cart');
        if (!user) {
            return res.status(404).send({ status: "error", message: "Usuario no encontrado." });
        }

        res.send({
            status: "success",
            user: {
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                age: user.age,
                role: user.role,
                cart: user.cart // 🔹 Devuelve el carrito del usuario
            }
        });
    } catch (error) {
        res.status(500).send({ status: "error", message: "Error al obtener datos del usuario." });
    }
});


export default router;