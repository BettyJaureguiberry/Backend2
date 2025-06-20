import { productsModel } from "../models/products.model.js";

class ProductDAO {
    async getProducts(filter = {}, options = {}) {
        return await productsModel.paginate(filter, { ...options, lean: true });
    }

    async getProductById(id) {
        return await productsModel.findOne({ _id: id }).lean();
    }

    async addProduct(product) {
        return await productsModel.create(product);
    }

    async editProduct(id, product) {
        return await productsModel.updateOne({ _id: id }, product);
    }

    async deleteProduct(id) {
        return await productsModel.deleteOne({ _id: id });
    }
}

export default ProductDAO;