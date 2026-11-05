CREATE DATABASE IF NOT EXISTS apartment_visitor_db;
USE apartment_visitor_db;

DROP TABLE IF EXISTS visits;
DROP TABLE IF EXISTS visitors;
DROP TABLE IF EXISTS residents;

CREATE TABLE residents (
    resident_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    flat_no VARCHAR(20) NOT NULL UNIQUE,
    phone VARCHAR(15),
    email VARCHAR(100)
);

CREATE TABLE visitors (
    visitor_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    vehicle_no VARCHAR(30),
    purpose VARCHAR(150)
);

CREATE TABLE visits (
    visit_id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    visitor_id INT NOT NULL,
    entry_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    exit_time DATETIME NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'IN',

    FOREIGN KEY (resident_id)
        REFERENCES residents(resident_id),

    FOREIGN KEY (visitor_id)
        REFERENCES visitors(visitor_id)
);

-- RESIDENT DATA (10)

INSERT INTO residents
(name, flat_no, phone, email)
VALUES
('Arjun Kumar', 'A-101', '9876543210', 'arjun@gmail.com'),
('Priya Sharma', 'A-102', '9876543211', 'priya@gmail.com'),
('Rahul Reddy', 'A-103', '9876543212', 'rahul@gmail.com'),
('Sneha Rao', 'A-104', '9876543213', 'sneha@gmail.com'),
('Kiran Kumar', 'A-105', '9876543214', 'kiran@gmail.com'),
('Ananya Singh', 'B-201', '9876543215', 'ananya@gmail.com'),
('Vijay Kumar', 'B-202', '9876543216', 'vijay@gmail.com'),
('Divya Reddy', 'B-203', '9876543217', 'divya@gmail.com'),
('Suresh Babu', 'B-204', '9876543218', 'suresh@gmail.com'),
('Meena Devi', 'B-205', '9876543219', 'meena@gmail.com');

-- VISITOR DATA (12)

INSERT INTO visitors
(name, phone, vehicle_no, purpose)
VALUES
('Ramesh', '9000000001', 'AP21AB1234', 'Family Visit'),
('Sanjay', '9000000002', 'AP21CD2345', 'Delivery'),
('Manoj', '9000000003', 'AP21EF3456', 'Personal Visit'),
('Deepak', '9000000004', 'AP21GH4567', 'Maintenance'),
('Pavan', '9000000005', 'AP21IJ5678', 'Friend Visit'),
('Naveen', '9000000006', 'AP21KL6789', 'Parcel Delivery'),
('Ajay', '9000000007', 'AP21MN7890', 'Guest Visit'),
('Karthik', '9000000008', 'AP21OP8901', 'Electrician'),
('Suresh', '9000000009', 'AP21QR9012', 'Family Visit'),
('Varun', '9000000010', 'AP21ST0123', 'Personal Visit'),
('Mohan', '9000000011', 'AP21UV1234', 'Water Service'),
('Ravi', '9000000012', 'AP21WX2345', 'Guest Visit');

-- VISIT DATA (12)
-- 7 visitors currently IN
-- 5 visitors OUT

INSERT INTO visits
(resident_id, visitor_id, entry_time, exit_time, status)
VALUES
(1, 1, NOW() - INTERVAL 20 MINUTE, NULL, 'IN'),
(2, 2, NOW() - INTERVAL 15 MINUTE, NULL, 'IN'),
(3, 3, NOW() - INTERVAL 30 MINUTE, NULL, 'IN'),
(4, 4, NOW() - INTERVAL 40 MINUTE, NULL, 'IN'),
(5, 5, NOW() - INTERVAL 10 MINUTE, NULL, 'IN'),
(6, 6, NOW() - INTERVAL 25 MINUTE, NULL, 'IN'),
(7, 7, NOW() - INTERVAL 35 MINUTE, NULL, 'IN'),
(8, 8, NOW() - INTERVAL 2 HOUR,
 NOW() - INTERVAL 1 HOUR, 'OUT'),
(9, 9, NOW() - INTERVAL 3 HOUR,
 NOW() - INTERVAL 2 HOUR, 'OUT'),
(10, 10, NOW() - INTERVAL 4 HOUR,
 NOW() - INTERVAL 3 HOUR, 'OUT'),
(1, 11, NOW() - INTERVAL 5 HOUR,
 NOW() - INTERVAL 4 HOUR, 'OUT'),
(2, 12, NOW() - INTERVAL 6 HOUR,
 NOW() - INTERVAL 5 HOUR, 'OUT');

-- VERIFY DATA

SELECT * FROM residents;
SELECT * FROM visitors;
SELECT * FROM visits;

SELECT COUNT(*) AS total_residents FROM residents;
SELECT COUNT(*) AS total_visitors FROM visitors;
SELECT COUNT(*) AS total_visits FROM visits;

SELECT COUNT(*) AS active_visitors
FROM visits
WHERE status = 'IN';