package com.kletech.agromart.repository;

import com.kletech.agromart.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository
        extends JpaRepository<Order, Long> {

}