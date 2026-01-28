-- IT Incident Management System - Initial Setup
-- Run this script after starting the Spring Boot application for the first time

USE incident_db;

-- Create admin user
-- Email: admin@admin.com
-- Password: admin123 (BCrypt encoded)
INSERT INTO users (email, password, full_name, phone, active, created_at) 
VALUES ('admin@admin.com', '$2a$10$ZwHPwB5S7QLQC7QN9UPUW.W8G3xQBhJxzZ3.kkrQXrZvK8h2uUH9a', 'Admin User', '1234567890', true, NOW());

-- Get the admin user ID
SET @admin_id = LAST_INSERT_ID();

-- Assign all roles to admin
INSERT INTO user_roles (user_id, role) VALUES (@admin_id, 'ROLE_ADMIN');
INSERT INTO user_roles (user_id, role) VALUES (@admin_id, 'ROLE_USER');
INSERT INTO user_roles (user_id, role) VALUES (@admin_id, 'ROLE_TECHNICIAN');

-- Create sample technician
-- Email: tech@tech.com
-- Password: tech123
INSERT INTO users (email, password, full_name, phone, active, created_at) 
VALUES ('tech@tech.com', '$2a$10$8K1p/a0dL2LfNhsVPvtLWOZ.KxBLwVzGVLkkFwVQlMh4hqkk.KhXC', 'Technician User', '0987654321', true, NOW());

SET @tech_id = LAST_INSERT_ID();

INSERT INTO user_roles (user_id, role) VALUES (@tech_id, 'ROLE_TECHNICIAN');
INSERT INTO user_roles (user_id, role) VALUES (@tech_id, 'ROLE_USER');

-- Create sample regular user
-- Email: user@user.com
-- Password: user123
INSERT INTO users (email, password, full_name, phone, active, created_at) 
VALUES ('user@user.com', '$2a$10$rQj8j6YkLlQp8FhQkL9RfuN9P2nVxJK8vBWmKQqnLZOVgZxEoKHHW', 'Regular User', '5555555555', true, NOW());

SET @user_id = LAST_INSERT_ID();

INSERT INTO user_roles (user_id, role) VALUES (@user_id, 'ROLE_USER');

-- Create some sample incidents
INSERT INTO incidents (title, description, status, priority, category, created_by_id, created_at)
VALUES 
('Network connectivity issue', 'Unable to connect to company VPN from home office', 'OPEN', 'HIGH', 'NETWORK', @user_id, NOW()),
('Laptop running slow', 'Computer takes 10 minutes to boot up and applications freeze frequently', 'OPEN', 'MEDIUM', 'HARDWARE', @user_id, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('Email not syncing', 'Outlook is not receiving new emails for the past 2 hours', 'IN_PROGRESS', 'HIGH', 'EMAIL', @user_id, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
('Password reset request', 'Need to reset password for CRM system', 'RESOLVED', 'LOW', 'ACCESS', @user_id, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Printer not working', 'Office printer on 3rd floor is offline', 'OPEN', 'MEDIUM', 'HARDWARE', @user_id, DATE_SUB(NOW(), INTERVAL 5 HOUR));

-- Assign some incidents to technician
UPDATE incidents SET assigned_to_id = @tech_id, status = 'IN_PROGRESS' WHERE title = 'Email not syncing';
UPDATE incidents SET assigned_to_id = @tech_id, status = 'RESOLVED', resolved_at = NOW(), resolution = 'Password has been reset successfully. Please check your email for new credentials.' WHERE title = 'Password reset request';

-- Display created accounts
SELECT 'Created Users:' as '';
SELECT id, email, full_name, active FROM users;

SELECT '' as '';
SELECT 'User Roles:' as '';
SELECT u.email, ur.role 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
ORDER BY u.email, ur.role;

SELECT '' as '';
SELECT 'Sample Incidents:' as '';
SELECT id, title, status, priority, category FROM incidents;

SELECT '' as '';
SELECT 'Setup completed successfully!' as '';
SELECT '' as '';
SELECT 'Login Credentials:' as '';
SELECT 'Admin - Email: admin@admin.com, Password: admin123' as '';
SELECT 'Technician - Email: tech@tech.com, Password: tech123' as '';
SELECT 'User - Email: user@user.com, Password: user123' as '';