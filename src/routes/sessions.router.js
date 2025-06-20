import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import UserDTO from '../dtos/UserDTO.js';
import { createHash, isValidPassword } from '../utils/password.utils.js';
import { generateJWToken } from '../utils/jwt.utils.js';
import { generateResetToken, sendRecoveryEmail, verifyResetToken } from '../services/auth.service.js';
import userService from '../services/UserService.js';
import express from "express";
import { body, validationResult } from "express-validator";


const router = express.Router();

// 🧪 Validaciones del body
const validateRegister = [
  body("first_name")
    .notEmpty().withMessage("El nombre es obligatorio")
    .isAlpha("es-ES", { ignore: " " }).withMessage("El nombre solo puede contener letras"),

  body("last_name")
    .notEmpty().withMessage("El apellido es obligatorio")
    .isAlpha("es-ES", { ignore: " " }).withMessage("El apellido solo puede contener letras"),

  body("email")
    .notEmpty().withMessage("El email es obligatorio")
    .isEmail().withMessage("El email no tiene un formato válido"),

  body("age")
    .notEmpty().withMessage("La edad es obligatoria")
    .isInt({ min: 12 }).withMessage("La edad debe ser mayor de 12 años"),

  body("password")
    .notEmpty().withMessage("La contraseña es obligatoria")
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres")
];

// 📌 Registro de usuario con validaciones
router.post("/register", validateRegister, async (req, res) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      const mensajes = errores.array().map(e => e.msg);
      return res.status(400).json({
        status: "error",
        message: "Errores en la validación",
        errores: mensajes
      });
    }

    const { first_name, last_name, email, password, age } = req.body;

    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ status: "error", message: "El usuario ya existe." });
    }

    const newUser = await userService.createUser({ first_name, last_name, email, password, age });
    console.log("✅ Usuario creado:", newUser.email);

    return res.status(201).json({
      status: "success",
      message: "Usuario creado con éxito",
      user: {
        name: `${newUser.first_name} ${newUser.last_name}`,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
    return res.status(500).json({ status: "error", message: "Error interno del servidor" });
  }
});

// 📌 Login de usuario
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🧱 req.body completo:", req.body);

    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ status: "error", message: "Usuario no encontrado" });
    }

    const isPasswordValid = await isValidPassword(user, password);
    console.log("🔐 Contraseña válida:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ status: "error", message: "Contraseña incorrecta" });
    }

    const tokenPayload = {
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: user.role
    };

    const token = generateJWToken(tokenPayload);
    console.log("🎫 Token generado:", token);

    return res.status(200).json({
      status: "success",
      message: "Login exitoso",
      token
    });
  } catch (err) {
    console.error("💥 Error inesperado en login:", err);
    return res.status(500).json({ status: "error", message: "Error interno del servidor" });
  }
});

// 📌 Perfil de usuario autenticado
router.get("/profile", passport.authenticate("jwt", { session: false }), (req, res) => {
  const { name, email, age } = req.user;
  res.render("profile", {
    user: { name, email, age }
  });
});

// 📌 Usuario actual (con DTO)
router.get('/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const user = await userService.findUserByEmail(req.user.email);
    if (!user) return res.status(404).send({ status: "error", message: "Usuario no encontrado." });

    const userDTO = new UserDTO(user);
    res.send({ status: "success", user: userDTO });
  } catch (error) {
    res.status(500).send({ status: "error", message: "Error al obtener datos del usuario." });
  }
});

// 📌 Recuperar contraseña
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userService.findUserByEmail(email);
    if (!user) return res.status(404).send({ message: "Usuario no encontrado" });

    const resetToken = generateResetToken(user.email);
    await sendRecoveryEmail(user.email, resetToken);

    res.send({ status: "success", message: "Email de recuperación enviado" });
  } catch (error) {
    console.error("Error en recuperación:", error);
    res.status(500).send({ message: "Error al procesar la recuperación" });
  }
});

// 📌 Restablecer contraseña
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = verifyResetToken(token);
    if (!decoded) return res.status(401).send({ message: "Token inválido o expirado" });

    const user = await userService.findUserByEmail(decoded.email);
    if (!user) return res.status(404).send({ message: "Usuario no encontrado" });

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).send({ message: "La nueva contraseña no puede ser la misma que la anterior." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await userService.resetUserPassword(decoded.email, hashed);

    return res.status(200).send({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Error al restablecer contraseña" });
  }
});

// 📌 Logout
router.get("/logout", (req, res) => {
  res.clearCookie("jwtCookieToken");
  req.session.destroy(err => {
    if (err) return res.status(500).send({ message: "Error al cerrar sesión" });
    res.send({ message: "Sesión cerrada correctamente" });
  });
});

// 📌 Rutas de error
router.get("/fail-register", (req, res) => {
  res.status(401).send({ error: "Error en registro!" });
});

router.get("/fail-login", (req, res) => {
  res.status(401).send({ error: "Error en login!" });
});

router.get('/debug/user/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await userService.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ status: "error", message: "Usuario no encontrado." });
    }

    res.status(200).json({
      status: "success",
      debug: {
        _id: user._id,
        email: user.email,
        passwordHash: user.password,
        role: user.role,
        nombreCompleto: `${user.first_name} ${user.last_name}`,
        age: user.age
      }
    });
  } catch (err) {
    console.error("🧨 Error en /debug/user/:email:", err);
    res.status(500).json({ status: "error", message: "Error al obtener usuario desde base" });
  }
});

export default router;