package com.it_incidents_backend.service;


import com.it_incidents_backend.model.Role;
import com.it_incidents_backend.model.User;
import com.it_incidents_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public User updateUserRoles(Long id, Set<Role> roles) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setRoles(roles);
        return userRepository.save(user);
    }
    
    public User toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setActive(!user.getActive());
        return userRepository.save(user);
    }
    
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    public List<User> getTechnicians() {
        return userRepository.findAll().stream()
            .filter(user -> user.getRoles().contains(Role.ROLE_TECHNICIAN) || 
                          user.getRoles().contains(Role.ROLE_ADMIN))
            .toList();
    }
}
