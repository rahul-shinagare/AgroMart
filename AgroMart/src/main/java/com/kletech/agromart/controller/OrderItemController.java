package com.kletech.agromart.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.kletech.agromart.model.OrderItem;
import com.kletech.agromart.service.OrderItemService;

@RestController
@RequestMapping("/api/order-items")
@CrossOrigin(origins="*")
public class OrderItemController {

    @Autowired
    private OrderItemService orderItemService;

    // CREATE
    @PostMapping
    public ResponseEntity<OrderItem> create(@RequestBody OrderItem item){

        return ResponseEntity.ok(orderItemService.createOrderItem(item));
    }

    // GET ALL
    @GetMapping
    public ResponseEntity<List<OrderItem>> getAll(){

        return ResponseEntity.ok(orderItemService.getAllOrderItems());
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<OrderItem> get(@PathVariable Long id){

        OrderItem item = orderItemService.getOrderItem(id);

        if(item==null){

            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(item);
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<OrderItem> update(@PathVariable Long id,
                                            @RequestBody OrderItem item){

        OrderItem updated = orderItemService.updateOrderItem(id,item);

        if(updated==null){

            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updated);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id){

        return ResponseEntity.ok(orderItemService.deleteOrderItem(id));
    }

}