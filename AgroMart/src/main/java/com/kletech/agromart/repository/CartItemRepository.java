package com.kletech.agromart.repository;

import com.kletech.agromart.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByBuyerUserId(Long buyerId);

    void deleteByBuyerUserId(Long buyerId);

}
