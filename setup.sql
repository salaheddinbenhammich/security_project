-- =====================================================
-- IT Incident Management System - Full Initial Setup
-- Includes users, roles, and sample incidents
-- =====================================================

USE incident_db;

-- =========================
-- CREATE ADMIN USER
-- =========================
INSERT INTO users (email, password, full_name, phone, active, created_at)
VALUES (
    'myadmin@example.com',
    '$2a$10$PbqKPbHBM97hUzrwO5UwQeYTi83xWWFvFMyNFSQOOKKnCxsnc.a6S',
    'My Admin User',
    '1234567890',
    true,
    NOW()
);

SET @admin_id = LAST_INSERT_ID();

INSERT INTO user_roles (user_id, role) VALUES (@admin_id, 'ROLE_ADMIN');
INSERT INTO user_roles (user_id, role) VALUES (@admin_id, 'ROLE_USER');
INSERT INTO user_roles (user_id, role) VALUES (@admin_id, 'ROLE_TECHNICIAN');

-- =========================
-- CREATE TECHNICIAN USER
-- =========================
INSERT INTO users (email, password, full_name, phone, active, created_at)
VALUES (
    'tech@example.com',
    '$2a$10$rhtph2iyWSulCg4PbfSeXOocnFRVm1hKHyohliyut/NGIug1UvrEG',
    'Technicien',
    '1234567890',
    true,
    NOW()
);

SET @tech_id = LAST_INSERT_ID();

INSERT INTO user_roles (user_id, role) VALUES (@tech_id, 'ROLE_TECHNICIAN');
INSERT INTO user_roles (user_id, role) VALUES (@tech_id, 'ROLE_USER');

-- =========================
-- CREATE REGULAR USER
-- =========================
INSERT INTO users (email, password, full_name, phone, active, created_at)
VALUES (
    'salaheddin@gmail.com',
    '$2a$10$HTOfu2CP37eh8wr64pObMOjwMh.yLQ6Jk5sDLn7GJPqRKJVjTanXu',
    'Salaheddin BEN HAMMICH',
    '0753821898',
    true,
    NOW()
);

SET @user_id = LAST_INSERT_ID();

INSERT INTO user_roles (user_id, role) VALUES (@user_id, 'ROLE_USER');

-- =========================
-- CREATE SAMPLE INCIDENTS
-- =========================
INSERT INTO incidents (title, description, status, priority, category, created_by_id, created_at)
VALUES 
('Network connectivity issue', 'Unable to connect to company VPN from home office', 'OPEN', 'HIGH', 'NETWORK', @user_id, NOW()),
('Laptop running slow', 'Computer takes 10 minutes to boot up and applications freeze frequently', 'OPEN', 'MEDIUM', 'HARDWARE', @user_id, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('Email not syncing', 'Outlook is not receiving new emails for the past 2 hours', 'IN_PROGRESS', 'HIGH', 'EMAIL', @user_id, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
('Password reset request', 'Need to reset password for CRM system', 'RESOLVED', 'LOW', 'ACCESS', @user_id, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Printer not working', 'Office printer on 3rd floor is offline', 'OPEN', 'MEDIUM', 'HARDWARE', @user_id, DATE_SUB(NOW(), INTERVAL 5 HOUR));

-- =========================
-- ASSIGN INCIDENTS TO TECHNICIAN
-- =========================
UPDATE incidents SET assigned_to_id = @tech_id, status = 'IN_PROGRESS' 
WHERE title = 'Email not syncing';

UPDATE incidents 
SET assigned_to_id = @tech_id, status = 'RESOLVED', resolved_at = NOW(), resolution = 'Password has been reset successfully. Please check your email for new credentials.' 
WHERE title = 'Password reset request';

-- =========================
-- VERIFICATION
-- =========================
SELECT u.email, u.full_name, ur.role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email IN (
    'myadmin@example.com',
    'tech@example.com',
    'salaheddin@gmail.com'
)
ORDER BY u.email, ur.role;

SELECT id, title, status, priority, category, assigned_to_id
FROM incidents;

SELECT 'Setup completed successfully ✅' AS status;
