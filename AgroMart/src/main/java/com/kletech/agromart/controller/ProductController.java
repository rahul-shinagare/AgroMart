package com.kletech.agromart.controller;

import com.kletech.agromart.model.Product;
import com.kletech.agromart.service.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;


    // CREATE
    @PostMapping
    public ResponseEntity<Product> createProduct(
            @RequestBody Product product) {

        Product createdProduct =
                productService.createProduct(product);

        return ResponseEntity.ok(createdProduct);
    }


    // READ ALL
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {

        return ResponseEntity.ok(
                productService.getAllProducts());
    }


    // READ BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(
            @PathVariable Long id) {

        Product product =
                productService.getProductById(id);

        if (product == null) {

            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(product);
    }


    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product productDetails) {

        Product updatedProduct =
                productService.updateProduct(
                        id,
                        productDetails);

        if (updatedProduct == null) {

            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedProduct);
    }


    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                productService.deleteProduct(id));
    }
}