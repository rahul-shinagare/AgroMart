package com.kletech.agromart.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.kletech.agromart.model.Order;
import com.kletech.agromart.service.OrderService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // ==========================
    // CREATE ORDER
    // ==========================
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {

        return ResponseEntity.ok(orderService.createOrder(order));
    }

    // ==========================
    // GET ALL ORDERS
    // ==========================
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {

        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // ==========================
    // GET ORDER BY ID
    // ==========================
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {

        Order order = orderService.getOrderById(id);

        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(order);
    }

    // ==========================
    // UPDATE ORDER
    // ==========================
    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable Long id,
                                             @RequestBody Order order) {

        Order updatedOrder = orderService.updateOrder(id, order);

        if (updatedOrder == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedOrder);
    }

    // ==========================
    // DELETE ORDER
    // ==========================
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteOrder(@PathVariable Long id) {

        return ResponseEntity.ok(orderService.deleteOrder(id));
    }

    // =====================================================
    // CHECKOUT API
    // =====================================================
    @PostMapping("/checkout/{buyerId}")
    public ResponseEntity<Order> checkout(@PathVariable Long buyerId) {

        Order order = orderService.checkout(buyerId);

        return ResponseEntity.ok(order);
    }

}