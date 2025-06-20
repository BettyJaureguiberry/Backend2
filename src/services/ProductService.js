import ProductRepository from "../repositories/ProductRepository.js";

class ProductService {
    constructor() {
        this.productRepo = new ProductRepository();
    }

    async getProducts(limit, page, query, sort) {
        return await this.productRepo.getProducts(limit, page, query, sort);
    }

    async getProduct(id) {
        const product = await this.productRepo.getProduct(id);
        if (!product) throw new Error("Producto no encontrado!");
        return product;
    }

    async createProduct(productData) {
        if (!productData.title || !productData.price) {
            throw new Error("Faltan datos obligatorios!");
        }
        return await this.productRepo.createProduct(productData);
    }

    async updateProduct(id, productData) {
        return await this.productRepo.updateProduct(id, productData);
    }

    async removeProduct(id) {
        return await this.productRepo.removeProduct(id);
    }
}

export default ProductService;