import { Router } from "express";
import passport from "passport";
import userModel from "../../models/user.model.js";
import { isValidPassword } from "../../utils/password.utils.js";

const router = Router();

// 🔹 Mostrar formulario de registro
router.get("/register", (req, res) => {
  res.render("register"); // Vista: views/register.handlebars
});

// 🔹 Mostrar formulario de login
router.get("/login", (req, res) => {
  res.render("login"); // Vista: views/login.handlebars
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return res.render("login", { error: "Usuario no encontrado" });

    const validPassword = await isValidPassword(user, password);
    if (!validPassword) return res.render("login", { error: "Contraseña incorrecta" });

    const tokenUser = {
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      age: user.age,
    };

    const token = generateJWToken(tokenUser);

    res.cookie("jwtCookieToken", token, {
      maxAge: 3600000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.redirect("/profile");
  } catch (error) {
    console.error("Error en login:", error);
    return res.render("login", { error: "Error interno" });
  }
});

// 🔹 Mostrar perfil del usuario autenticado
router.get("/profile", passport.authenticate("jwt", { session: false }), (req, res) => {
  const { name, email, age } = req.user;
  res.render("profile", { user: { name, email, age } });
});

router.post(  "/register",
  passport.authenticate("register", {
    failureRedirect: "/api/sessions/fail-register"
  }),
  async (req, res) => {
    res.redirect("/login"); // o render("registerSuccess")
  }
);

export default router;