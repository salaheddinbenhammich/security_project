-- =====================================================
-- IT Incident Management System - Initial Setup (Custom)
-- =====================================================

USE incident_db;


-- =========================
-- CREATE ADMIN USER
-- =========================
-- Email: myadmin@example.com

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
-- Email: tech@example.com

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
-- Email: salaheddin@gmail.com

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

SELECT 'Setup completed successfully ✅' AS status;
