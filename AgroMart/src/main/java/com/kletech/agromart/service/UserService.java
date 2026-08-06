package com.kletech.agromart.service;

import com.kletech.agromart.model.ApprovalStatus;
import com.kletech.agromart.model.User;
import com.kletech.agromart.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // CREATE
    public User createUser(User user) {

        // Every newly registered user needs admin approval
        user.setApprovalStatus(ApprovalStatus.PENDING);

        return userRepository.save(user);
    }

    // READ ALL
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // READ BY ID
    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElse(null);
    }

    // UPDATE
    public User updateUser(Long id, User updatedUser) {

        User existingUser = userRepository.findById(id)
                .orElse(null);

        if (existingUser == null) {
            return null;
        }

        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setPassword(updatedUser.getPassword());
        existingUser.setRole(updatedUser.getRole());

        return userRepository.save(existingUser);
    }

    // DELETE
    public boolean deleteUser(Long id) {

        if (!userRepository.existsById(id)) {
            return false;
        }

        userRepository.deleteById(id);

        return true;
    }
}