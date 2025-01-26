/*INSERT INTO cardHolderDetails (Surname, Forename, Address, PhoneNumber, Gender, Postcode)
VALUES ('Doe', 'John', '123 Main St', '555-123-4567', 'Male', 'AB12CD');

INSERT INTO accountDetails (AccountAmount, HolderID)
VALUES (1000.50, 1); 

INSERT INTO cardDetails (PAN, PIN, CVV, Expires, HolderID, Bank, Network)
VALUES (123456789123456, 1234, 567, '2025-12-31', 1, 'Bank of Example', 'VISA');

INSERT INTO ATM_Details (Address, Postcode, ModelNumber)
VALUES ('456 Elm St', 'CD34EF', 'ATM-Model-XYZ');

-- Insert records into accountDetails
INSERT INTO accountDetails (AccountAmount, HolderID)
VALUES 
(1000.50, 1),
(2000.75, 2),
(3500.40, 3),
(1500.20, 4),
(5000.00, 5),
(1200.90, 6),
(2200.60, 7),
(2800.00, 8),
(4500.30, 9),
(3000.15, 10);
*/ 


-- Insert records into cardHolderDetails
INSERT INTO userAccount (Surname, Forename, Address, PhoneNumber, Gender, Postcode, Balance)
VALUES 
('Doe', 'John', '123 Main St', '555-123-4567', 'Male', 'AB12CD', 1000.50),
('Smith', 'Alice', '789 Oak Rd', '555-987-6543', 'Female', 'EF56GH', 2000.75),
('Johnson', 'Chris', '101 Pine Ave', '555-111-2222', 'Male', 'GH78IJ', 3500.40),
('Brown', 'Emily', '202 Birch Blvd', '555-222-3333', 'Female', 'IJ90KL', 1500.20),
('Davis', 'Michael', '303 Cedar Ln', '555-333-4444', 'Male', 'KL12MN', 5000.00),
('Miller', 'Sarah', '404 Maple Dr', '555-444-5555', 'Female', 'MN23OP', 1200.90),
('Wilson', 'David', '505 Walnut Ct', '555-555-6666', 'Male', 'OP34QR', 2800.00),
('Moore', 'Laura', '606 Redwood St', '555-666-7777', 'Female', 'QR45ST', 4500.30),
('Taylor', 'James', '707 Willow Dr', '555-777-8888', 'Male', 'ST56UV', 230.15),
('Anderson', 'Sophia', '808 Ash Ln', '555-888-9999', 'Female', 'UV67WX', 9100.15);



-- Insert records into cardDetails
INSERT INTO cardDetails (PAN, PIN, CVV, Expires, HolderID, Bank, Network)
VALUES 
(123456789123456, 1234, 567, '2025-12-31', 1, 'Bank of Example', 'VISA'),
(234567890123456, 2345, 678, '2026-01-31', 2, 'Global Bank', 'MasterCard'),
(345678901234567, 3456, 789, '2027-02-28', 3, 'First National Bank', 'VISA'),
(456789012345678, 4567, 890, '2028-03-31', 4, 'Secure Trust Bank', 'VISA'),
(567890123456789, 5678, 901, '2029-04-30', 5, 'Union Bank', 'MasterCard'),
(678901234567890, 6789, 012, '2030-05-31', 6, 'Community Savings', 'VISA'),
(789012345678901, 7890, 123, '2031-06-30', 7, 'Metro Bank', 'VISA'),
(890123456789012, 8901, 234, '2032-07-31', 8, 'Premier Financial', 'MasterCard'),
(901234567890123, 9012, 345, '2033-08-31', 9, 'East Coast Bank', 'VISA'),
(123456789012345, 1234, 456, '2024-09-30', 10, 'Westfield Bank', 'VISA');

-- Insert records into ATM_Details
INSERT INTO ATM_Details (Address, Postcode, ModelNumber)
VALUES 
('456 Elm St', 'CD34EF', 'ATM-Model-XYZ'),
('789 Pine Ave', 'GH56IJ', 'ATM-Model-ABC'),
('101 Oak Blvd', 'IJ67KL', 'ATM-Model-DEF'),
('202 Birch Dr', 'KL78MN', 'ATM-Model-GHI'),
('303 Maple Ln', 'MN89OP', 'ATM-Model-JKL'),
('404 Redwood St', 'OP90QR', 'ATM-Model-MNO'),
('505 Willow Ct', 'QR01ST', 'ATM-Model-PQR'),
('606 Cedar Blvd', 'ST12UV', 'ATM-Model-RST'),
('707 Ash Ln', 'UV23WX', 'ATM-Model-TUV'),
('808 Elm Rd', 'WX34YZ', 'ATM-Model-UVW');
