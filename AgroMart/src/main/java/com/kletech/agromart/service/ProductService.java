package com.kletech.agromart.service;

import com.kletech.agromart.model.Product;
import com.kletech.agromart.repository.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;


    // CREATE PRODUCT
    public Product createProduct(Product product) {

        return productRepository.save(product);
    }


    // GET ALL PRODUCTS
    public List<Product> getAllProducts() {

        return productRepository.findAll();
    }


    // GET PRODUCT BY ID
    public Product getProductById(Long id) {

        Optional<Product> optionalProduct =
                productRepository.findById(id);

        if (optionalProduct.isPresent()) {

            return optionalProduct.get();
        }

        return null;
    }


    // UPDATE PRODUCT
    public Product updateProduct(
            Long id,
            Product productDetails) {

        Optional<Product> optionalProduct =
                productRepository.findById(id);

        if (optionalProduct.isPresent()) {

            Product existingProduct =
                    optionalProduct.get();

            existingProduct.setCropName(
                    productDetails.getCropName());

            existingProduct.setCategory(
                    productDetails.getCategory());

            existingProduct.setDescription(
                    productDetails.getDescription());

            existingProduct.setPrice(
                    productDetails.getPrice());

            existingProduct.setStockQty(
                    productDetails.getStockQty());

            return productRepository.save(
                    existingProduct);
        }

        return null;
    }


    // DELETE PRODUCT
    public String deleteProduct(Long id) {

        if (productRepository.existsById(id)) {

            productRepository.deleteById(id);

            return "Product deleted successfully";
        }

        return "Product not found";
    }
}