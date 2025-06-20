
import UserService from '../services/UserService.js';

class UserController {
    async register(req, res) {
        try {
            const user = await UserService.createUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new UserController();