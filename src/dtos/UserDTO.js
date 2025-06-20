class UserDTO {
    constructor(user) {
        this.name = `${user.first_name} ${user.last_name}`;
        this.email = user.email;
        this.age = user.age;
        this.role = user.role;
        this.cart = user.cart._id; // Si queremos devolver solo el ID del carrito
    }
}

export default UserDTO;