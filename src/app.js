import express from "express";
import { engine } from "express-handlebars";
import handlebars from "express-handlebars";
import session from "express-session";
import MongoStore from "connect-mongo"; // Manejo de sesiones
import cookieParser from "cookie-parser";
import connectDB from "./config/database.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // 🔥 Esto define __dirname correctamente en ES Modules

// Middleware de autenticación y autorización
import { authorizationMiddleware } from "./middleware/authorizationMiddleware.js";
import { authMiddleware } from "./middleware/auth.middleware.js";


// Passport
import passport from "passport";
import initializePassport from "./config/passport.config.js";

// Rutas

import sessionsRouter from "./routes/sessions.router.js";

import productsRouter from "./routes/productsRouter.js"; // ✅ Importación corregida
import cartsRouter from "./routes/cartsRouter.js"; // ✅ Asegurar que está registrado
import { createHash, isValidPassword } from "./utils/password.utils.js";
import { generateJWToken } from "./utils/jwt.utils.js";
import { passportCall, authorization } from "./utils/passport.utils.js";
//import { __dirname } from "./utils/path.utils.js";
import usersViewsRouter from "./routes/views/users.views.router.js";
import productsViewsRouter from "./routes/views/products.views.router.js";


dotenv.config();
const app = express();
connectDB(); // ✅ Llamamos a la conexión con MongoDB

const SERVER_PORT = process.env.PORT || 9091;


// Configuración de archivos estáticos
app.use(express.static(path.join(__dirname, "src/public")));

// Configuración JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Configuración handlebars
app.engine("handlebars", handlebars.engine());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "handlebars");

// Sesiones con MongoDB
app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
        ttl: 600, // ✅ 10 minutos de sesión
    }),
    secret: process.env.SESSION_SECRET, // 📌 Guardado en `.env`
    resave: false, // 🔥 Evita reescrituras innecesarias
    saveUninitialized: false, // 🔥 Bloquea sesiones vacías
    cookie: {
        httpOnly: true, // 🔥 Solo accesible vía HTTP, evita ataques XSS
        secure: process.env.NODE_ENV === "production", // 🔥 Solo `secure: true` en producción
        maxAge: 600000 // ✅ Expira en 10 minutos
    }
}));


app.use(cookieParser(process.env.COOKIE_SECRET || "CoderS3cr3tC0d3")); // 📌 Usando `process.env`

// Inicialización de Passport (antes de las rutas protegidas)
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// Definimos rutas correctamente después de Passport
app.get("/ping", (req, res) => {
    res.send("pong");
});



// 📌 Importamos `productsRouter.js` y `cartsRouter.js` correctamente
app.use("/api/products", productsRouter); 
app.use("/api/carts", cartsRouter);
app.set("views", path.join(__dirname, "views")); 
app.set("view engine", "handlebars"); 


app.use(express.static('public'));
app.use("/api/sessions", sessionsRouter);
app.use("/", productsViewsRouter);      // home y productos
app.use("/", usersViewsRouter);         // login, registro, etc.

// Server listen
app.listen(SERVER_PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${SERVER_PORT}`);
});