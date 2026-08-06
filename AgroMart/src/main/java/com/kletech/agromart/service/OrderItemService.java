package com.kletech.agromart.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kletech.agromart.model.OrderItem;
import com.kletech.agromart.repository.OrderItemRepository;

@Service
public class OrderItemService {

    @Autowired
    private OrderItemRepository orderItemRepository;

    // CREATE
    public OrderItem createOrderItem(OrderItem orderItem){

        return orderItemRepository.save(orderItem);
    }

    // READ ALL
    public List<OrderItem> getAllOrderItems(){

        return orderItemRepository.findAll();
    }

    // READ BY ID
    public OrderItem getOrderItem(Long id){

        Optional<OrderItem> item = orderItemRepository.findById(id);

        if(item.isPresent()){

            return item.get();
        }

        return null;
    }

    // UPDATE
    public OrderItem updateOrderItem(Long id, OrderItem orderItem){

        Optional<OrderItem> item = orderItemRepository.findById(id);

        if(item.isPresent()){

            OrderItem existingItem = item.get();

            existingItem.setOrder(orderItem.getOrder());
            existingItem.setProduct(orderItem.getProduct());
            existingItem.setOrderQty(orderItem.getOrderQty());
            existingItem.setUnitPrice(orderItem.getUnitPrice());

            return orderItemRepository.save(existingItem);
        }

        return null;
    }

    // DELETE
    public String deleteOrderItem(Long id){

        if(orderItemRepository.existsById(id)){

            orderItemRepository.deleteById(id);

            return "Order Item Deleted";
        }

        return "Order Item Not Found";
    }

}