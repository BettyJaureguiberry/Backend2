import userModel from "../models/user.model.js";

class UserDAO {
    async getUserByEmail(email) {
        return await userModel.findOne({ email }).lean();
    }

    async createUser(userData) {
        return await userModel.create(userData);
        
    }

    async updateUserPassword(email, newPassword) {
        return await userModel.updateOne({ email }, { password: newPassword });
    }
}

export default UserDAO;