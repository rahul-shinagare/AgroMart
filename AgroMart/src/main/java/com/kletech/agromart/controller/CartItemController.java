package com.kletech.agromart.controller;

import com.kletech.agromart.model.CartItem;
import com.kletech.agromart.service.CartItemService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart-items")
@CrossOrigin(origins = "*")
public class CartItemController {

    @Autowired
    private CartItemService cartItemService;


    // CREATE
    @PostMapping
    public ResponseEntity<CartItem> createCartItem(
            @RequestBody CartItem cartItem) {

        CartItem createdCartItem =
                cartItemService.createCartItem(cartItem);

        return ResponseEntity.ok(createdCartItem);
    }


    // READ ALL
    @GetMapping
    public ResponseEntity<List<CartItem>> getAllCartItems() {

        return ResponseEntity.ok(
                cartItemService.getAllCartItems());
    }


    // READ BY ID
    @GetMapping("/{id}")
    public ResponseEntity<CartItem> getCartItemById(
            @PathVariable Long id) {

        CartItem cartItem =
                cartItemService.getCartItemById(id);

        if (cartItem == null) {

            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(cartItem);
    }


    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<CartItem> updateCartItem(
            @PathVariable Long id,
            @RequestBody CartItem cartItemDetails) {

        CartItem updatedCartItem =
                cartItemService.updateCartItem(
                        id,
                        cartItemDetails);

        if (updatedCartItem == null) {

            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedCartItem);
    }


    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCartItem(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                cartItemService.deleteCartItem(id));
    }
}