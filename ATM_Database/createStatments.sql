-- Create the cardHolderDetails table
CREATE TABLE cardHolderDetails (
    HolderID INT PRIMARY KEY AUTO_INCREMENT,
    Surname VARCHAR(45),
    Forename VARCHAR(45),
    Address VARCHAR(45),
    PhoneNumber VARCHAR(15),
    Gender VARCHAR(20),
    Postcode VARCHAR(7)
);

-- Create the accountDetails table
CREATE TABLE accountDetails (
    AccountAmount FLOAT,
    HolderID INT,
    FOREIGN KEY (HolderID) REFERENCES cardHolderDetails(HolderID)
);

-- Create the cardDetails table
CREATE TABLE cardDetails (
    PAN BIGINT,
    PIN INT,
    CVV INT,
    Expires DATE,
    HolderID INT,
    Bank VARCHAR(45),
    Network ENUM('VISA', 'MasterCard', 'AmEx'), -- Replace with actual options for the Network
    FOREIGN KEY (HolderID) REFERENCES cardHolderDetails(HolderID)
);

-- Create the ATM_Details table
CREATE TABLE ATM_Details (
    ATM_ID INT PRIMARY KEY AUTO_INCREMENT,
    Address VARCHAR(45),
    Postcode VARCHAR(7),
    ModelNumber VARCHAR(45)
);
