package com.kletech.agromart.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kletech.agromart.model.CartItem;
import com.kletech.agromart.model.Order;
import com.kletech.agromart.model.OrderItem;
import com.kletech.agromart.model.Product;
import com.kletech.agromart.model.User;
import com.kletech.agromart.repository.CartItemRepository;
import com.kletech.agromart.repository.OrderItemRepository;
import com.kletech.agromart.repository.OrderRepository;
import com.kletech.agromart.repository.ProductRepository;
import com.kletech.agromart.repository.UserRepository;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    // ==========================
    // CREATE ORDER
    // ==========================
    public Order createOrder(Order order) {
        return orderRepository.save(order);
    }

    // ==========================
    // GET ALL ORDERS
    // ==========================
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // ==========================
    // GET ORDER BY ID
    // ==========================
    public Order getOrderById(Long id) {

        Optional<Order> order = orderRepository.findById(id);

        if (order.isPresent()) {
            return order.get();
        }

        return null;
    }

    // ==========================
    // UPDATE ORDER
    // ==========================
    public Order updateOrder(Long id, Order orderDetails) {

        Optional<Order> order = orderRepository.findById(id);

        if (order.isPresent()) {

            Order existingOrder = order.get();

            existingOrder.setBuyer(orderDetails.getBuyer());
            existingOrder.setOrderDate(orderDetails.getOrderDate());
            existingOrder.setTotalAmount(orderDetails.getTotalAmount());
            existingOrder.setStatus(orderDetails.getStatus());

            return orderRepository.save(existingOrder);
        }

        return null;
    }

    // ==========================
    // DELETE ORDER
    // ==========================
    public String deleteOrder(Long id) {

        if (orderRepository.existsById(id)) {

            orderRepository.deleteById(id);

            return "Order Deleted Successfully";
        }

        return "Order Not Found";
    }

    // =====================================================
    // CHECKOUT TRANSACTION
    // =====================================================

    @Transactional
    public Order checkout(Long buyerId) {

        // STEP 1 : Find Buyer
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer Not Found"));

        // STEP 2 : Read Buyer's Cart
        List<CartItem> cartItems =
                cartItemRepository.findByBuyerUserId(buyerId);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is Empty");
        }

        // STEP 3 : Create Order
        Order order = new Order();
        order.setBuyer(buyer);
        order.setTotalAmount(0.0);

        order = orderRepository.save(order);

        double totalAmount = 0;

        // STEP 4 : Process Every Cart Item
        for (CartItem cart : cartItems) {

            Product product = cart.getProduct();

            // STEP 5 : Check Stock
            if (product.getStockQty() < cart.getQuantity()) {

                throw new RuntimeException(
                        "Insufficient Stock for : "
                                + product.getCropName());

            }

            // STEP 6 : Reduce Stock
            product.setStockQty(
                    product.getStockQty() - cart.getQuantity());

            productRepository.save(product);

            // STEP 7 : Create Order Item
            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setOrderQty(cart.getQuantity());
            orderItem.setUnitPrice(product.getPrice());

            orderItemRepository.save(orderItem);

            // STEP 8 : Calculate Total Amount
            totalAmount +=
                    product.getPrice() * cart.getQuantity();

        }

        // STEP 9 : Update Order Total
        order.setTotalAmount(totalAmount);

        orderRepository.save(order);

        // STEP 10 : Clear Cart
        cartItemRepository.deleteByBuyerUserId(buyerId);

        return order;

    }

}