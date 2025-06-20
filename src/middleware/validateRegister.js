import { body, validationResult } from "express-validator";

export const registerValidationRules = [
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
    .isInt({ min: 12, max: 120 }).withMessage("La edad debe ser entre 12 y 120 años"),

  body("password")
    .notEmpty().withMessage("La contraseña es obligatoria")
    .isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres")
];

export const handleRegisterValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const detalles = errors.array().map(error => error.msg);
    return res.status(400).json({
      estado: "ERROR",
      mensaje: "Validaciones del formulario fallidas",
      errores: detalles
    });
  }
  next();
};