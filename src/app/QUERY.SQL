-- user table
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) UNIQUE NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    Salt NVARCHAR(255) NOT NULL,
    Role NVARCHAR(50) DEFAULT 'User',
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- customer table
CREATE TABLE Customers (
    CustomerID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerName NVARCHAR(100) NOT NULL,
    Contact NVARCHAR(50) NOT NULL,
    BookingDate DATETIME NOT NULL,
    Email NVARCHAR(100) UNIQUE NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);


-- BOOKING TABLE
CREATE TABLE Bookings (
    BookingID INT IDENTITY(1,1) PRIMARY KEY,
    TripType NVARCHAR(50) NOT NULL,  -- e.g., 'One-way', 'Round-trip'
    Origin NVARCHAR(100) NOT NULL,
    Destination NVARCHAR(100) NOT NULL,
    Passengers INT NOT NULL CHECK (Passengers > 0),  -- Ensures at least 1 passenger
    PNR NVARCHAR(50) UNIQUE NOT NULL,  -- Unique Passenger Name Record
    Amount DECIMAL(10,2) NOT NULL CHECK (Amount >= 0),  -- Ensures valid price
    BookingDate DATETIME DEFAULT GETDATE(),  -- Auto timestamp for booking
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- COMPANY PROFILE
CREATE TABLE CompanyProfile (
    CompanyID INT IDENTITY(1,1) PRIMARY KEY,
    CompanyName NVARCHAR(255) NOT NULL,
    RegNo NVARCHAR(100) UNIQUE NOT NULL,  -- Registration number should be unique
    Address NVARCHAR(255) NOT NULL,
    City NVARCHAR(100) NOT NULL,
    District NVARCHAR(100) NULL,  -- Some countries may not have districts
    Country NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) UNIQUE NOT NULL,  -- Ensures unique company email
    Phone NVARCHAR(20) NOT NULL,
    IATANo NVARCHAR(50) UNIQUE NULL  -- Some companies may not have IATA number
);

-- BOOKLIMITS
CREATE TABLE Booking_Limits (
    ID INT IDENTITY(1,1) PRIMARY KEY,  -- Unique identifier
    Limit_Type VARCHAR(50) NOT NULL,   -- Type of limit (e.g., Airline, Destination, Fare, etc.)
    Restriction_Type VARCHAR(50) NOT NULL, -- Whether it's "Allowed" or "Blocked"
	  Applies_To_Destination VARCHAR(255) NOT NULL,  -- Applies to which destination
    Applies_To_Airline VARCHAR(255) NOT NULL,      -- Applies to which airline
    Price_Range_From DECIMAL(18, 2) NULL, -- Minimum price for markup application (NULL means no minimum)
    Price_Range_To DECIMAL(18, 2) NULL,   -- Maximum price for markup application (NULL means no maximum)
    Effective_From DATE NOT NULL,      -- When the restriction starts
    Effective_To DATE NULL,            -- When the restriction ends (NULL = Permanent)
    Created_At DATETIME DEFAULT GETDATE(),  -- Timestamp when the record is created
);

-- Promotion

	CREATE TABLE Promotions (
    ID INT IDENTITY(1,1) PRIMARY KEY,  -- Auto-incremented unique ID
    Promo_Name VARCHAR(100) NOT NULL,   -- Name of the promotion (e.g., Summer Sale, New Year Discount)
    Promo_Type VARCHAR(50) NOT NULL,    -- Type of promotion (e.g., Discount, Cashback, Special Fare)
    Value VARCHAR(255) NOT NULL,        -- Promotion value (e.g., 10% off, $50 cashback, etc.)
	  Amount DECIMAL(18, 2) NOT NULL,      -- Promotion amount (e.g., 10.00, 50.00, etc.)
	  Applies_To_Destination VARCHAR(255) NOT NULL DEFAULT '',
    Applies_To_Airline VARCHAR(255) NOT NULL DEFAULT '',
    Price_Range_From DECIMAL(18, 2) NULL,
    Price_Range_To DECIMAL(18, 2) NULL,
    Effective_From DATE NOT NULL,       -- Start date of the promotion
    Effective_To DATE NULL,             -- NULL means the promotion is ongoing
    Created_At DATETIME DEFAULT GETDATE(),  -- Auto-set when record is inserted
    Updated_At DATETIME NULL,               -- Will be updated via a trigger
);



-- MARKUP
CREATE TABLE Markups (
    ID INT IDENTITY(1,1) PRIMARY KEY,  -- Auto-incremented unique ID
    Markup_Name VARCHAR(100) NOT NULL,  -- Name of the markup (e.g., Tax, Base Markup)
    Markup_Type VARCHAR(50) NOT NULL,   -- Type of markup (e.g., Tax, Base)
    Value DECIMAL(18, 2) NOT NULL,      -- Markup value (e.g., percentage or fixed rate)
    Applies_To_Destination VARCHAR(255) NOT NULL,  -- Applies to which destination
    Applies_To_Airline VARCHAR(255) NOT NULL,      -- Applies to which airline
    Price_Range_From DECIMAL(18, 2) NULL, -- Minimum price for markup application (NULL means no minimum)
    Price_Range_To DECIMAL(18, 2) NULL,   -- Maximum price for markup application (NULL means no maximum)
    Effective_From DATE NOT NULL,        -- Start date of the markup
    Effective_To DATE NULL,              -- NULL means the markup is ongoing
    Created_At DATETIME DEFAULT GETDATE(),  -- Auto-set when record is inserted
    Updated_At DATETIME NULL             -- Will be updated via a trigger
);

CREATE TABLE UserPreferences (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ContentType NVARCHAR(3) CHECK (ContentType IN ('NDC', 'GDS')) NOT NULL,
    UpdatedAt DATETIME DEFAULT GETDATE()
);


