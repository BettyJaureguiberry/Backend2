import passport from "passport";
import passportLocal from "passport-local";
import jwtStrategy from "passport-jwt";
import userModel from "../models/user.model.js";
import { createHash, isValidPassword } from "../utils/password.utils.js";
import bcrypt from "bcrypt";

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = jwtStrategy.Strategy;
const ExtractJWT = jwtStrategy.ExtractJwt;

// 🔹 Extractor de token desde la cookie
const cookieExtractor = (req) => {
  if (req && req.cookies) {
    const token = req.cookies["jwtCookieToken"];
    console.log(token ? `🔹 Token de cookie: ${token}` : "❌ No se encontró jwtCookieToken.");
    return token;
  }
  return null;
};

const initializePassport = () => {
  // 🔹 Estrategia para autenticación via JWT desde cookie
  passport.use(
    "current",
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.JWT_SECRET
      },
      async (jwt_payload, done) => {
        try {
          if (!jwt_payload) {
            return done(null, false, { message: "Token inválido." });
          }

          console.log("✅ Usuario autenticado desde JWT:", jwt_payload);
          return done(null, jwt_payload);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // 🔹 Estrategia para registro de usuarios
  passport.use(
    "register",
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: "email"
      },
      async (req, email, password, done) => {
        try {
          const { first_name, last_name, age } = req.body;
          const userExists = await userModel.findOne({ email });
          if (userExists) return done(null, false, { message: "El usuario ya existe." });

          if (!password || password.length < 6) {
            return done(null, false, { message: "La contraseña es demasiado corta." });
          }

          const hashedPassword = await bcrypt.hash(password, 10);
          const newUser = await userModel.create({
            first_name,
            last_name,
            email,
            age,
            password: hashedPassword
          });

          console.log("🎉 Usuario creado:", newUser.email);
          return done(null, newUser);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // 🔸 (Opcional) Estrategia por Authorization header, por si lo querés usar desde Postman
  passport.use("jwt", new JwtStrategy(
  {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  },
  async (jwt_payload, done) => {
  console.log("📦 JWT payload recibido:", jwt_payload);
  return done(null, jwt_payload);
}
));

  // 🔸 Serialización (no usada si no hay sesiones)
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
};

export default initializePassport;