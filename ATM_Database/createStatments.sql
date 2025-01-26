-- Create the cardHolderDetails table
CREATE TABLE userAccount (
    HolderID INT PRIMARY KEY AUTO_INCREMENT,
    Surname VARCHAR(45),
    Forename VARCHAR(45),
    Address VARCHAR(45),
    PhoneNumber VARCHAR(15),
    Gender VARCHAR(20),
    Postcode VARCHAR(7),
    Balance DECIMAL(10, 2)
);

-- Create the cardDetails table
CREATE TABLE cardDetails (
    PAN BIGINT,
    PIN INT,
    CVV INT,
    Expires DATE,
    HolderID INT,
    Bank VARCHAR(45),
    Network ENUM('VISA', 'MasterCard'), 
    FOREIGN KEY (HolderID) REFERENCES userAccount(HolderID)
);

-- Create the ATM_Details table
CREATE TABLE ATM_Details (
    ATM_ID INT PRIMARY KEY AUTO_INCREMENT,
    Address VARCHAR(45),
    Postcode VARCHAR(7),
    ModelNumber VARCHAR(45)
);

CREATE INDEX idx_CardDetails_PAN ON cardDetails (PAN);
CREATE INDEX idx_CardDetails_HolderID  ON cardDetails (HolderID);
CREATE INDEX idx_UserAccount_HolderID  ON userAccount (HolderID);

