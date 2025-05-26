import passport from 'passport';
import passportLocal from 'passport-local';
import jwtStrategy from 'passport-jwt';
import userModel from '../models/user.model.js';
import { PRIVATE_KEY, createHash, isValidPassword } from '../utils.js';
import router from '../routes/users.views.router.js';




const localStrategy = passportLocal.Strategy;


const JwtStrategy = jwtStrategy.Strategy;
const ExtractJWT = jwtStrategy.ExtractJwt;


const initializePassport = () => {

    // 📌 Estrategia "current" - Obtiene el usuario desde el JWT en la cookie
    passport.use('current', new JwtStrategy(
        {
            jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
            secretOrKey: PRIVATE_KEY
        },
        async (jwt_payload, done) => {
            try {
                if (!jwt_payload.user) {
                    return done(null, false, { message: "Token inválido, usuario no encontrado." });
                }
                return done(null, jwt_payload.user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    // 📌 Estrategia "register" - Registro de usuarios con contraseña hasheada
    passport.use('register', new localStrategy(
        {
            passReqToCallback: true,
            usernameField: 'email'
        },
        async (req, username, password, done) => {
            const { first_name, last_name, email, age } = req.body;
            console.log("Registrando usuario:");
            console.log(req.body);

            try {
                const userExists = await userModel.findOne({ email });
                if (userExists) {
                    console.log("El usuario ya existe.");
                    return done(null, false, { message: "El usuario ya existe." });
                }

                if (!password || password.length < 6) {
                    return done(null, false, { message: "La contraseña debe tener al menos 6 caracteres." });
                }
                let newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password), // Encripta la contraseña antes de guardar
                };
                console.log("Contraseña original antes de guardar:", password);
                console.log("Contraseña hasheada antes de guardar:", newUser.password);
                const result = await userModel.create(newUser);
                const savedUser = await userModel.findOne({ email: email });
                console.log("Contraseña guardada en BD:", savedUser.password);
                return done(null, result);
                

            } catch (error) {
                console.error("Error en la autenticación:", error);
                return done(error);
            }
        }
    ));

    // 📌 Estrategia "jwt" - Autenticación mediante token
    passport.use('jwt', new JwtStrategy(
        {
            jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
            secretOrKey: PRIVATE_KEY
        },
        async (jwt_payload, done) => {
            console.log("Entrando a passport Strategy con JWT.");
            try {
                console.log("JWT obtenido del Payload");
                console.log(jwt_payload);
                return done(null, jwt_payload.user);
            } catch (error) {
                return done(error);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            let user = await userModel.findById(id);
            done(null, user);
        } catch (error) {
            console.error("Error deserializando el usuario: " + error);
            done(error, null);
        }
    });
};



const cookieExtractor = req => {
    console.log("Entrando a Cookie Extractor");
    if (req && req.cookies) {
        console.log("Cookies presentes:", req.cookies);
        const token = req.cookies['jwtCookieToken'];
        console.log(token ? `Token obtenido: ${token}` : "No se encontró JWT en las cookies.");
        return token;
    }
    return null;
};

export default initializePassport;