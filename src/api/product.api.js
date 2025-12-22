import api from "./axios.instance";

// Get all products
export const getProductsApi = (params) => {
  return api.get("/products", { params });
};

// Get single product
export const getProductByIdApi = (id) => {
  return api.get(`/products/${id}`);
};

// Add product (seller)
export const addProductApi = (formData) => {
  return api.post("/product/addProduct", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
