package com.kletech.agromart.repository;

import com.kletech.agromart.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository
        extends JpaRepository<Product, Long> {

}