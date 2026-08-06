package com.kletech.agromart.service;

import com.kletech.agromart.model.CartItem;
import com.kletech.agromart.repository.CartItemRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartItemService {

    @Autowired
    private CartItemRepository cartItemRepository;


    // CREATE
    public CartItem createCartItem(CartItem cartItem) {

        return cartItemRepository.save(cartItem);
    }


    // READ ALL
    public List<CartItem> getAllCartItems() {

        return cartItemRepository.findAll();
    }


    // READ BY ID
    public CartItem getCartItemById(Long id) {

        Optional<CartItem> optionalCartItem =
                cartItemRepository.findById(id);

        if (optionalCartItem.isPresent()) {

            return optionalCartItem.get();
        }

        return null;
    }


    // UPDATE
    public CartItem updateCartItem(
            Long id,
            CartItem cartItemDetails) {

        Optional<CartItem> optionalCartItem =
                cartItemRepository.findById(id);

        if (optionalCartItem.isPresent()) {

            CartItem existingCartItem =
                    optionalCartItem.get();

            existingCartItem.setBuyer(
                    cartItemDetails.getBuyer());

            existingCartItem.setProduct(
                    cartItemDetails.getProduct());

            existingCartItem.setQuantity(
                    cartItemDetails.getQuantity());

            return cartItemRepository.save(
                    existingCartItem);
        }

        return null;
    }


    // DELETE
    public String deleteCartItem(Long id) {

        if (cartItemRepository.existsById(id)) {

            cartItemRepository.deleteById(id);

            return "Cart item deleted successfully";
        }

        return "Cart item not found";
    }
}