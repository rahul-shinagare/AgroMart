package com.kletech.agromart.repository;

import com.kletech.agromart.model.ApprovalStatus;
import com.kletech.agromart.model.User;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmail(String email);
    List<User> findByApprovalStatus(ApprovalStatus approvalStatus);
}