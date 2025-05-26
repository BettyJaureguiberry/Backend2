import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Crear Hash
export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);


// Comparo el Hash
export const isValidPassword = async (user, password) => {
    const resultado = await bcrypt.compare(password, user.password);
    console.log("Resultado de validación:", resultado);
    return resultado;
};




export const PRIVATE_KEY = "CoderhouseBackendCourseSecretKeyJWT";


export const generateJWToken = (user) => {
    return jwt.sign({ user }, PRIVATE_KEY, { expiresIn: '24h' });
}

export const passportCall = (strategy) => {
    return async (req, res, next) => {
        console.log("Entrando a llamar strategy: ", strategy);
        passport.authenticate(strategy, function (err, user, info) {
            if (err) return next(err);

            if (!user) {
                return res.status(401).send({ error: info.messages ? info.messages : info.toString() });
            }

            console.log("Usuario obtenido del strategy: ");
            console.log(user);

            req.user = user
            next()
        })(req, res, next);
    }
}


export const authorization = (role) => {
    return async (req, res, next) => {
        if (!req.user) return res.status(401).send("Unauthorized: User not found in JWT")

        if (req.user.role !== role) {
            return res.status(403).send("Forbidden: El usuario no tiene permisos con este rol.");
        }
        next()
    }
};

export default __dirname;