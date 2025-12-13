/**
 * ============================================================================
 * SEED SQL TOPICS SCRIPT
 * ============================================================================
 * 
 * Usage: node seed_sql_topics.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const FullTopicData = require('./models/full_data_of_topics');

const seedSQLTopics = async () => {
    try {
        console.log('\n🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('\n📚 Finding SQL subject...');
        const subject = await Subject.findOne({ name: 'SQL' });

        if (!subject) {
            throw new Error('SQL Subject not found! Run add_sql_subject.js first.');
        }
        console.log(`✅ Found SQL Subject: ${subject._id}`);
        const topicsData = [
            {
                name: "SQL Data Types",
                content: [
                    {
                        "type": "paragraph",
                        "text": "SQL data types define what kind of data a column can store. Choosing the correct data type improves integrity, performance, and indexing."
                    },
                    {
                        "type": "heading",
                        "text": "1. Numeric Data Types"
                    },
                    {
                        "type": "paragraph",
                        "text": "Numeric types store integers, decimals, and floating-point values. They support arithmetic operations important for financial, scientific, and analytical data."
                    },
                    {
                        "type": "heading",
                        "text": "Exact Numeric Datatypes"
                    },
                    {
                        "type": "table",
                        "headers": ["Data Type", "Description", "Range"],
                        "rows": [
                            ["BIGINT", "Large integer numbers", "-9,223,372,036,854,775,808 to 9,223,372,036,854,775,807"],
                            ["INT", "Standard integer values", "-2,147,483,648 to 2,147,483,647"],
                            ["SMALLINT", "Small integers", "-32,768 to 32,767"],
                            ["TINYINT", "Very small integers", "0 to 255"],
                            ["DECIMAL", "Exact fixed-point numbers", "-10^38 + 1 to 10^38 - 1"],
                            ["NUMERIC", "Similar to DECIMAL", "-10^38 + 1 to 10^38 - 1"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE Product_Sales (\n    ProductID INT PRIMARY KEY,\n    Quantity SMALLINT,\n    UnitPrice DECIMAL(10,2),\n    TotalAmount DECIMAL(10,2)\n);"
                    },
                    {
                        "type": "heading",
                        "text": "Approximate Numeric Datatypes"
                    },
                    {
                        "type": "table",
                        "headers": ["Data Type", "Description", "Range"],
                        "rows": [
                            ["FLOAT", "Approximate numeric values", "-1.79E+308 to 1.79E+308"],
                            ["REAL", "Less precision than FLOAT", "-3.40E+38 to 3.40E+38"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE Measurements (\n    SensorID INT,\n    Temperature FLOAT,\n    Humidity REAL\n);"
                    },
                    {
                        "type": "heading",
                        "text": "2. Character and String Data Types"
                    },
                    {
                        "type": "paragraph",
                        "text": "Character data types store text. Choose fixed-length or variable-length based on the nature of your data."
                    },
                    {
                        "type": "table",
                        "headers": ["Data Type", "Description"],
                        "rows": [
                            ["CHAR", "Fixed-length non-Unicode characters (max 8000)"],
                            ["VARCHAR", "Variable-length non-Unicode characters (max 8000)"],
                            ["VARCHAR(MAX)", "Variable-length non-Unicode data (2^31 - 1 chars)"],
                            ["TEXT", "Very large non-Unicode data (2,127,483,647 chars)"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE Employee_Info (\n    EmpID INT PRIMARY KEY,\n    FirstName VARCHAR(50),\n    LastName CHAR(30),\n    Bio TEXT\n);"
                    },
                    {
                        "type": "heading",
                        "text": "Unicode Character String Data Types"
                    },
                    {
                        "type": "table",
                        "headers": ["Data Type", "Description"],
                        "rows": [
                            ["NCHAR", "Fixed-length Unicode characters (max 4000)"],
                            ["NVARCHAR", "Variable-length Unicode characters (max 4000)"],
                            ["NVARCHAR(MAX)", "Variable-length Unicode data (2^31 - 1 chars)"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE International_Users (\n    UserID INT PRIMARY KEY,\n    FullName NVARCHAR(100),\n    Country NCHAR(50)\n);"
                    },
                    {
                        "type": "heading",
                        "text": "3. Date and Time Data Types"
                    },
                    {
                        "type": "paragraph",
                        "text": "Used for timestamps, events, and time-based queries."
                    },
                    {
                        "type": "table",
                        "headers": ["Data Type", "Description", "Storage Size"],
                        "rows": [
                            ["DATE", "Stores year, month, day", "3 bytes"],
                            ["TIME", "Stores hour, minute, second", "3 bytes"],
                            ["DATETIME", "Stores date + time", "8 bytes"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE Orders (\n    OrderID INT PRIMARY KEY,\n    OrderDate DATE,\n    OrderTime TIME,\n    ShippedAt DATETIME\n);"
                    },
                    {
                        "type": "heading",
                        "text": "4. Binary Data Types"
                    },
                    {
                        "type": "paragraph",
                        "text": "Used for images, videos, and files."
                    },
                    {
                        "type": "table",
                        "headers": ["Data Type", "Description", "Max Length"],
                        "rows": [
                            ["BINARY", "Fixed-length binary data", "8000 bytes"],
                            ["VARBINARY", "Variable-length binary data", "8000 bytes"],
                            ["IMAGE", "Stores image/binary data", "2,147,483,647 bytes"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE Product_Images (\n    ImageID INT PRIMARY KEY,\n    ImageName VARCHAR(100),\n    ImageData VARBINARY(MAX)\n);"
                    },
                    {
                        "type": "heading",
                        "text": "5. Boolean Data Type"
                    },
                    {
                        "type": "paragraph",
                        "text": "Stores logical TRUE/FALSE values."
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE User_Status (\n    UserID INT PRIMARY KEY,\n    IsActive BIT,\n    IsVerified BIT\n);"
                    },
                    {
                        "type": "heading",
                        "text": "6. Special Data Types"
                    },
                    {
                        "type": "paragraph",
                        "text": "Special data formats used for advanced operations."
                    },
                    {
                        "type": "list",
                        "items": [
                            "XML – used to store XML structured data.",
                            "GEOMETRY – stores spatial data like points, lines, polygons."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE XML_Records ( RecordID INT PRIMARY KEY, ConfigData XML );\n\nCREATE TABLE Locations ( LocationID INT PRIMARY KEY, Area GEOMETRY );"
                    }
                ]
            },
            {
                name: "SQL Operators",
                content: [
                    {
                        "type": "paragraph",
                        "text": "SQL operators are symbols or keywords used to perform operations like arithmetic, comparisons, logical checks, bitwise operations, and special filtering in SQL queries."
                    },
                    {
                        "type": "heading",
                        "text": "1. Arithmetic Operators"
                    },
                    {
                        "type": "paragraph",
                        "text": "Arithmetic operators perform mathematical operations on numeric data in SQL queries."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- Creating a sample table\nCREATE TABLE Employees (\n    EmpID INT,\n    EmpName VARCHAR(50),\n    Salary INT,\n    Bonus INT\n);\n\n-- Inserting sample data\nINSERT INTO Employees (EmpID, EmpName, Salary, Bonus)\nVALUES\n(1, 'Amit', 40000, 5000),\n(2, 'Neha', 50000, 7000),\n(3, 'Ravi', 30000, 3000);\n\n-- Using Arithmetic Operators\nSELECT\n    EmpName,\n    Salary,\n    Bonus,\n    Salary + Bonus AS Total_Income,\n    Salary - Bonus AS After_Bonus_Deduction,\n    Salary * 0.10 AS Ten_Percent_Salary,\n    Salary / 12 AS Monthly_Salary,\n    Salary % 10000 AS Salary_Remainder\nFROM Employees;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": [
                            "EmpName",
                            "Salary",
                            "Bonus",
                            "Total_Income",
                            "After_Bonus_Deduction",
                            "Ten_Percent_Salary",
                            "Monthly_Salary",
                            "Salary_Remainder"
                        ],
                        "rows": [
                            ["Amit", 40000, 5000, 45000, 35000, 4000, 3333.33, 0],
                            ["Neha", 50000, 7000, 57000, 43000, 5000, 4166.67, 0],
                            ["Ravi", 30000, 3000, 33000, 27000, 3000, 2500, 0]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2. Comparison Operators"
                    },
                    {
                        "type": "paragraph",
                        "text": "Comparison operators compare one expression to another to filter records."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- Create sample table\nCREATE TABLE Students (\n  ID INT,\n  Name VARCHAR(50),\n  Marks INT\n);\n\nINSERT INTO Students VALUES\n(1, 'Amit', 85),\n(2, 'Neha', 70),\n(3, 'Ravi', 55);\n\n-- Comparison example\nSELECT * FROM Students WHERE Marks >= 70;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["ID", "Name", "Marks"],
                        "rows": [
                            [1, "Amit", 85],
                            [2, "Neha", 70]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "3. Logical Operators"
                    },
                    {
                        "type": "paragraph",
                        "text": "Logical operators combine or manipulate conditions in SQL queries."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- Sample Students table with Age\nCREATE TABLE Students (\n  ID INT,\n  Name VARCHAR(50),\n  Marks INT,\n  Age INT\n);\n\nINSERT INTO Students VALUES\n(1, 'Amit', 85, 18),\n(2, 'Neha', 70, 19),\n(3, 'Ravi', 55, 17);\n\n-- Logical Operators\nSELECT * FROM Students WHERE Marks >= 70 AND Age >= 18;\nSELECT * FROM Students WHERE Marks < 60 OR Age < 18;\nSELECT * FROM Students WHERE NOT Marks >= 70;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["ID", "Name", "Marks", "Age"],
                        "rows": [
                            [1, "Amit", 85, 18],
                            [2, "Neha", 70, 19]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "4. Bitwise Operators"
                    },
                    {
                        "type": "paragraph",
                        "text": "Bitwise operators manipulate individual bits of numeric values."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- Permissions table example\nCREATE TABLE Users (\n    UserID INT,\n    UserName VARCHAR(50),\n    Permissions INT\n);\n\n-- Permission flags: Read=1, Write=2, Execute=4\nINSERT INTO Users VALUES\n(1, 'Amit', 1),\n(2, 'Neha', 3),\n(3, 'Ravi', 7);\n\n-- Bitwise AND\nSELECT * FROM Users WHERE Permissions & 2 = 2;\n\n-- Bitwise OR\nUPDATE Users SET Permissions = Permissions | 4 WHERE UserName = 'Neha';\n\n-- Bitwise AND + NOT\nUPDATE Users SET Permissions = Permissions & ~1 WHERE UserName = 'Ravi';\n\n-- Bitwise XOR\nUPDATE Users SET Permissions = Permissions ^ 2 WHERE UserName = 'Amit';\n\nSELECT * FROM Users;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["UserName", "Initial Permissions", "Operation", "Final Permissions", "Binary", "Meaning"],
                        "rows": [
                            ["Amit", 1, "Toggle Write (^2)", 3, "011", "Read + Write"],
                            ["Neha", 3, "Add Execute (|4)", 7, "111", "Read + Write + Execute"],
                            ["Ravi", 7, "Remove Read (&~1)", 6, "110", "Write + Execute"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "5. Compound Operators"
                    },
                    {
                        "type": "paragraph",
                        "text": "Compound operators combine an operation with assignment, modifying values in-place."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE Employees (\n    EmpID INT,\n    EmpName VARCHAR(50),\n    Salary INT\n);\n\nINSERT INTO Employees VALUES\n(1, 'Amit', 40000),\n(2, 'Neha', 50000),\n(3, 'Ravi', 30000);\n\nUPDATE Employees SET Salary = Salary + 5000;\nUPDATE Employees SET Salary = Salary - 2000 WHERE EmpName = 'Ravi';\nUPDATE Employees SET Salary = Salary * 2 WHERE EmpName = 'Neha';\nUPDATE Employees SET Salary = Salary / 2 WHERE EmpName = 'Amit';\nUPDATE Employees SET Salary = Salary % 10000;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["EmpID", "EmpName", "Salary"],
                        "rows": [
                            [1, "Amit", 5000],
                            [2, "Neha", 0],
                            [3, "Ravi", 33000]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "6. Special Operators"
                    },
                    {
                        "type": "paragraph",
                        "text": "Special operators include BETWEEN, IN, LIKE, IS NULL, and EXISTS."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- Create Students table\nCREATE TABLE Students (\n    ID INT,\n    Name VARCHAR(50),\n    Marks INT\n);\n\nINSERT INTO Students VALUES\n(1, 'Amit', 85),\n(2, 'Neha', 70),\n(3, 'Ravi', 55),\n(4, 'Kiran', NULL);\n\nSELECT * FROM Students WHERE Marks BETWEEN 60 AND 90;\nSELECT * FROM Students WHERE Name IN ('Amit', 'Ravi');\nSELECT * FROM Students WHERE Name LIKE 'N%';\nSELECT * FROM Students WHERE Marks IS NULL;\nSELECT * FROM Students s WHERE EXISTS (SELECT * FROM Students WHERE Marks > 80);"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Operator", "Result"],
                        "rows": [
                            ["BETWEEN 60 AND 90", "Amit, Neha"],
                            ["IN ('Amit','Ravi')", "Amit, Ravi"],
                            ["LIKE 'N%'", "Neha"],
                            ["IS NULL", "Kiran"],
                            ["EXISTS (Marks > 80)", "All rows"]
                        ]
                    }
                ]
            },
            {
                name: "SQL Commands | DDL, DQL, DML, DCL and TCL Commands",
                content: [
                    {
                        "type": "paragraph",
                        "text": "SQL commands are the fundamental building blocks used to query, define, modify, and control access to databases. They allow creating tables, inserting and updating data, querying records, controlling permissions, and managing transactions."
                    },
                    {
                        "type": "heading",
                        "text": "1. DDL - Data Definition Language"
                    },
                    {
                        "type": "paragraph",
                        "text": "DDL commands define, alter, and delete database structures such as tables, schemas, indexes, and views."
                    },
                    {
                        "type": "table",
                        "headers": ["Command", "Description", "Syntax"],
                        "rows": [
                            ["CREATE", "Create database objects such as tables, indexes, views, procedures", "CREATE TABLE table_name (column1 data_type, column2 data_type, ...);"],
                            ["DROP", "Delete objects from the database", "DROP TABLE table_name;"],
                            ["ALTER", "Modify the structure of an existing table", "ALTER TABLE table_name ADD COLUMN column_name data_type;"],
                            ["TRUNCATE", "Remove all records from a table and free table space", "TRUNCATE TABLE table_name;"],
                            ["COMMENT", "Add comments to data dictionary", "COMMENT ON TABLE table_name IS 'comment_text';"],
                            ["RENAME", "Rename a database object", "RENAME TABLE old_table_name TO new_table_name;"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE employees (\n    employee_id INT PRIMARY KEY,\n    first_name VARCHAR(50),\n    last_name VARCHAR(50),\n    hire_date DATE\n);"
                    },
                    {
                        "type": "paragraph",
                        "text": "Creates a new table 'employees' with columns for employee ID, name, and hire date."
                    },
                    {
                        "type": "heading",
                        "text": "2. DQL - Data Query Language"
                    },
                    {
                        "type": "paragraph",
                        "text": "DQL is used only for retrieving data from the database. SELECT is the only DQL command. Other keywords like FROM, WHERE, GROUP BY, HAVING, LIMIT are SELECT clauses."
                    },
                    {
                        "type": "table",
                        "headers": ["Clause", "Description", "Syntax"],
                        "rows": [
                            ["SELECT", "Retrieve data from a table", "SELECT column1, column2 FROM table_name WHERE condition;"],
                            ["FROM", "Specify the source table(s)", "SELECT column1 FROM table_name;"],
                            ["WHERE", "Filter rows before grouping", "SELECT column1 FROM table_name WHERE condition;"],
                            ["GROUP BY", "Group rows by common values", "SELECT column1, AVG(column2) FROM table_name GROUP BY column1;"],
                            ["HAVING", "Filter grouped results", "SELECT column1, AVG(column2) FROM table_name GROUP BY column1 HAVING condition;"],
                            ["DISTINCT", "Remove duplicates", "SELECT DISTINCT column1 FROM table_name;"],
                            ["ORDER BY", "Sort results", "SELECT column1 FROM table_name ORDER BY column1 ASC|DESC;"],
                            ["LIMIT", "Limit number of rows", "SELECT * FROM table_name LIMIT number;"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: DQL has only one command: SELECT. All others listed are clauses used with SELECT."
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT first_name, last_name, hire_date\nFROM employees\nWHERE department = 'Sales'\nORDER BY hire_date DESC;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Fetches employees from Sales department, ordered by latest hire date."
                    },
                    {
                        "type": "heading",
                        "text": "3. DML - Data Manipulation Language"
                    },
                    {
                        "type": "paragraph",
                        "text": "DML commands manipulate table data. They insert, update, or delete rows."
                    },
                    {
                        "type": "table",
                        "headers": ["Command", "Description", "Syntax"],
                        "rows": [
                            ["INSERT", "Insert new records into table", "INSERT INTO table_name (column1, column2) VALUES (value1, value2);"],
                            ["UPDATE", "Modify existing records", "UPDATE table_name SET column1 = value1 WHERE condition;"],
                            ["DELETE", "Remove records from table", "DELETE FROM table_name WHERE condition;"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "INSERT INTO employees (first_name, last_name, department)\nVALUES ('Jane', 'Smith', 'HR');"
                    },
                    {
                        "type": "paragraph",
                        "text": "Inserts a new employee record into employees table."
                    },
                    {
                        "type": "heading",
                        "text": "4. DCL - Data Control Language"
                    },
                    {
                        "type": "paragraph",
                        "text": "DCL manages user permissions and controls access to database objects."
                    },
                    {
                        "type": "table",
                        "headers": ["Command", "Description", "Syntax"],
                        "rows": [
                            ["GRANT", "Give user access privileges", "GRANT privilege_type ON object_name TO user;"],
                            ["REVOKE", "Remove user access privileges", "REVOKE privilege_type ON object_name FROM user;"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "GRANT SELECT, UPDATE ON employees TO user_name;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Allows the user 'user_name' to read and update employee records."
                    },
                    {
                        "type": "heading",
                        "text": "5. TCL - Transaction Control Language"
                    },
                    {
                        "type": "paragraph",
                        "text": "TCL commands manage database transactions — sets of SQL operations treated as a single unit."
                    },
                    {
                        "type": "table",
                        "headers": ["Command", "Description", "Syntax"],
                        "rows": [
                            ["BEGIN TRANSACTION", "Start a new transaction", "BEGIN TRANSACTION;"],
                            ["COMMIT", "Save all changes made in transaction", "COMMIT;"],
                            ["ROLLBACK", "Undo all changes since last COMMIT", "ROLLBACK;"],
                            ["SAVEPOINT", "Create a savepoint to roll back later", "SAVEPOINT savepoint_name;"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "BEGIN TRANSACTION;\nUPDATE employees SET department = 'Marketing' WHERE department = 'Sales';\nSAVEPOINT before_update;\nUPDATE employees SET department = 'IT' WHERE department = 'HR';\nROLLBACK TO SAVEPOINT before_update;\nCOMMIT;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Demo of transaction workflow using savepoint and rollback."
                    }
                ]
            },
            {
                name: "SQL Database Operations",
                content: [
                    {
                        "type": "paragraph",
                        "text": "SQL databases are relational systems used for storing, managing, and organizing structured data. SQL enables creating, updating, retrieving, and managing data efficiently using standardized commands."
                    },
                    {
                        "type": "heading",
                        "text": "What Are SQL Databases?"
                    },
                    {
                        "type": "paragraph",
                        "text": "SQL databases store data in tables made of rows and columns. SQL (Structured Query Language) is the standard language used to interact with these databases."
                    },
                    {
                        "type": "heading",
                        "text": "Why Do SQL Databases Exist?"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Efficient Data Handling: Store, retrieve, and manipulate structured data effectively.",
                            "Reliability: Ensures data consistency and integrity.",
                            "Complex Relationships: Supports modeling advanced relationships.",
                            "Transaction Support: Reliable execution of multi-step operations.",
                            "Scalability: Can handle increasing data volumes while maintaining speed.",
                            "ACID Compliance: Guarantees accuracy and reliability.",
                            "Universal Adoption: Widely used across all industries."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "How SQL Databases Work"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Data Storage: Data is organized in tables containing rows and columns.",
                            "Query Processing: SQL queries are parsed, optimized, and executed by the server.",
                            "Data Retrieval: SELECT statements fetch specific data, filtered using WHERE clauses."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "SQL Database Management"
                    },
                    {
                        "type": "paragraph",
                        "text": "Covers core operations for creating, selecting, renaming, and dropping databases."
                    },
                    {
                        "type": "heading",
                        "text": "1. CREATE Database"
                    },
                    {
                        "type": "paragraph",
                        "text": "Initializes a new empty database that stores tables and database objects."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE DATABASE test_db;"
                    },
                    {
                        "type": "heading",
                        "text": "2. SELECT Database"
                    },
                    {
                        "type": "paragraph",
                        "text": "USE or SELECT DATABASE sets the active working database for the session."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "USE test_db;"
                    },
                    {
                        "type": "heading",
                        "text": "3. RENAME Database"
                    },
                    {
                        "type": "paragraph",
                        "text": "Renames an existing database. Not all SQL engines support this command."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "RENAME DATABASE test_db TO new_test_db;"
                    },
                    {
                        "type": "heading",
                        "text": "4. DROP Database"
                    },
                    {
                        "type": "paragraph",
                        "text": "Permanently deletes a database and all its objects. Action is irreversible."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "DROP DATABASE test_db;"
                    },
                    {
                        "type": "heading",
                        "text": "Difference Between SQL and NoSQL Databases"
                    },
                    {
                        "type": "table",
                        "headers": ["Feature", "SQL Databases", "NoSQL Databases"],
                        "rows": [
                            ["Data Structure", "Tables with rows and columns", "Key-value, documents, columns, graphs"],
                            ["Schema", "Fixed schema", "Flexible schema"],
                            ["Data Integrity", "ACID compliance", "Eventual consistency"],
                            ["Scalability", "Vertically scalable", "Horizontally scalable"],
                            ["Query Language", "Structured Query Language (SQL)", "Varies (MongoDB, Cassandra, etc.)"],
                            ["Transactions", "Full ACID transactions", "Limited transactional support"],
                            ["Use Cases", "Structured data, complex queries", "Unstructured data, scalable apps"],
                            ["Examples", "MySQL, PostgreSQL, SQL Server", "MongoDB, Cassandra, Redis"],
                            ["Relationships", "Supports joins and complex relations", "Limited support"],
                            ["Flexibility", "Less flexible", "Highly flexible"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Conclusion"
                    },
                    {
                        "type": "paragraph",
                        "text": "SQL databases ensure consistency, performance, scalability, and reduced redundancy. They are ideal for structured data handling, transactional workloads, and complex queries."
                    }
                ]
            },
            {
                name: "SQL CREATE TABLE",
                content: [
                    {
                        "type": "paragraph",
                        "text": "The CREATE TABLE statement in SQL is used to define a new table in a database. It specifies the table name, column names, and their data types, forming the foundation for storing and organizing data."
                    },
                    {
                        "type": "heading",
                        "text": "Syntax"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE table_name (\n  column1 datatype(size),\n  column2 datatype(size),\n  ...\n  columnN datatype(size)\n);"
                    },
                    {
                        "type": "paragraph",
                        "text": "table_name defines the name of the new table. Each column must specify its name and data type. Constraints such as PRIMARY KEY, CHECK, etc., may also be included."
                    },
                    {
                        "type": "heading",
                        "text": "Example: Create a Customer Table"
                    },
                    {
                        "type": "paragraph",
                        "text": "A practical example showing how to create a Customer table with different data types and constraints."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE Customer(\n    CustomerID INT PRIMARY KEY,\n    FirstName VARCHAR(50),\n    LastName VARCHAR(50),\n    Country VARCHAR(50),\n    Age INT CHECK (Age >= 0 AND Age <= 99),\n    Phone INT(10)\n);"
                    },
                    {
                        "type": "list",
                        "items": [
                            "CustomerID is the PRIMARY KEY ensuring unique records.",
                            "FirstName, LastName, and Country use VARCHAR for text storage.",
                            "Age uses a CHECK constraint ensuring values between 0 and 99.",
                            "Phone is defined as INT, though VARCHAR is often preferred for phone numbers."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Inserting Data into the Table"
                    },
                    {
                        "type": "paragraph",
                        "text": "After creating a table, you can insert data using the INSERT INTO command."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "INSERT INTO Customer (CustomerID, FirstName, LastName, Country, Age, Phone)\nVALUES \n(1, 'Luca', 'Bianchi', 'Italy', 23, 'xxxxxxxxxx'),\n(2, 'Aiko', 'Tanaka', 'Japan', 21, 'xxxxxxxxxx'),\n(3, 'Carlos', 'Gomez', 'Spain', 24, 'xxxxxxxxxx'),\n(4, 'Sofia', 'Müller', 'Germany', 22, 'xxxxxxxxxx'),\n(5, 'Ethan', 'Johnson', 'USA', 25, 'xxxxxxxxxx');"
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: Bulk inserts or importing from external files is recommended for large datasets."
                    },
                    {
                        "type": "heading",
                        "text": "Create Table from Existing Table"
                    },
                    {
                        "type": "paragraph",
                        "text": "SQL allows creating a new table by copying structure and optionally data from an existing table using CREATE TABLE AS SELECT."
                    },
                    {
                        "type": "heading",
                        "text": "Syntax:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE new_table_name AS\nSELECT column1, column2, ...\nFROM existing_table_name\nWHERE ...;"
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE SubTable AS\nSELECT CustomerID, FirstName\nFROM Customer;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: Use SELECT * to copy the full table structure and data."
                    },
                    {
                        "type": "heading",
                        "text": "Tips for Using CREATE TABLE in SQL"
                    },
                    {
                        "type": "list",
                        "items": [
                            "You can define constraints like NOT NULL, UNIQUE, DEFAULT while creating a table.",
                            "If a table already exists, SQL throws an error. Use IF NOT EXISTS to avoid this.",
                            "Define appropriate data types to optimize performance and storage.",
                            "Use DESC table_name; to view the structure of an existing table.",
                            "Use ALTER TABLE to rename columns, add new columns, or modify the structure."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example: Using IF NOT EXISTS"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE IF NOT EXISTS Customer (\n    CustomerID INT PRIMARY KEY,\n    FirstName VARCHAR(50),\n    LastName VARCHAR(50)\n);"
                    },
                    {
                        "type": "heading",
                        "text": "Example: Viewing Table Structure"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "DESC Customer;"
                    }
                ]
            },
            {
                name: "SQL SELECT Query",
                content: [
                    {
                        "type": "paragraph",
                        "text": "The SQL SELECT statement retrieves data from one or more tables and returns it as a tabular result set. You can fetch all columns, specific columns, filter using WHERE, group results, remove duplicates, sort results, and more."
                    },
                    {
                        "type": "heading",
                        "text": "Syntax"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT column1, column2 FROM table_name;"
                    },
                    {
                        "type": "paragraph",
                        "text": "column1, column2 specify which columns to retrieve; table_name is the source table."
                    },
                    {
                        "type": "heading",
                        "text": "Sample Table for Examples"
                    },
                    {
                        "type": "paragraph",
                        "text": "Below is a sample Customer table with sample data that will be used for all examples."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE Customer (\n    CustomerID INT PRIMARY KEY,\n    CustomerName VARCHAR(50),\n    LastName VARCHAR(50),\n    Country VARCHAR(50),\n    Age INT(2),\n    Phone VARCHAR(10)\n);\n\nINSERT INTO Customer (CustomerID, CustomerName, LastName, Country, Age, Phone)\nVALUES\n(1, 'Arun', 'Kumar', 'India', 26, '9876543210'),\n(2, 'Elena', 'Perez', 'Spain', 22, '9123456780'),\n(3, 'Noah', 'Williams', 'Canada', 28, '9988776655'),\n(4, 'Mina', 'Park', 'South Korea', 22, '8877665544'),\n(5, 'Oliver', 'Brown', 'UK', 25, '9001122334');"
                    },
                    {
                        "type": "heading",
                        "text": "Customer Table:"
                    },
                    {
                        "type": "table",
                        "headers": ["CustomerID", "CustomerName", "LastName", "Country", "Age", "Phone"],
                        "rows": [
                            [1, "Arun", "Kumar", "India", 26, "9876543210"],
                            [2, "Elena", "Perez", "Spain", 22, "9123456780"],
                            [3, "Noah", "Williams", "Canada", 28, "9988776655"],
                            [4, "Mina", "Park", "South Korea", 22, "8877665544"],
                            [5, "Oliver", "Brown", "UK", 25, "9001122334"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 1: Select Specific Columns"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT CustomerName, LastName FROM Customer;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["CustomerName", "LastName"],
                        "rows": [
                            ["Arun", "Kumar"],
                            ["Elena", "Perez"],
                            ["Noah", "Williams"],
                            ["Mina", "Park"],
                            ["Oliver", "Brown"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 2: Select All Columns"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT * FROM Customer;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["CustomerID", "CustomerName", "LastName", "Country", "Age", "Phone"],
                        "rows": [
                            [1, "Arun", "Kumar", "India", 26, "9876543210"],
                            [2, "Elena", "Perez", "Spain", 22, "9123456780"],
                            [3, "Noah", "Williams", "Canada", 28, "9988776655"],
                            [4, "Mina", "Park", "South Korea", 22, "8877665544"],
                            [5, "Oliver", "Brown", "UK", 25, "9001122334"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 3: SELECT with WHERE Clause"
                    },
                    {
                        "type": "paragraph",
                        "text": "Filter records where Age = 22."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT CustomerName FROM Customer WHERE Age = 22;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["CustomerName"],
                        "rows": [
                            ["Elena"],
                            ["Mina"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 4: SELECT with GROUP BY"
                    },
                    {
                        "type": "paragraph",
                        "text": "Count customers from each country."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT Country, COUNT(*) AS customer_count\nFROM Customer\nGROUP BY Country;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Country", "customer_count"],
                        "rows": [
                            ["India", 1],
                            ["Spain", 1],
                            ["Canada", 1],
                            ["South Korea", 1],
                            ["UK", 1]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 5: SELECT with DISTINCT"
                    },
                    {
                        "type": "paragraph",
                        "text": "Retrieve unique countries."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT DISTINCT Country FROM Customer;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Country"],
                        "rows": [
                            ["India"],
                            ["Spain"],
                            ["Canada"],
                            ["South Korea"],
                            ["UK"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 6: SELECT with HAVING Clause"
                    },
                    {
                        "type": "paragraph",
                        "text": "Find countries with TWO or more customers. For demonstration, let's assume we added more customers from India and UK."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- First, add more sample data\nINSERT INTO Customer VALUES\n(6, 'Arjun', 'Mehta', 'India', 24, '9123456789'),\n(7, 'Grace', 'Taylor', 'UK', 27, '9001122335');\n\n-- Now query with HAVING\nSELECT Country, COUNT(*) AS customer_count\nFROM Customer\nGROUP BY Country\nHAVING COUNT(*) >= 2;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Country", "customer_count"],
                        "rows": [
                            ["India", 2],
                            ["UK", 2]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 7: SELECT with ORDER BY"
                    },
                    {
                        "type": "paragraph",
                        "text": "Sort by Age in descending order."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT * FROM Customer ORDER BY Age DESC;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["CustomerID", "CustomerName", "LastName", "Country", "Age", "Phone"],
                        "rows": [
                            [3, "Noah", "Williams", "Canada", 28, "9988776655"],
                            [1, "Arun", "Kumar", "India", 26, "9876543210"],
                            [5, "Oliver", "Brown", "UK", 25, "9001122334"],
                            [2, "Elena", "Perez", "Spain", 22, "9123456780"],
                            [4, "Mina", "Park", "South Korea", 22, "8877665544"]
                        ]
                    }
                ]
            },
            {
                name: "SQL INSERT INTO Statement",
                content: [
                    {
                        "type": "paragraph",
                        "text": "The SQL INSERT INTO statement is used to add new records into a table. It supports inserting values into all columns, selected columns, multiple rows, or inserting data from another table."
                    },
                    {
                        "type": "heading",
                        "text": "1. Inserting Data into All Columns"
                    },
                    {
                        "type": "paragraph",
                        "text": "This method inserts values into all columns of a table. Values must be in the same order as the table schema."
                    },
                    {
                        "type": "heading",
                        "text": "Syntax:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "INSERT INTO table_name VALUES (value1, value2, value3, ...);"
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE DATABASE StudentDB;\nUSE StudentDB;\n\nCREATE TABLE Student (\n    ROLL_NO INT PRIMARY KEY,\n    NAME VARCHAR(50),\n    ADDRESS VARCHAR(100),\n    PHONE VARCHAR(15),\n    AGE INT\n);\n\nINSERT INTO Student (ROLL_NO, NAME, ADDRESS, PHONE, AGE)\nVALUES\n(1, 'Arin', 'Lagos', '9801123456', 18),\n(2, 'Mira', 'Helsinki', '8123345567', 19),\n(3, 'Riko', 'Osaka', '9012245678', 20),\n(4, 'Darius', 'Nairobi', '7734458901', 18);"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["ROLL_NO", "NAME", "ADDRESS", "PHONE", "AGE"],
                        "rows": [
                            [1, "Arin", "Lagos", "9801123456", 18],
                            [2, "Mira", "Helsinki", "8123345567", 19],
                            [3, "Riko", "Osaka", "9012245678", 20],
                            [4, "Darius", "Nairobi", "7734458901", 18]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Inserting Without Specifying Columns"
                    },
                    {
                        "type": "paragraph",
                        "text": "If inserting values for all columns, column names may be omitted."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "INSERT INTO Student VALUES (5, 'Selina', 'Lisbon', '8899012345', 20);"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["ROLL_NO", "NAME", "ADDRESS", "PHONE", "AGE"],
                        "rows": [
                            [1, "Arin", "Lagos", "9801123456", 18],
                            [2, "Mira", "Helsinki", "8123345567", 19],
                            [3, "Riko", "Osaka", "9012245678", 20],
                            [4, "Darius", "Nairobi", "7734458901", 18],
                            [5, "Selina", "Lisbon", "8899012345", 20]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2. Inserting Data into Specific Columns"
                    },
                    {
                        "type": "paragraph",
                        "text": "Only selected columns receive values; remaining columns store NULL or default values."
                    },
                    {
                        "type": "heading",
                        "text": "Syntax:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "INSERT INTO table_name (column1, column2) VALUES (value1, value2);"
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "INSERT INTO Student (ROLL_NO, NAME, AGE)\nVALUES (6, 'Haruto', 19);"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["ROLL_NO", "NAME", "ADDRESS", "PHONE", "AGE"],
                        "rows": [
                            [1, "Arin", "Lagos", "9801123456", 18],
                            [2, "Mira", "Helsinki", "8123345567", 19],
                            [3, "Riko", "Osaka", "9012245678", 20],
                            [4, "Darius", "Nairobi", "7734458901", 18],
                            [5, "Selina", "Lisbon", "8899012345", 20],
                            [6, "Haruto", "NULL", "NULL", 19]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: Columns not included in the INSERT statement take NULL unless a DEFAULT exists."
                    },
                    {
                        "type": "heading",
                        "text": "3. Inserting Multiple Rows at Once"
                    },
                    {
                        "type": "paragraph",
                        "text": "This improves performance over executing multiple single-row insert commands."
                    },
                    {
                        "type": "heading",
                        "text": "Syntax:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "INSERT INTO table_name (col1, col2) VALUES (...), (...), (...);"
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "INSERT INTO Student (ROLL_NO, NAME, ADDRESS, PHONE, AGE)\nVALUES\n(7, 'Jonah', 'Reykjavik', '7001123499', 17),\n(8, 'Aisha', 'Tunis', '9213349988', 18),\n(9, 'Mikkel', 'Aarhus', '8899441122', 19),\n(10, 'Zara', 'Pretoria', '8112203344', 17);"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["ROLL_NO", "NAME", "ADDRESS", "PHONE", "AGE"],
                        "rows": [
                            [1, "Arin", "Lagos", "9801123456", 18],
                            [2, "Mira", "Helsinki", "8123345567", 19],
                            [3, "Riko", "Osaka", "9012245678", 20],
                            [4, "Darius", "Nairobi", "7734458901", 18],
                            [5, "Selina", "Lisbon", "8899012345", 20],
                            [6, "Haruto", "NULL", "NULL", 19],
                            [7, "Jonah", "Reykjavik", "7001123499", 17],
                            [8, "Aisha", "Tunis", "9213349988", 18],
                            [9, "Mikkel", "Aarhus", "8899441122", 19],
                            [10, "Zara", "Pretoria", "8112203344", 17]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "4. Inserting Data from One Table into Another Table"
                    },
                    {
                        "type": "paragraph",
                        "text": "INSERT INTO SELECT is used to copy rows from another table."
                    },
                    {
                        "type": "heading",
                        "text": "Source Table (OldStudent):"
                    },
                    {
                        "type": "table",
                        "headers": ["ROLL_NO", "NAME", "ADDRESS", "PHONE", "AGE"],
                        "rows": [
                            [101, "Virat Sethi", "Jaipur", "9112233445", 22],
                            [102, "Elina Frost", "Reykjavik", "7711234432", 23],
                            [103, "Ken Arata", "Osaka", "6677991100", 19]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Method 1: Insert All Columns"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "INSERT INTO Student\nSELECT * FROM OldStudent;"
                    },
                    {
                        "type": "paragraph",
                        "text": "This copies all rows and columns from OldStudent into Student."
                    },
                    {
                        "type": "heading",
                        "text": "Method 2: Insert Specific Columns"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "INSERT INTO Student (NAME, AGE)\nSELECT NAME, AGE FROM OldStudent;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: ROLL_NO, ADDRESS, PHONE become NULL for these inserted rows."
                    },
                    {
                        "type": "heading",
                        "text": "Method 3: Insert Rows Based on Condition"
                    },
                    {
                        "type": "paragraph",
                        "text": "Insert only students older than 20."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "INSERT INTO Student\nSELECT * FROM OldStudent\nWHERE AGE > 20;"
                    },
                    {
                        "type": "heading",
                        "text": "Output (Students with AGE > 20):"
                    },
                    {
                        "type": "table",
                        "headers": ["ROLL_NO", "NAME", "ADDRESS", "PHONE", "AGE"],
                        "rows": [
                            [101, "Virat Sethi", "Jaipur", "9112233445", 22],
                            [102, "Elina Frost", "Reykjavik", "7711234432", 23]
                        ]
                    }
                ]
            },
            {
                name: "SQL UPDATE Statement",
                content: [
                    {
                        "type": "paragraph",
                        "text": "The SQL UPDATE statement is used to modify existing records in a table. It can change one or more column values based on a condition using the WHERE clause. Without a WHERE clause, all rows in the table will be updated."
                    },
                    {
                        "type": "heading",
                        "text": "Syntax"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "UPDATE table_name\nSET column1 = value1, column2 = value2\nWHERE condition;"
                    },
                    {
                        "type": "list",
                        "items": [
                            "table_name: table to be updated.",
                            "SET: defines new values for columns.",
                            "WHERE: selects which rows to update.",
                            "Without WHERE, all rows will be modified."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Initial Table (Sample Data)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Create a Customer table and insert original sample data."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE Customer (\n    CustomerID INT PRIMARY KEY,\n    CustomerName VARCHAR(50),\n    LastName VARCHAR(50),\n    Country VARCHAR(50),\n    Age INT,\n    Phone VARCHAR(15)\n);\n\nINSERT INTO Customer (CustomerID, CustomerName, LastName, Country, Age, Phone)\nVALUES\n(1, 'Arin', 'Solberg', 'Norway', 25, '4711122233'),\n(2, 'Mila', 'Fernandes', 'Portugal', 23, '35199887766'),\n(3, 'Yuto', 'Hayashi', 'Japan', 26, '81123499887'),\n(4, 'Lars', 'Heinrich', 'Sweden', 27, '46122334455'),\n(5, 'Chloe', 'Renard', 'France', 24, '33155667788');"
                    },
                    {
                        "type": "heading",
                        "text": "Table contents immediately after initial INSERT:"
                    },
                    {
                        "type": "table",
                        "headers": ["CustomerID", "CustomerName", "LastName", "Country", "Age", "Phone"],
                        "rows": [
                            [1, "Arin", "Solberg", "Norway", 25, "4711122233"],
                            [2, "Mila", "Fernandes", "Portugal", 23, "35199887766"],
                            [3, "Yuto", "Hayashi", "Japan", 26, "81123499887"],
                            [4, "Lars", "Heinrich", "Sweden", 27, "46122334455"],
                            [5, "Chloe", "Renard", "France", 24, "33155667788"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 1: Update Single Column"
                    },
                    {
                        "type": "paragraph",
                        "text": "Update CustomerName for customers aged 23."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "UPDATE Customer\nSET CustomerName = 'Isabella'\nWHERE Age = 23;"
                    },
                    {
                        "type": "heading",
                        "text": "Table after running Example 1 (Mila → Isabella):"
                    },
                    {
                        "type": "table",
                        "headers": ["CustomerID", "CustomerName", "LastName", "Country", "Age", "Phone"],
                        "rows": [
                            [1, "Arin", "Solberg", "Norway", 25, "4711122233"],
                            [2, "Isabella", "Fernandes", "Portugal", 23, "35199887766"],
                            [3, "Yuto", "Hayashi", "Japan", 26, "81123499887"],
                            [4, "Lars", "Heinrich", "Sweden", 27, "46122334455"],
                            [5, "Chloe", "Renard", "France", 24, "33155667788"]
                        ]
                    },
                    {
                        "type": "list",
                        "items": [
                            "Only the row where Age = 23 is updated.",
                            "CustomerName changed from 'Mila' to 'Isabella'."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 2: Update Multiple Columns"
                    },
                    {
                        "type": "paragraph",
                        "text": "Change both CustomerName and Country for a specific CustomerID."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "UPDATE Customer\nSET CustomerName = 'Jonas', Country = 'Denmark'\nWHERE CustomerID = 1;"
                    },
                    {
                        "type": "heading",
                        "text": "Table after running Example 2 (CustomerID 1 updated):"
                    },
                    {
                        "type": "table",
                        "headers": ["CustomerID", "CustomerName", "LastName", "Country", "Age", "Phone"],
                        "rows": [
                            [1, "Jonas", "Solberg", "Denmark", 25, "4711122233"],
                            [2, "Isabella", "Fernandes", "Portugal", 23, "35199887766"],
                            [3, "Yuto", "Hayashi", "Japan", 26, "81123499887"],
                            [4, "Lars", "Heinrich", "Sweden", 27, "46122334455"],
                            [5, "Chloe", "Renard", "France", 24, "33155667788"]
                        ]
                    },
                    {
                        "type": "list",
                        "items": [
                            "Updates multiple fields at once for CustomerID = 1.",
                            "CustomerName changed to 'Jonas' and Country to 'Denmark'."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 3: UPDATE Without WHERE Clause"
                    },
                    {
                        "type": "paragraph",
                        "text": "⚠️ WARNING: Updating without WHERE updates ALL rows — use carefully."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "UPDATE Customer\nSET CustomerName = 'Alex';"
                    },
                    {
                        "type": "heading",
                        "text": "Table after running Example 3 (all CustomerName set to 'Alex'):"
                    },
                    {
                        "type": "table",
                        "headers": ["CustomerID", "CustomerName", "LastName", "Country", "Age", "Phone"],
                        "rows": [
                            [1, "Alex", "Solberg", "Denmark", 25, "4711122233"],
                            [2, "Alex", "Fernandes", "Portugal", 23, "35199887766"],
                            [3, "Alex", "Hayashi", "Japan", 26, "81123499887"],
                            [4, "Alex", "Heinrich", "Sweden", 27, "46122334455"],
                            [5, "Alex", "Renard", "France", 24, "33155667788"]
                        ]
                    },
                    {
                        "type": "list",
                        "items": [
                            "Every row receives CustomerName = 'Alex'.",
                            "This is a common mistake — always use WHERE unless you intentionally want to update all rows.",
                            "Always double-check WHERE to avoid full-table updates."
                        ]
                    }
                ]
            },
            {
                name: "SQL DELETE Statement",
                content: [
                    {
                        "type": "paragraph",
                        "text": "DELETE removes rows from a table. Use WHERE to target specific rows; without WHERE all rows are removed. Variants include IN, EXISTS, JOIN deletes, subqueries, LIMIT (DBMS-specific), RETURNING (Postgres), and cascading deletes via foreign keys."
                    },
                    {
                        "type": "heading",
                        "text": "Fundamentals"
                    },
                    {
                        "type": "paragraph",
                        "text": "DELETE is a DML command used to remove rows. Basic syntax: DELETE FROM table_name WHERE condition; Omitting WHERE deletes all rows. TRUNCATE is a separate command for fast full deletion."
                    },
                    {
                        "type": "heading",
                        "text": "Safety Checklist"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Run SELECT with same WHERE to preview rows to be deleted.",
                            "Wrap large deletes in transactions.",
                            "Use batching for very large deletes (delete in chunks).",
                            "Back up before destructive operations.",
                            "Prefer RETURNING (if available) to capture deleted rows."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 1: Delete Single Row by Primary Key"
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial Users table:"
                    },
                    {
                        "type": "table",
                        "headers": ["UserID", "Name", "City"],
                        "rows": [
                            [1, "Asha", "Pune"],
                            [2, "Ravi", "Bengaluru"],
                            [3, "Nora", "Zagreb"]
                        ]
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "DELETE FROM Users WHERE UserID = 2;"
                    },
                    {
                        "type": "paragraph",
                        "text": "After deletion:"
                    },
                    {
                        "type": "table",
                        "headers": ["UserID", "Name", "City"],
                        "rows": [
                            [1, "Asha", "Pune"],
                            [3, "Nora", "Zagreb"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 2: Delete Multiple Rows with Condition (Range)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial Students table:"
                    },
                    {
                        "type": "table",
                        "headers": ["Roll", "StudentName", "Grade"],
                        "rows": [
                            [10, "Maya", 65],
                            [11, "Tomo", 72],
                            [12, "Sana", 58],
                            [13, "Luca", 49]
                        ]
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "DELETE FROM Students WHERE Grade < 60;"
                    },
                    {
                        "type": "paragraph",
                        "text": "After deletion (students with Grade < 60 removed):"
                    },
                    {
                        "type": "table",
                        "headers": ["Roll", "StudentName", "Grade"],
                        "rows": [
                            [10, "Maya", 65],
                            [11, "Tomo", 72]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 3: Delete Using IN List"
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial Products table:"
                    },
                    {
                        "type": "table",
                        "headers": ["ProdID", "ProdName", "Category"],
                        "rows": [
                            [101, "Aurora Lamp", "Home"],
                            [102, "Breeze Fan", "Home"],
                            [103, "Cypher Pen", "Office"],
                            [104, "Delta Mouse", "Office"]
                        ]
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "DELETE FROM Products WHERE ProdID IN (101, 104);"
                    },
                    {
                        "type": "paragraph",
                        "text": "After deletion:"
                    },
                    {
                        "type": "table",
                        "headers": ["ProdID", "ProdName", "Category"],
                        "rows": [
                            [102, "Breeze Fan", "Home"],
                            [103, "Cypher Pen", "Office"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 4: Delete Using BETWEEN (Date Range)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial Events table:"
                    },
                    {
                        "type": "table",
                        "headers": ["EventID", "Title", "EventDate"],
                        "rows": [
                            [1, "Hackathon Alpha", "2025-01-10"],
                            [2, "Hackathon Beta", "2025-06-15"],
                            [3, "Meetup Gamma", "2025-06-20"],
                            [4, "Workshop Delta", "2025-12-01"]
                        ]
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "DELETE FROM Events\nWHERE EventDate BETWEEN '2025-06-01' AND '2025-06-30';"
                    },
                    {
                        "type": "paragraph",
                        "text": "After deletion (June events removed):"
                    },
                    {
                        "type": "table",
                        "headers": ["EventID", "Title", "EventDate"],
                        "rows": [
                            [1, "Hackathon Alpha", "2025-01-10"],
                            [4, "Workshop Delta", "2025-12-01"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 5: Delete with Subquery (Delete Dependent Rows)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial Customers table:"
                    },
                    {
                        "type": "table",
                        "headers": ["CustID", "CustName", "IsActive"],
                        "rows": [
                            [1, "Ishan", "true"],
                            [2, "Lea", "false"],
                            [3, "Omar", "true"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial Orders table:"
                    },
                    {
                        "type": "table",
                        "headers": ["OrderID", "CustID", "Amount"],
                        "rows": [
                            [201, 1, 500],
                            [202, 2, 700],
                            [203, 3, 250],
                            [204, 2, 120]
                        ]
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "DELETE FROM Orders\nWHERE CustID IN (\n    SELECT CustID FROM Customers WHERE IsActive = FALSE\n);"
                    },
                    {
                        "type": "paragraph",
                        "text": "After deletion (orders from inactive customers removed):"
                    },
                    {
                        "type": "table",
                        "headers": ["OrderID", "CustID", "Amount"],
                        "rows": [
                            [201, 1, 500],
                            [203, 3, 250]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 6: Delete with EXISTS (Alternative to Subquery)"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "DELETE FROM Orders o\nWHERE EXISTS (\n    SELECT 1 FROM Customers c\n    WHERE c.CustID = o.CustID AND c.IsActive = FALSE\n);"
                    },
                    {
                        "type": "paragraph",
                        "text": "This produces the same result as Example 5, removing orders from inactive customers."
                    },
                    {
                        "type": "heading",
                        "text": "Example 7: Delete Using JOIN (MySQL Style)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial Users table:"
                    },
                    {
                        "type": "table",
                        "headers": ["UserID", "Active"],
                        "rows": [
                            [1, "true"],
                            [2, "false"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial Sessions table:"
                    },
                    {
                        "type": "table",
                        "headers": ["SessionID", "UserID", "Token"],
                        "rows": [
                            [301, 1, "t1"],
                            [302, 2, "t2"],
                            [303, 2, "t3"]
                        ]
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "DELETE s FROM Sessions s\nJOIN Users u ON s.UserID = u.UserID\nWHERE u.Active = FALSE;"
                    },
                    {
                        "type": "paragraph",
                        "text": "After deletion (sessions for inactive users removed):"
                    },
                    {
                        "type": "table",
                        "headers": ["SessionID", "UserID", "Token"],
                        "rows": [
                            [301, 1, "t1"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 8: Delete with LIMIT (MySQL Example)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial Logs table:"
                    },
                    {
                        "type": "table",
                        "headers": ["LogID", "Level", "Message"],
                        "rows": [
                            [1, "DEBUG", "x"],
                            [2, "DEBUG", "y"],
                            [3, "INFO", "z"],
                            [4, "DEBUG", "w"]
                        ]
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "DELETE FROM Logs WHERE Level = 'DEBUG' LIMIT 2;"
                    },
                    {
                        "type": "paragraph",
                        "text": "After deletion (only first 2 DEBUG logs removed):"
                    },
                    {
                        "type": "table",
                        "headers": ["LogID", "Level", "Message"],
                        "rows": [
                            [3, "INFO", "z"],
                            [4, "DEBUG", "w"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: LIMIT is DBMS-specific (e.g., MySQL, PostgreSQL)."
                    },
                    {
                        "type": "heading",
                        "text": "Example 9: TRUNCATE vs DELETE"
                    },
                    {
                        "type": "paragraph",
                        "text": "TRUNCATE TABLE removes all rows quickly and may not be transactional; DELETE FROM table removes rows row-by-row and is transactional in many DBMS."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- Fast, non-transactional (in some DBMS)\nTRUNCATE TABLE TableName;\n\n-- Slower, transactional\nDELETE FROM TableName;"
                    },
                    {
                        "type": "heading",
                        "text": "Example 10: Cascade Delete via Foreign Key"
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial Departments table:"
                    },
                    {
                        "type": "table",
                        "headers": ["DeptID", "DeptName"],
                        "rows": [
                            [5, "Research"],
                            [6, "Support"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial Employees table (with FK to Departments):"
                    },
                    {
                        "type": "table",
                        "headers": ["EmpID", "Name", "DeptID"],
                        "rows": [
                            [401, "Tara", 5],
                            [402, "Owen", 6],
                            [403, "Rui", 5]
                        ]
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- Assuming FK with ON DELETE CASCADE\nDELETE FROM Departments WHERE DeptID = 5;"
                    },
                    {
                        "type": "paragraph",
                        "text": "After deletion (Department 5 and its employees removed via CASCADE):"
                    },
                    {
                        "type": "paragraph",
                        "text": "Departments table:"
                    },
                    {
                        "type": "table",
                        "headers": ["DeptID", "DeptName"],
                        "rows": [
                            [6, "Support"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Employees table:"
                    },
                    {
                        "type": "table",
                        "headers": ["EmpID", "Name", "DeptID"],
                        "rows": [
                            [402, "Owen", 6]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 11: DELETE ... RETURNING (PostgreSQL)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial TempWorkers table:"
                    },
                    {
                        "type": "table",
                        "headers": ["WID", "WName", "Hourly"],
                        "rows": [
                            [1, "Zed", 15],
                            [2, "Lina", 10],
                            [3, "Omar", 12]
                        ]
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "DELETE FROM TempWorkers\nWHERE Hourly < 13\nRETURNING WID, WName;"
                    },
                    {
                        "type": "paragraph",
                        "text": "After deletion:"
                    },
                    {
                        "type": "table",
                        "headers": ["WID", "WName", "Hourly"],
                        "rows": [
                            [1, "Zed", 15]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Returned rows (captured by RETURNING):"
                    },
                    {
                        "type": "table",
                        "headers": ["WID", "WName"],
                        "rows": [
                            [2, "Lina"],
                            [3, "Omar"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: RETURNING returns deleted rows (PostgreSQL and some other DBMS)."
                    },
                    {
                        "type": "heading",
                        "text": "Example 12: Delete Inside Transaction with SAVEPOINT"
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial Archive table:"
                    },
                    {
                        "type": "table",
                        "headers": ["AID", "Title"],
                        "rows": [
                            [1, "Old1"],
                            [2, "Old2"],
                            [3, "Old3"]
                        ]
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "BEGIN;\nSAVEPOINT before_archive_delete;\nDELETE FROM Archive WHERE AID IN (2, 3);\n-- If problem: ROLLBACK TO SAVEPOINT before_archive_delete;\nCOMMIT;"
                    },
                    {
                        "type": "paragraph",
                        "text": "After successful commit:"
                    },
                    {
                        "type": "table",
                        "headers": ["AID", "Title"],
                        "rows": [
                            [1, "Old1"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: Transactions protect you from accidental mass deletion."
                    },
                    {
                        "type": "heading",
                        "text": "Example 13: Delete Duplicates (Keep One)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial Contacts table:"
                    },
                    {
                        "type": "table",
                        "headers": ["CID", "Email", "Name"],
                        "rows": [
                            [1, "a@example.com", "A"],
                            [2, "b@example.com", "B"],
                            [3, "a@example.com", "A2"]
                        ]
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "DELETE FROM Contacts a\nUSING Contacts b\nWHERE a.Email = b.Email AND a.CID > b.CID;"
                    },
                    {
                        "type": "paragraph",
                        "text": "After deletion (duplicate email removed, keeping lowest CID):"
                    },
                    {
                        "type": "table",
                        "headers": ["CID", "Email", "Name"],
                        "rows": [
                            [1, "a@example.com", "A"],
                            [2, "b@example.com", "B"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: Pattern varies by DBMS (PostgreSQL uses USING, MySQL uses JOIN)."
                    },
                    {
                        "type": "heading",
                        "text": "Best Practices & Tips"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Always preview using SELECT before DELETE.",
                            "Back up data before big deletes.",
                            "Use transactions and SAVEPOINTs for safety.",
                            "Consider batching deletes to prevent huge locks and log growth.",
                            "Use foreign key CASCADE only when referential cascading is intended.",
                            "Test DELETE statements on a copy of production data first.",
                            "Monitor performance for large deletes and consider batch processing."
                        ]
                    }
                ]
            },
            {
                name: "SQL WHERE Clause",
                content: [
                    {
                        "type": "paragraph",
                        "text": "The WHERE clause filters rows before processing. It is used with SELECT, UPDATE, and DELETE to restrict which rows are affected. Without WHERE, all rows are processed."
                    },
                    {
                        "type": "heading",
                        "text": "Purpose of WHERE"
                    },
                    {
                        "type": "paragraph",
                        "text": "WHERE is used to filter records based on a condition. It prevents full-table updates or deletions and allows selective extraction of rows."
                    },
                    {
                        "type": "heading",
                        "text": "Sample Table: Customers"
                    },
                    {
                        "type": "table",
                        "headers": ["CustID", "Name", "Country", "Age", "Phone"],
                        "rows": [
                            [1, "Arin", "Norway", 25, "4711223344"],
                            [2, "Mila", "Portugal", 23, "3519988776"],
                            [3, "Yuto", "Japan", 26, "8112345566"],
                            [4, "Lara", "Brazil", 30, "NULL"],
                            [5, "Jonah", "Sweden", 21, "4612334455"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "1. Comparison Operators"
                    },
                    {
                        "type": "paragraph",
                        "text": "Comparison operators include: = (equal), != or <> (not equal), > (greater than), < (less than), >= (greater than or equal), <= (less than or equal)."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT * FROM Customers WHERE Age > 24;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["CustID", "Name", "Country", "Age", "Phone"],
                        "rows": [
                            [1, "Arin", "Norway", 25, "4711223344"],
                            [3, "Yuto", "Japan", 26, "8112345566"],
                            [4, "Lara", "Brazil", 30, "NULL"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2. Logical Operators (AND/OR/NOT)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Logical operators combine multiple conditions: AND (both must be true), OR (at least one must be true), NOT (negates a condition)."
                    },
                    {
                        "type": "heading",
                        "text": "Example with OR:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT Name, Country, Age FROM Customers\nWHERE Country = 'Japan' OR Age > 28;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Name", "Country", "Age"],
                        "rows": [
                            ["Yuto", "Japan", 26],
                            ["Lara", "Brazil", 30]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example with AND:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT * FROM Customers\nWHERE Country = 'Sweden' AND Age < 25;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["CustID", "Name", "Country", "Age", "Phone"],
                        "rows": [
                            [5, "Jonah", "Sweden", 21, "4612334455"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "3. IN Operator"
                    },
                    {
                        "type": "paragraph",
                        "text": "The IN operator checks if a value matches any value in a list. It's a shorthand for multiple OR conditions."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT * FROM Customers\nWHERE Country IN ('Portugal', 'Brazil');"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["CustID", "Name", "Country", "Age", "Phone"],
                        "rows": [
                            [2, "Mila", "Portugal", 23, "3519988776"],
                            [4, "Lara", "Brazil", 30, "NULL"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "4. BETWEEN Operator"
                    },
                    {
                        "type": "paragraph",
                        "text": "BETWEEN selects values within a range (inclusive). It works with numbers, dates, and text."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT Name, Age FROM Customers\nWHERE Age BETWEEN 22 AND 28;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Name", "Age"],
                        "rows": [
                            ["Arin", 25],
                            ["Mila", 23],
                            ["Yuto", 26]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "5. LIKE Operator"
                    },
                    {
                        "type": "paragraph",
                        "text": "LIKE is used for pattern matching with wildcards: % (matches any sequence of characters), _ (matches single character)."
                    },
                    {
                        "type": "heading",
                        "text": "Example: Names starting with 'A'"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT Name FROM Customers WHERE Name LIKE 'A%';"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Name"],
                        "rows": [
                            ["Arin"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example: Names ending with 'a'"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT Name FROM Customers WHERE Name LIKE '%a';"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Name"],
                        "rows": [
                            ["Mila"],
                            ["Lara"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "6. IS NULL / IS NOT NULL"
                    },
                    {
                        "type": "paragraph",
                        "text": "IS NULL checks for missing values. Use IS NOT NULL to find rows with values. Note: NULL cannot be compared using = or !=."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT * FROM Customers WHERE Phone IS NULL;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["CustID", "Name", "Country", "Age", "Phone"],
                        "rows": [
                            [4, "Lara", "Brazil", 30, "NULL"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "7. Subquery in WHERE"
                    },
                    {
                        "type": "paragraph",
                        "text": "A subquery can be used in WHERE to filter based on calculated values or data from other queries."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT * FROM Customers\nWHERE Age > (SELECT AVG(Age) FROM Customers);"
                    },
                    {
                        "type": "paragraph",
                        "text": "This finds customers older than the average age (25)."
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["CustID", "Name", "Country", "Age", "Phone"],
                        "rows": [
                            [3, "Yuto", "Japan", 26, "8112345566"],
                            [4, "Lara", "Brazil", 30, "NULL"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Summary of WHERE Operators"
                    },
                    {
                        "type": "table",
                        "headers": ["Operator", "Description", "Example"],
                        "rows": [
                            ["=, !=, <, >, <=, >=", "Comparison operators", "Age > 25"],
                            ["AND, OR, NOT", "Logical operators", "Age > 20 AND Country = 'Japan'"],
                            ["IN", "Match any value in list", "Country IN ('Japan', 'Brazil')"],
                            ["BETWEEN", "Range check (inclusive)", "Age BETWEEN 20 AND 30"],
                            ["LIKE", "Pattern matching", "Name LIKE 'A%'"],
                            ["IS NULL", "Check for NULL values", "Phone IS NULL"],
                            ["Subquery", "Filter using another query", "Age > (SELECT AVG(Age) FROM T)"]
                        ]
                    }
                ]
            },
            {
                name: "SQL Aliases",
                content: [
                    {
                        "type": "paragraph",
                        "text": "SQL Aliases provide temporary alternative names to columns or tables within a query. They improve readability, simplify JOINs, rename calculated fields, and are required for subqueries. Aliases do not alter actual database schema; they exist only during execution of the query."
                    },
                    {
                        "type": "heading",
                        "text": "What Are Aliases?"
                    },
                    {
                        "type": "paragraph",
                        "text": "Aliases in SQL are temporary names given to columns or tables for the duration of a query. They make complex queries easier to write and read. Aliases can be applied to columns, tables, derived tables, expressions, and aggregate functions."
                    },
                    {
                        "type": "heading",
                        "text": "Why Aliases Are Used"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Make column headings more readable.",
                            "Shorten long or technical column names.",
                            "Rename calculated columns.",
                            "Simplify multi-table JOIN queries.",
                            "Resolve naming conflicts when tables have same column names.",
                            "Aliases are required when using subqueries or derived tables.",
                            "Useful in self-joins where the same table needs two identifiers."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Types of Aliases"
                    },
                    {
                        "type": "paragraph",
                        "text": "SQL supports two main alias types: Column Aliases and Table Aliases. Column aliases rename output values, while table aliases simplify table references."
                    },
                    {
                        "type": "heading",
                        "text": "Column Aliases"
                    },
                    {
                        "type": "paragraph",
                        "text": "Column aliases rename columns in the result set. Syntax options:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- With AS keyword\nSELECT column_name AS alias_name FROM table_name;\n\n-- Without AS keyword\nSELECT column_name alias_name FROM table_name;"
                    },
                    {
                        "type": "heading",
                        "text": "Example 1: Simple Column Alias"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT CustomerName AS Buyer, Amount AS TotalAmount\nFROM Orders;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Buyer", "TotalAmount"],
                        "rows": [
                            ["Arin", 300],
                            ["Mila", 450],
                            ["Yuto", 200]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 2: Alias Without AS Keyword"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT CustomerName Buyer, Amount Total FROM Orders;"
                    },
                    {
                        "type": "paragraph",
                        "text": "This produces the same result as Example 1. The AS keyword is optional but recommended for clarity."
                    },
                    {
                        "type": "heading",
                        "text": "Example 3: Alias for Calculated Columns"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT CustomerName, Amount * 1.18 AS FinalAmount\nFROM Orders;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["CustomerName", "FinalAmount"],
                        "rows": [
                            ["Arin", 354],
                            ["Mila", 531],
                            ["Yuto", 236]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 4: Alias with Spaces"
                    },
                    {
                        "type": "paragraph",
                        "text": "Use quotes when alias contains spaces or special characters."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT Name AS \"Customer Name\", Age AS \"Years Old\"\nFROM Users;"
                    },
                    {
                        "type": "heading",
                        "text": "Example 5: Alias with CASE Expression"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT Name,\n       CASE WHEN Age >= 18 THEN 'Adult' ELSE 'Minor' END AS Category\nFROM Members;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Name", "Category"],
                        "rows": [
                            ["Zoya", "Adult"],
                            ["Leo", "Minor"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Table Aliases"
                    },
                    {
                        "type": "paragraph",
                        "text": "Table aliases shorten table names and make JOIN conditions cleaner. They are required in self-joins and derived tables."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- With AS keyword\nSELECT columns FROM table_name AS alias;\n\n-- Without AS keyword\nSELECT columns FROM table_name alias;"
                    },
                    {
                        "type": "heading",
                        "text": "Example 6: Table Alias in JOIN"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT c.Name, o.Amount\nFROM Customers c\nJOIN Orders o ON c.CustID = o.CustID;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Name", "Amount"],
                        "rows": [
                            ["Arin", 300],
                            ["Mila", 450],
                            ["Yuto", 200]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 7: Self Join Using Aliases"
                    },
                    {
                        "type": "paragraph",
                        "text": "Self joins require aliases to differentiate the same table used twice."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT A.Name AS FirstPerson, B.Name AS SecondPerson\nFROM Employees A\nJOIN Employees B ON A.ManagerID = B.EmpID;"
                    },
                    {
                        "type": "heading",
                        "text": "Example 8: Alias Required for Subquery"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT * FROM (\n    SELECT Name, Age FROM Customers\n) AS TempTable;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Every derived table must have an alias. Without one, SQL throws an error."
                    },
                    {
                        "type": "heading",
                        "text": "Alias Execution Rules (Important)"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Column aliases cannot be used in WHERE clause because WHERE is evaluated before SELECT.",
                            "Column aliases CAN be used in ORDER BY and GROUP BY because these occur after SELECT.",
                            "Once a table alias is assigned, the original table name cannot be used in the same query.",
                            "Aliases are temporary—only for query execution."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Invalid Use of Alias in WHERE"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- This will cause an ERROR\nSELECT Salary AS Pay FROM Staff WHERE Pay > 50000;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Error reason: WHERE executes before SELECT, so alias 'Pay' is not recognized."
                    },
                    {
                        "type": "heading",
                        "text": "Correct Use of Alias in ORDER BY"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT Name, Age AS Years\nFROM Customers\nORDER BY Years DESC;"
                    },
                    {
                        "type": "paragraph",
                        "text": "This works because ORDER BY is evaluated after SELECT."
                    },
                    {
                        "type": "heading",
                        "text": "Common Mistakes"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Using column alias inside WHERE clause.",
                            "Forgetting alias for derived table.",
                            "Using alias without quotes when it contains spaces.",
                            "Using alias names starting with numbers.",
                            "Referencing original table name after alias has been assigned."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Complex Query Demonstrating Aliases"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT c.Name AS CustomerName,\n       o.OrderDate AS \"Date of Order\",\n       o.Amount AS TotalBill,\n       p.ProductName AS Item\nFROM Customers c\nJOIN Orders o ON c.CustID = o.CustID\nJOIN Products p ON o.ProductID = p.ProductID\nWHERE o.Amount > 200\nORDER BY TotalBill DESC;"
                    },
                    {
                        "type": "paragraph",
                        "text": "This query uses table aliases (c, o, p) and column aliases to produce clean, readable output."
                    },
                    {
                        "type": "heading",
                        "text": "Summary Table"
                    },
                    {
                        "type": "table",
                        "headers": ["Alias Type", "Purpose", "Allowed in WHERE", "Allowed in ORDER BY", "Required"],
                        "rows": [
                            ["Column Alias", "Rename output columns", "No", "Yes", "Optional"],
                            ["Table Alias", "Shorten table names", "Yes", "Yes", "Optional"],
                            ["Derived Table Alias", "Name subqueries", "-", "-", "Mandatory"],
                            ["Self Join Alias", "Differentiate same table", "-", "-", "Mandatory"]
                        ]
                    }
                ]
            },
            {
                name: "SQL JOINS — INNER, LEFT, RIGHT, FULL, NATURAL",
                content: [
                    {
                        "type": "paragraph",
                        "text": "A JOIN combines rows from two (or more) tables based on a related column between them. Joins let you reconstruct normalized data to answer queries that require columns from multiple tables. Major join types: INNER (JOIN), LEFT (LEFT OUTER), RIGHT (RIGHT OUTER), FULL (FULL OUTER), and NATURAL JOIN."
                    },
                    {
                        "type": "heading",
                        "text": "Common Terminology"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Join condition: Predicate that specifies how rows from two tables match (e.g., t1.col = t2.col).",
                            "Matching rows: Rows from both tables where the join condition is true.",
                            "Non-matching rows: Rows from one table with no corresponding row in the other table.",
                            "Outer join: A join that returns non-matching rows from one or both sides (LEFT, RIGHT, FULL).",
                            "Inner join: A join that returns only matching rows from both tables.",
                            "NULL handling: When an outer join returns a non-matching row, columns from the missing side are NULL."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Sample Tables (Used in Examples)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Student table:"
                    },
                    {
                        "type": "table",
                        "headers": ["StudentID", "StudentName", "City"],
                        "rows": [
                            [1, "Asha", "Pune"],
                            [2, "Ravi", "Bengaluru"],
                            [3, "Nora", "Zagreb"],
                            [4, "Leo", "Lagos"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "StudentCourse table:"
                    },
                    {
                        "type": "table",
                        "headers": ["EnrollID", "StudentID", "CourseCode"],
                        "rows": [
                            [101, 1, "CS101"],
                            [102, 1, "MATH11"],
                            [103, 3, "CS101"],
                            [104, 5, "HIST01"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: StudentCourse contains an enrollment for StudentID = 5 (a student not in Student table) to demonstrate non-matching rows."
                    },
                    {
                        "type": "heading",
                        "text": "1. INNER JOIN (a.k.a. JOIN)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Returns rows where the join condition matches in both tables. Rows without matches on either side are excluded."
                    },
                    {
                        "type": "heading",
                        "text": "Syntax:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT <cols> FROM A INNER JOIN B ON A.key = B.key;\n-- INNER is optional\nSELECT <cols> FROM A JOIN B ON A.key = B.key;"
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT s.StudentID, s.StudentName, sc.CourseCode\nFROM Student s\nJOIN StudentCourse sc ON s.StudentID = sc.StudentID;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Find students who have course enrollments. Uses table aliases s and sc for brevity."
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["StudentID", "StudentName", "CourseCode"],
                        "rows": [
                            [1, "Asha", "CS101"],
                            [1, "Asha", "MATH11"],
                            [3, "Nora", "CS101"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Venn diagram: Intersection of Student and StudentCourse sets (only matching StudentID). INNER JOIN removes rows for StudentID = 4 (Leo) and StudentID = 5 enrollment because they have no pair in the other table."
                    },
                    {
                        "type": "heading",
                        "text": "2. LEFT JOIN (LEFT OUTER JOIN)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Returns all rows from the left table (A). When there is a match in the right table (B), columns from B are filled; when there is no match, B's columns are NULL."
                    },
                    {
                        "type": "heading",
                        "text": "Syntax:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT <cols> FROM A LEFT JOIN B ON A.key = B.key;\nSELECT <cols> FROM A LEFT OUTER JOIN B ON A.key = B.key;"
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT s.StudentID, s.StudentName, sc.CourseCode\nFROM Student s\nLEFT JOIN StudentCourse sc ON s.StudentID = sc.StudentID\nORDER BY s.StudentID;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Show every student and their course(s), if any. Students with no enrollments still appear with NULL CourseCode."
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["StudentID", "StudentName", "CourseCode"],
                        "rows": [
                            [1, "Asha", "CS101"],
                            [1, "Asha", "MATH11"],
                            [2, "Ravi", "NULL"],
                            [3, "Nora", "CS101"],
                            [4, "Leo", "NULL"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Venn diagram: Entire left circle (Student) fully preserved; intersection rows show matched enrollments, non-matching right side columns are NULL. LEFT JOIN is useful for 'show me everything in A and any matching data in B' queries."
                    },
                    {
                        "type": "heading",
                        "text": "3. RIGHT JOIN (RIGHT OUTER JOIN)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Returns all rows from the right table (B). When there is a match in the left table (A), columns from A are included; otherwise A's columns are NULL."
                    },
                    {
                        "type": "heading",
                        "text": "Syntax:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT <cols> FROM A RIGHT JOIN B ON A.key = B.key;\nSELECT <cols> FROM A RIGHT OUTER JOIN B ON A.key = B.key;"
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT s.StudentID, s.StudentName, sc.CourseCode\nFROM Student s\nRIGHT JOIN StudentCourse sc ON s.StudentID = sc.StudentID\nORDER BY sc.EnrollID;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Show every enrollment and the associated student if the student exists; if the student record is missing, the student columns become NULL."
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["StudentID", "StudentName", "CourseCode"],
                        "rows": [
                            [1, "Asha", "CS101"],
                            [1, "Asha", "MATH11"],
                            [3, "Nora", "CS101"],
                            ["NULL", "NULL", "HIST01"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Venn diagram: Right circle (StudentCourse) fully preserved; unmatched left table columns are NULL. RIGHT JOIN is the mirror of LEFT JOIN."
                    },
                    {
                        "type": "heading",
                        "text": "4. FULL JOIN (FULL OUTER JOIN)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Returns rows when there is a match in either left or right table. Non-matching columns on either side are filled with NULL. Effectively the union of LEFT and RIGHT joins."
                    },
                    {
                        "type": "heading",
                        "text": "Syntax:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT <cols> FROM A FULL JOIN B ON A.key = B.key;\nSELECT <cols> FROM A FULL OUTER JOIN B ON A.key = B.key;"
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT s.StudentID, s.StudentName, sc.StudentID AS EnrolledStudentID, sc.CourseCode\nFROM Student s\nFULL JOIN StudentCourse sc ON s.StudentID = sc.StudentID\nORDER BY COALESCE(s.StudentID, sc.StudentID);"
                    },
                    {
                        "type": "paragraph",
                        "text": "List all students and all enrollments. Rows without a matching counterpart show NULLs on the missing side."
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["StudentID", "StudentName", "EnrolledStudentID", "CourseCode"],
                        "rows": [
                            [1, "Asha", 1, "CS101"],
                            [1, "Asha", 1, "MATH11"],
                            [2, "Ravi", "NULL", "NULL"],
                            [3, "Nora", 3, "CS101"],
                            [4, "Leo", "NULL", "NULL"],
                            ["NULL", "NULL", 5, "HIST01"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Venn diagram: Union of left and right sets; intersection rows appear once, non-matches from either side included with NULLs. Not all RDBMS implement FULL JOIN (e.g., MySQL historically lacked it)."
                    },
                    {
                        "type": "heading",
                        "text": "5. NATURAL JOIN"
                    },
                    {
                        "type": "paragraph",
                        "text": "A NATURAL JOIN is a specialized INNER JOIN that automatically joins on all columns with the same name and compatible data types in both tables. Common columns appear only once in the result set."
                    },
                    {
                        "type": "paragraph",
                        "text": "Sample tables for NATURAL JOIN example:"
                    },
                    {
                        "type": "paragraph",
                        "text": "Employee table:"
                    },
                    {
                        "type": "table",
                        "headers": ["EmpID", "EmpName", "DeptID"],
                        "rows": [
                            [1, "Tara", 10],
                            [2, "Owen", 20],
                            [3, "Rui", 10]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Department table:"
                    },
                    {
                        "type": "table",
                        "headers": ["DeptID", "DeptName"],
                        "rows": [
                            [10, "Research"],
                            [20, "Support"],
                            [30, "Legal"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT * FROM Employee NATURAL JOIN Department;"
                    },
                    {
                        "type": "paragraph",
                        "text": "NATURAL JOIN finds DeptID common to both tables and returns EmpID, EmpName, DeptID, DeptName with DeptID only once."
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["EmpID", "EmpName", "DeptID", "DeptName"],
                        "rows": [
                            [1, "Tara", 10, "Research"],
                            [3, "Rui", 10, "Research"],
                            [2, "Owen", 20, "Support"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Warning: NATURAL JOIN hides the join condition and can break if columns are renamed or new same-named columns are added. Prefer explicit JOIN ... ON ... for clarity in production code."
                    },
                    {
                        "type": "heading",
                        "text": "Visual Venn Diagram Descriptions"
                    },
                    {
                        "type": "list",
                        "items": [
                            "INNER JOIN: Only the overlapping/intersection area of the two circles (rows present in both tables).",
                            "LEFT JOIN: Entire left circle plus the intersection; right-only area excluded (right columns NULL for left-only rows).",
                            "RIGHT JOIN: Entire right circle plus the intersection; left-only area excluded (left columns NULL for right-only rows).",
                            "FULL JOIN: Both circles fully included — intersection and both left-only and right-only areas."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "NULL Handling in Different Joins"
                    },
                    {
                        "type": "list",
                        "items": [
                            "INNER JOIN: No NULLs due to missing matches are returned because only matches are included.",
                            "LEFT JOIN: Non-matching right-side columns become NULL for left-only rows.",
                            "RIGHT JOIN: Non-matching left-side columns become NULL for right-only rows.",
                            "FULL JOIN: NULLs appear on either side wherever a match is missing.",
                            "When filtering on columns that may be NULL after an outer join, use explicit IS NULL / IS NOT NULL checks or wrap in COALESCE."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example with COALESCE:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT s.StudentID, COALESCE(sc.CourseCode, 'NoCourse') AS Course\nFROM Student s\nLEFT JOIN StudentCourse sc ON s.StudentID = sc.StudentID;"
                    },
                    {
                        "type": "heading",
                        "text": "Database Normalization & Why Joins Are Common"
                    },
                    {
                        "type": "paragraph",
                        "text": "Normalization splits data into multiple tables to avoid redundancy and update anomalies (e.g., storing student details separate from enrollments or marks). Joins reconstruct normalized data for queries — they are the normal, expected operation in relational databases."
                    },
                    {
                        "type": "list",
                        "items": [
                            "Eliminates repeating groups and redundancy",
                            "Enables consistent updates (single place to update a student's address)",
                            "Reduces storage and anomalies"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Syntax Variations & Important Notes"
                    },
                    {
                        "type": "list",
                        "items": [
                            "JOIN vs INNER JOIN: JOIN defaults to INNER JOIN. Both are equivalent syntactically.",
                            "LEFT JOIN vs LEFT OUTER JOIN: LEFT OUTER JOIN is the full name; LEFT JOIN is shorthand. Behavior identical.",
                            "RIGHT JOIN vs RIGHT OUTER JOIN: RIGHT JOIN is shorthand. Use LEFT JOIN on swapped tables if your DBMS lacks RIGHT JOIN.",
                            "USING clause: When tables share a column name, you can write: FROM A JOIN B USING (shared_col).",
                            "ON vs WHERE: Join match conditions should be placed in ON; additional filters on the combined result can go in WHERE."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Common Pitfall: WHERE After Outer Join"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- This will filter out left-only rows\nSELECT s.StudentID, sc.CourseCode\nFROM Student s\nLEFT JOIN StudentCourse sc ON s.StudentID = sc.StudentID\nWHERE sc.CourseCode = 'CS101';"
                    },
                    {
                        "type": "paragraph",
                        "text": "The WHERE condition requires sc.CourseCode to match 'CS101', which filters out left-only rows. To keep left-only rows and still filter joined rows, put the filter in the ON clause."
                    },
                    {
                        "type": "heading",
                        "text": "Performance Considerations"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Ensure join columns are indexed when joining large tables for performance.",
                            "Be careful with joining many large tables — results grow multiplicatively when 1-to-many relationships exist.",
                            "Use SELECT only the columns you need (avoid SELECT * in production).",
                            "For FULL JOIN alternatives, use UNION of LEFT and RIGHT when DBMS lacks FULL support."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Common Pitfalls & Checklist"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Always verify join keys — ensure same data type and matching semantics.",
                            "Preview rows with SELECT before applying transformations based on joins.",
                            "Be explicit when you need to preserve non-matching rows (use LEFT/RIGHT/FULL).",
                            "Watch WHERE filters after an outer join — they can remove outer-rows unintentionally.",
                            "When using NATURAL JOIN, confirm there are no unintended identically-named columns."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Summary Table"
                    },
                    {
                        "type": "table",
                        "headers": ["Join Type", "Returns", "NULL Handling", "Use Case"],
                        "rows": [
                            ["INNER JOIN", "Only matching rows", "No NULLs from join", "Find related data in both tables"],
                            ["LEFT JOIN", "All left + matching right", "Right cols NULL if no match", "Show all A, with B if exists"],
                            ["RIGHT JOIN", "All right + matching left", "Left cols NULL if no match", "Show all B, with A if exists"],
                            ["FULL JOIN", "All from both tables", "NULLs on either side", "Complete reconciliation"],
                            ["NATURAL JOIN", "Auto-join on same names", "No NULLs from join", "Quick join (use with caution)"]
                        ]
                    }
                ]
            },
            {
                name: "SQL CROSS JOIN",
                content: [
                    {
                        "type": "paragraph",
                        "text": "A CROSS JOIN creates a Cartesian product between two tables, generating all possible combinations of rows. It does not require a join condition and multiplies the number of rows from both tables."
                    },
                    {
                        "type": "heading",
                        "text": "Definition"
                    },
                    {
                        "type": "list",
                        "items": [
                            "CROSS JOIN produces a Cartesian product of two tables.",
                            "Every row from the first table is paired with every row from the second table.",
                            "No join condition is used.",
                            "Result set size = (rows in Table A) × (rows in Table B)."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "When It Is Used"
                    },
                    {
                        "type": "paragraph",
                        "text": "CROSS JOIN is useful when you need all combinations of data from two sets, such as generating schedules, pairing team members, creating matrix-style data, or exploring all possible matches."
                    },
                    {
                        "type": "heading",
                        "text": "Syntax"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- Explicit CROSS JOIN\nSELECT * FROM table1 CROSS JOIN table2;\n\n-- Implicit cross join (comma syntax)\nSELECT * FROM table1, table2;"
                    },
                    {
                        "type": "heading",
                        "text": "Sample Tables Used in Example"
                    },
                    {
                        "type": "paragraph",
                        "text": "Customer table:"
                    },
                    {
                        "type": "table",
                        "headers": ["CustID", "CustomerName"],
                        "rows": [
                            [1, "Asha"],
                            [2, "Ravi"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Orders table:"
                    },
                    {
                        "type": "table",
                        "headers": ["OrderID", "Product"],
                        "rows": [
                            [10, "Notebook"],
                            [11, "Pen"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Visual explanation: Customer has 2 rows; Orders has 2 rows → CROSS JOIN will generate 2 × 2 = 4 rows."
                    },
                    {
                        "type": "heading",
                        "text": "Practical Example"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT c.CustID, c.CustomerName, o.OrderID, o.Product\nFROM Customer c\nCROSS JOIN Orders o;"
                    },
                    {
                        "type": "paragraph",
                        "text": "This query pairs each customer with every order, creating all possible combinations."
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["CustID", "CustomerName", "OrderID", "Product"],
                        "rows": [
                            [1, "Asha", 10, "Notebook"],
                            [1, "Asha", 11, "Pen"],
                            [2, "Ravi", 10, "Notebook"],
                            [2, "Ravi", 11, "Pen"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Visual Representation"
                    },
                    {
                        "type": "paragraph",
                        "text": "Think of CROSS JOIN as drawing a grid. Every row in table A intersects with every row in table B."
                    },
                    {
                        "type": "list",
                        "items": [
                            "Customer table forms rows on the vertical axis.",
                            "Orders table forms columns on the horizontal axis.",
                            "Each intersection point becomes a result row (Cartesian product)."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Mathematical Explanation"
                    },
                    {
                        "type": "list",
                        "items": [
                            "If Table A has N rows and Table B has M rows,",
                            "Total rows returned = N × M",
                            "Example: Customer (2 rows) × Orders (2 rows) = 4 rows"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Key Characteristics"
                    },
                    {
                        "type": "list",
                        "items": [
                            "No join condition required.",
                            "Always expands number of rows unless one table is empty.",
                            "Simplest join syntax in SQL.",
                            "Can be combined with WHERE to filter the Cartesian result.",
                            "Useful for generating complete pairings or lookup matrices."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Use Cases"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Creating every possible pairing of two sets (e.g., employee × shift schedules).",
                            "Generating test data or permutations.",
                            "Building all possible combinations of attributes.",
                            "Creating comparison matrices between two datasets.",
                            "Exploring relationship possibilities when no join condition exists."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "CROSS JOIN vs Other Joins"
                    },
                    {
                        "type": "table",
                        "headers": ["Join Type", "Join Condition", "Result"],
                        "rows": [
                            ["INNER JOIN", "Required", "Matching rows only"],
                            ["LEFT/RIGHT JOIN", "Required", "Includes unmatched rows with NULLs"],
                            ["FULL JOIN", "Required", "All rows from both tables"],
                            ["CROSS JOIN", "None", "All combinations (Cartesian product)"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "⚠️ Warning: CROSS JOIN can be very large in size; always be careful when using with large tables. A table with 1,000 rows crossed with another table of 1,000 rows produces 1,000,000 rows!"
                    },
                    {
                        "type": "heading",
                        "text": "Example: Filtering CROSS JOIN with WHERE"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT c.CustomerName, o.Product\nFROM Customer c\nCROSS JOIN Orders o\nWHERE o.Product = 'Pen';"
                    },
                    {
                        "type": "paragraph",
                        "text": "This filters the Cartesian product to show only combinations where Product is 'Pen'."
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["CustomerName", "Product"],
                        "rows": [
                            ["Asha", "Pen"],
                            ["Ravi", "Pen"]
                        ]
                    }
                ]
            },
            {
                name: "SQL Date Functions",
                content: [
                    {
                        "type": "paragraph",
                        "text": "SQL Date Functions are used to extract, manipulate, and compute date and time values. These functions help format dates, calculate intervals, extract specific components, and track time-related operations in business applications."
                    },
                    {
                        "type": "heading",
                        "text": "Introduction to Date Functions"
                    },
                    {
                        "type": "paragraph",
                        "text": "Date Functions in SQL allow handling, modifying, formatting, and analyzing date/time values. These functions are widely used for reporting, scheduling, sales analysis, and business operations."
                    },
                    {
                        "type": "list",
                        "items": [
                            "Extract specific date parts such as year, month, and day",
                            "Format dates into readable text for reports",
                            "Calculate deadlines, validity periods, and upcoming events",
                            "Analyze sales trends over time",
                            "Compute time differences like days until delivery"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Sample Table Used in Examples"
                    },
                    {
                        "type": "paragraph",
                        "text": "Sales table:"
                    },
                    {
                        "type": "table",
                        "headers": ["sale_id", "product_name", "sale_date"],
                        "rows": [
                            [1, "Notebook", "2024-03-20 10:15:00"],
                            [2, "Backpack", "2024-03-22 14:45:00"],
                            [3, "Marker Set", "2024-03-25 09:30:00"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "A. Current Date & Time Functions"
                    },
                    {
                        "type": "heading",
                        "text": "1. NOW() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Returns the current system date and time (YYYY-MM-DD HH:MM:SS). Used to record transaction timestamps, track login time, and generate system logs."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT NOW() AS current_timestamp;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["current_timestamp"],
                        "rows": [
                            ["2025-02-15 12:45:32"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2. CURDATE() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Returns the current date in YYYY-MM-DD format. Used to find today's entries and compare sale dates with current date."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT CURDATE() AS todays_date;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["todays_date"],
                        "rows": [
                            ["2025-02-15"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "3. CURTIME() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Returns the current system time (HH:MM:SS). Used to track event time and display server time in dashboards."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT CURTIME() AS current_time;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["current_time"],
                        "rows": [
                            ["12:45:32"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "B. Date Extraction Functions"
                    },
                    {
                        "type": "heading",
                        "text": "4. DATE() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Extracts the date portion from a DATETIME value, removing the time part."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT sale_id, DATE(sale_date) AS sale_day FROM Sales;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["sale_id", "sale_day"],
                        "rows": [
                            [1, "2024-03-20"],
                            [2, "2024-03-22"],
                            [3, "2024-03-25"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "5. EXTRACT() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Retrieves a specific part of a date (such as YEAR, MONTH, or DAY)."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT sale_id, EXTRACT(YEAR FROM sale_date) AS sale_year FROM Sales;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["sale_id", "sale_year"],
                        "rows": [
                            [1, 2024],
                            [2, 2024],
                            [3, 2024]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "6. DATE_FORMAT() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Formats a date based on custom patterns using %W (weekday), %M (month), %d (day), %Y (year), etc."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT sale_id, DATE_FORMAT(sale_date, '%W, %M %d, %Y') AS formatted_date\nFROM Sales;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["sale_id", "formatted_date"],
                        "rows": [
                            [1, "Wednesday, March 20, 2024"],
                            [2, "Friday, March 22, 2024"],
                            [3, "Monday, March 25, 2024"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Formatting Patterns:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "%W - Full weekday name",
                            "%M - Full month name",
                            "%d - Day of month",
                            "%Y - Four-digit year"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "C. Date Arithmetic Functions"
                    },
                    {
                        "type": "heading",
                        "text": "7. DATE_ADD() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Adds a time interval to a date value."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT sale_id, DATE_ADD(sale_date, INTERVAL 7 DAY) AS new_date FROM Sales;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["sale_id", "new_date"],
                        "rows": [
                            [1, "2024-03-27 10:15:00"],
                            [2, "2024-03-29 14:45:00"],
                            [3, "2024-04-01 09:30:00"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "8. DATE_SUB() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Subtracts a time interval from a date value."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT sale_id, DATE_SUB(sale_date, INTERVAL 3 DAY) AS earlier_date FROM Sales;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["sale_id", "earlier_date"],
                        "rows": [
                            [1, "2024-03-17 10:15:00"],
                            [2, "2024-03-19 14:45:00"],
                            [3, "2024-03-22 09:30:00"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "9. DATEDIFF() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Returns the number of days between two dates."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT DATEDIFF('2024-08-15', '2024-03-20') AS days_until_event;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["days_until_event"],
                        "rows": [
                            [148]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "10. ADDDATE() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Alternative to DATE_ADD(); adds an interval to a date."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT sale_id, ADDDATE(sale_date, INTERVAL 10 DAY) AS plus_ten FROM Sales;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["sale_id", "plus_ten"],
                        "rows": [
                            [1, "2024-03-30 10:15:00"],
                            [2, "2024-04-01 14:45:00"],
                            [3, "2024-04-04 09:30:00"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "11. ADDTIME() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Adds a time interval to a TIME or DATETIME value."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT ADDTIME('10:00:00', '02:30:00') AS new_time;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["new_time"],
                        "rows": [
                            ["12:30:00"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Interval Types Used"
                    },
                    {
                        "type": "list",
                        "items": [
                            "DAY — Adds or subtracts days",
                            "HOUR — Adds hours",
                            "MINUTE — Adds minutes",
                            "SECOND — Adds seconds",
                            "MONTH — Month-level arithmetic",
                            "YEAR — Year-level arithmetic"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Additional Practical Examples"
                    },
                    {
                        "type": "heading",
                        "text": "Example 1: Extracting Month Name"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT sale_id, DATE_FORMAT(sale_date, '%M') AS month_name FROM Sales;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["sale_id", "month_name"],
                        "rows": [
                            [1, "March"],
                            [2, "March"],
                            [3, "March"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 2: Calculate Delivery Date (5 days after sale)"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT sale_id, DATE_ADD(sale_date, INTERVAL 5 DAY) AS delivery_date FROM Sales;"
                    },
                    {
                        "type": "heading",
                        "text": "Example 3: Days Since Sale"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT sale_id, DATEDIFF(NOW(), sale_date) AS days_since_sale FROM Sales;"
                    },
                    {
                        "type": "heading",
                        "text": "Key Takeaways"
                    },
                    {
                        "type": "list",
                        "items": [
                            "SQL provides rich built-in date handling functions.",
                            "DATE(), EXTRACT(), and DATE_FORMAT() are used for extracting and displaying date parts.",
                            "DATE_ADD(), DATE_SUB(), ADDDATE(), and ADDTIME() modify date/time values.",
                            "DATEDIFF() is essential for timelines and duration calculations.",
                            "Date functions are crucial in scheduling, sales tracking, reporting, and analytics."
                        ]
                    }
                ]
            },
            {
                name: "SQL String Functions",
                content: [
                    {
                        "type": "paragraph",
                        "text": "String functions in SQL are used to manipulate, clean, extract, format, search, and compare text data. They are essential for handling names, addresses, user inputs, and other text-based information."
                    },
                    {
                        "type": "heading",
                        "text": "Applications of String Functions"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Managing and formatting names or addresses",
                            "Cleaning inconsistent user input",
                            "Extracting important text segments",
                            "Validating and comparing text values",
                            "Improving data quality and organization"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "A. String Combination & Concatenation"
                    },
                    {
                        "type": "heading",
                        "text": "1. CONCAT() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Combines two or more strings into a single string."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT CONCAT('Arun', ' ', 'Shah') AS full_name;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["full_name"],
                        "rows": [["Arun Shah"]]
                    },
                    {
                        "type": "heading",
                        "text": "2. CONCAT_WS() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Concatenates strings using a specified separator."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT CONCAT_WS('-', '2025', '12', '11') AS formatted_date;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["formatted_date"],
                        "rows": [["2025-12-11"]]
                    },
                    {
                        "type": "heading",
                        "text": "B. String Length & Measurement"
                    },
                    {
                        "type": "heading",
                        "text": "3. CHAR_LENGTH() / CHARACTER_LENGTH() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Returns the number of characters in the string."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT CHAR_LENGTH('Hello SQL') AS length;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["length"],
                        "rows": [[9]]
                    },
                    {
                        "type": "heading",
                        "text": "4. LENGTH() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Returns the length of string in bytes (different for multi-byte characters)."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT LENGTH('Hello') AS byte_length;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["byte_length"],
                        "rows": [[5]]
                    },
                    {
                        "type": "heading",
                        "text": "C. Case Conversion"
                    },
                    {
                        "type": "heading",
                        "text": "5. UPPER() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Converts all characters in a string to uppercase."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT UPPER('sql Functions') AS upper_text;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["upper_text"],
                        "rows": [["SQL FUNCTIONS"]]
                    },
                    {
                        "type": "heading",
                        "text": "6. LOWER() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Converts all characters to lowercase."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT LOWER('SQL Functions') AS lower_text;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["lower_text"],
                        "rows": [["sql functions"]]
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: LCASE() is an alias of LOWER() and performs the same operation."
                    },
                    {
                        "type": "heading",
                        "text": "D. String Manipulation"
                    },
                    {
                        "type": "heading",
                        "text": "7. REPLACE() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Replaces all occurrences of a substring within a string."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT REPLACE('Learn SQL Today', 'SQL', 'Databases') AS replaced;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["replaced"],
                        "rows": [["Learn Databases Today"]]
                    },
                    {
                        "type": "heading",
                        "text": "8. SUBSTRING() / SUBSTR() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Extracts a substring starting from a specific position."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT SUBSTRING('Database Systems', 1, 8) AS extracted;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["extracted"],
                        "rows": [["Database"]]
                    },
                    {
                        "type": "heading",
                        "text": "9. LEFT() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Returns the leftmost characters of a string."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT LEFT('Technology', 4) AS left_part;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["left_part"],
                        "rows": [["Tech"]]
                    },
                    {
                        "type": "heading",
                        "text": "10. RIGHT() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Returns the rightmost characters of a string."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT RIGHT('Technology', 4) AS right_part;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["right_part"],
                        "rows": [["logy"]]
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: MID() is an alternative to SUBSTRING() for extracting part of a string."
                    },
                    {
                        "type": "heading",
                        "text": "11. REVERSE() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Reverses the order of characters in a string."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT REVERSE('Example') AS reversed;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["reversed"],
                        "rows": [["elpmaxE"]]
                    },
                    {
                        "type": "heading",
                        "text": "12. REPEAT() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Repeats a string a given number of times."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT REPEAT('*', 5) AS stars;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["stars"],
                        "rows": [["*****"]]
                    },
                    {
                        "type": "heading",
                        "text": "E. String Search & Position"
                    },
                    {
                        "type": "heading",
                        "text": "13. INSTR() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Returns the first position of a substring inside a string."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT INSTR('Hello SQL World', 'SQL') AS position;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["position"],
                        "rows": [[7]]
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: LOCATE() and POSITION() are alternative methods to find substring position. LOCATE() supports searching from a specific index."
                    },
                    {
                        "type": "heading",
                        "text": "14. FIND_IN_SET() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Returns index of a string in a comma-separated list."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT FIND_IN_SET('SQL', 'HTML,CSS,SQL,Python') AS index_position;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["index_position"],
                        "rows": [[3]]
                    },
                    {
                        "type": "heading",
                        "text": "F. String Cleaning & Trimming"
                    },
                    {
                        "type": "heading",
                        "text": "15. TRIM() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Removes leading and trailing spaces or characters."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT TRIM('   Clean Data   ') AS trimmed;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["trimmed"],
                        "rows": [["Clean Data"]]
                    },
                    {
                        "type": "paragraph",
                        "text": "Related functions: LTRIM() removes leading spaces, RTRIM() removes trailing spaces, and SPACE() generates a specified number of spaces."
                    },
                    {
                        "type": "heading",
                        "text": "G. Padding Functions"
                    },
                    {
                        "type": "heading",
                        "text": "16. LPAD() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Pads the left side of a string with a character to reach a specific length."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT LPAD('95', 5, '0') AS padded;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["padded"],
                        "rows": [["00095"]]
                    },
                    {
                        "type": "heading",
                        "text": "17. RPAD() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Pads the right side of a string."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT RPAD('Hi', 5, '*') AS padded;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["padded"],
                        "rows": [["Hi***"]]
                    },
                    {
                        "type": "heading",
                        "text": "H. Character Encoding & Comparison"
                    },
                    {
                        "type": "heading",
                        "text": "18. ASCII() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Returns the ASCII value of the first character of a string."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT ASCII('A') AS ascii_value;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["ascii_value"],
                        "rows": [[65]]
                    },
                    {
                        "type": "heading",
                        "text": "19. STRCMP() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Compares two strings lexicographically. Returns 0 if equal, -1 if first < second, +1 if first > second."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT STRCMP('Apple', 'Banana') AS comparison_result;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["comparison_result"],
                        "rows": [[-1]]
                    },
                    {
                        "type": "heading",
                        "text": "I. Formatting Functions"
                    },
                    {
                        "type": "heading",
                        "text": "20. FORMAT() Function"
                    },
                    {
                        "type": "paragraph",
                        "text": "Formats numbers as strings using decimal places."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT FORMAT(0.2567 * 100, 2) AS percentage_str;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["percentage_str"],
                        "rows": [["25.67"]]
                    },
                    {
                        "type": "heading",
                        "text": "Key Concepts Summary"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Many functions have multiple names (SUBSTR = SUBSTRING, LCASE = LOWER).",
                            "CHAR_LENGTH returns characters; LENGTH returns bytes.",
                            "Position functions (INSTR, LOCATE, POSITION) return integer indexes.",
                            "Comparison functions (STRCMP) return numeric indicators of order.",
                            "String functions are essential for data cleaning and formatting."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Function Categories Summary"
                    },
                    {
                        "type": "table",
                        "headers": ["Category", "Functions", "Purpose"],
                        "rows": [
                            ["Concatenation", "CONCAT, CONCAT_WS", "Combine strings"],
                            ["Length", "CHAR_LENGTH, LENGTH", "Measure string size"],
                            ["Case Conversion", "UPPER, LOWER, LCASE", "Change text case"],
                            ["Manipulation", "REPLACE, SUBSTRING, LEFT, RIGHT, REVERSE, REPEAT", "Modify and extract text"],
                            ["Search", "INSTR, LOCATE, POSITION, FIND_IN_SET", "Find substring positions"],
                            ["Cleaning", "TRIM, LTRIM, RTRIM, SPACE", "Remove unwanted spaces"],
                            ["Padding", "LPAD, RPAD", "Add characters to reach length"],
                            ["Encoding", "ASCII, STRCMP", "Character codes and comparison"],
                            ["Formatting", "FORMAT", "Number to string conversion"]
                        ]
                    }
                ]
            },
            {
                name: "SQL NOT NULL Constraint",
                content: [
                    {
                        "type": "paragraph",
                        "text": "The NOT NULL constraint in SQL ensures that a column must always contain a value. It prevents NULL entries and guarantees that essential fields always store valid data."
                    },
                    {
                        "type": "heading",
                        "text": "1. NOT NULL Constraint Definition"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Ensures a column cannot contain NULL values.",
                            "Forces mandatory data entry for critical fields.",
                            "Applied at the column level.",
                            "Helps enforce business rules such as required IDs or timestamps."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2. Key Characteristics"
                    },
                    {
                        "type": "list",
                        "items": [
                            "NOT NULL does not enforce uniqueness; it only prevents empty values.",
                            "PRIMARY KEY = NOT NULL + UNIQUE.",
                            "Can be applied while creating the table or later via ALTER TABLE.",
                            "Guarantees presence of data but not correctness or uniqueness."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "3. Syntax and Implementation"
                    },
                    {
                        "type": "heading",
                        "text": "A. During Table Creation"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE table_name (\n    column1 data_type(size) NOT NULL,\n    column2 data_type(size) NOT NULL\n);"
                    },
                    {
                        "type": "heading",
                        "text": "B. Adding NOT NULL Using ALTER TABLE"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "ALTER TABLE table_name\nMODIFY column_name data_type(size) NOT NULL;"
                    },
                    {
                        "type": "heading",
                        "text": "4. Practical Examples"
                    },
                    {
                        "type": "heading",
                        "text": "Example 1: Creating Table with NOT NULL"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE Emp (\n    EmpID INT NOT NULL PRIMARY KEY,\n    Name VARCHAR(50) NOT NULL,\n    Country VARCHAR(50),\n    Age INT,\n    Salary DECIMAL(10,2)\n);"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: EmpID and Name must always have values. EmpID also acts as PRIMARY KEY."
                    },
                    {
                        "type": "heading",
                        "text": "Example 2: Adding NOT NULL to Existing Column"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "ALTER TABLE Emp\nMODIFY Name VARCHAR(50) NOT NULL;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: The Name column becomes mandatory; existing NULL values must be fixed before applying this."
                    },
                    {
                        "type": "heading",
                        "text": "Example 3: Real-World E-commerce Orders Table"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE Orders (\n    OrderID INT PRIMARY KEY,\n    CustomerID INT NOT NULL,\n    ProductID INT NOT NULL,\n    OrderDate DATE NOT NULL,\n    Quantity INT\n);"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: CustomerID, ProductID, and OrderDate cannot be NULL as they are essential for order processing."
                    },
                    {
                        "type": "heading",
                        "text": "5. Use Cases & Applications"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Employee records: Ensuring fields like EmployeeID and Name are always filled.",
                            "E-commerce: Required order details such as customer ID or order date.",
                            "Customer data: Mandatory contact or identity fields.",
                            "Finance systems: Ensuring necessary transaction details are never NULL."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "6. Constraint Behavior"
                    },
                    {
                        "type": "list",
                        "items": [
                            "INSERT fails if NULL is provided to a NOT NULL column.",
                            "UPDATE fails if attempting to set a NOT NULL column to NULL.",
                            "Improves data integrity by enforcing completeness of information."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "7. Comparison with Other Constraints"
                    },
                    {
                        "type": "heading",
                        "text": "NOT NULL vs PRIMARY KEY"
                    },
                    {
                        "type": "paragraph",
                        "text": "PRIMARY KEY prevents NULL and requires uniqueness. NOT NULL only prevents NULL values."
                    },
                    {
                        "type": "heading",
                        "text": "NOT NULL vs UNIQUE"
                    },
                    {
                        "type": "paragraph",
                        "text": "UNIQUE allows NULLs (except some DBs). NOT NULL prevents NULL but doesn't enforce uniqueness."
                    },
                    {
                        "type": "heading",
                        "text": "NOT NULL vs DEFAULT"
                    },
                    {
                        "type": "paragraph",
                        "text": "DEFAULT supplies a value when none is provided. NOT NULL rejects any attempt to insert NULL."
                    },
                    {
                        "type": "heading",
                        "text": "8. Database Design Implications"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Improves data quality by preventing missing values.",
                            "Implements critical business rules within the schema.",
                            "Reduces need for NULL-checking logic in application code.",
                            "Makes SQL queries more reliable since essential fields always contain values."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "9. Implementation Scenarios"
                    },
                    {
                        "type": "list",
                        "items": [
                            "New database design: Define NOT NULL during table creation.",
                            "Schema evolution: Add NOT NULL constraints using ALTER TABLE.",
                            "Data migration: Ensure old records have values before applying constraints.",
                            "Refactoring: Gradually enforce stricter data requirements."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "10. Best Practices"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Apply NOT NULL to all required fields that must NEVER be empty.",
                            "Use PRIMARY KEY + NOT NULL for identity columns.",
                            "Combine NOT NULL with DEFAULT when appropriate.",
                            "Consider NOT NULL for timestamp columns like CreatedAt.",
                            "Ensure existing data is cleaned before adding NOT NULL constraint."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Summary Table"
                    },
                    {
                        "type": "table",
                        "headers": ["Constraint", "Prevents NULL", "Enforces Uniqueness", "Use Case"],
                        "rows": [
                            ["NOT NULL", "Yes", "No", "Mandatory fields"],
                            ["PRIMARY KEY", "Yes", "Yes", "Unique identifiers"],
                            ["UNIQUE", "No (allows NULL)", "Yes", "Unique but optional fields"],
                            ["DEFAULT", "No", "No", "Provide default values"]
                        ]
                    }
                ]
            },
            {
                name: "SQL PRIMARY KEY Constraint",
                content: [
                    {
                        "type": "paragraph",
                        "text": "A PRIMARY KEY uniquely identifies each record in a SQL table. It prevents duplicate and NULL values, ensuring data integrity and enabling relational database structure."
                    },
                    {
                        "type": "heading",
                        "text": "1. PRIMARY KEY Definition & Purpose"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Uniquely identifies each row in a table.",
                            "Prevents duplicate entries and disallows NULL values.",
                            "Ensures strong data integrity in relational databases.",
                            "Serves as a foundation for establishing relationships between tables."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2. Key Properties of PRIMARY KEY"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Enforces uniqueness for every record.",
                            "Primary key columns cannot contain NULL.",
                            "Only one PRIMARY KEY is allowed per table (may be composite).",
                            "Automatically includes UNIQUE constraint behavior.",
                            "Rejects insertion of rows with duplicate primary key values."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "3. Types of PRIMARY KEYS"
                    },
                    {
                        "type": "paragraph",
                        "text": "Simple Primary Key: Uses a single column to uniquely identify records."
                    },
                    {
                        "type": "paragraph",
                        "text": "Composite Primary Key: Uses two or more columns together to uniquely identify a row."
                    },
                    {
                        "type": "heading",
                        "text": "4. Syntax & Implementation Methods"
                    },
                    {
                        "type": "heading",
                        "text": "A. Define PRIMARY KEY During Table Creation"
                    },
                    {
                        "type": "paragraph",
                        "text": "Method 1: Inline with column definition"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE table_name (\n  column1 datatype PRIMARY KEY,\n  column2 datatype,\n  ...\n);"
                    },
                    {
                        "type": "paragraph",
                        "text": "Method 2: Using CONSTRAINT keyword (for composite keys)"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE table_name (\n  column1 datatype,\n  column2 datatype,\n  CONSTRAINT pk_constraint_name PRIMARY KEY (column1, column2)\n);"
                    },
                    {
                        "type": "heading",
                        "text": "B. Add PRIMARY KEY to Existing Table"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "ALTER TABLE table_name\nADD CONSTRAINT constraint_name PRIMARY KEY (column1, column2);"
                    },
                    {
                        "type": "heading",
                        "text": "5. Practical Examples"
                    },
                    {
                        "type": "heading",
                        "text": "Example 1: Creating Table With PRIMARY KEY"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE Persons (\n  PersonID INT PRIMARY KEY,\n  FirstName VARCHAR(50) NOT NULL,\n  LastName VARCHAR(50) NOT NULL,\n  Country VARCHAR(50),\n  Age INT\n);"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: PersonID uniquely identifies each person. FirstName and LastName cannot be NULL."
                    },
                    {
                        "type": "heading",
                        "text": "Example 2: Verifying PRIMARY KEY Behavior"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- First insert: success\nINSERT INTO Persons VALUES (1, 'Arun', 'Shah', 'India', 30);\n\n-- Second insert: ERROR\nINSERT INTO Persons VALUES (1, 'Megha', 'Patel', 'India', 28);"
                    },
                    {
                        "type": "paragraph",
                        "text": "Result: The second insert attempts to reuse PersonID = 1, violating uniqueness. Error: 'PRIMARY KEY constraint failed: duplicate value 1'"
                    },
                    {
                        "type": "heading",
                        "text": "Example 3: Adding PRIMARY KEY to Existing Table"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TABLE Products (\n  ProductCode VARCHAR(20),\n  ProductName VARCHAR(50),\n  Price DECIMAL(10,2)\n);\n\nALTER TABLE Products\nADD CONSTRAINT PK_Products PRIMARY KEY (ProductCode);"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: ProductCode becomes the unique identifier after ALTER TABLE."
                    },
                    {
                        "type": "heading",
                        "text": "6. Benefits of Using PRIMARY KEYS"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Ensures unique identification of every record.",
                            "Creates automatic unique index for fast searching.",
                            "Supports referential integrity through foreign keys.",
                            "Reduces duplicate data and prevents anomalies.",
                            "Essential for connecting relational tables (1-to-many, many-to-many)."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "7. Implementation Details"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Automatically creates a unique index on primary key columns.",
                            "Constraints can be explicitly named or auto-generated.",
                            "Can include one or multiple columns (composite keys).",
                            "Works with various data types such as INT, VARCHAR, and UUID."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "8. Common Issues & Best Practices"
                    },
                    {
                        "type": "heading",
                        "text": "A. Issues to Avoid"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Using NULL values in primary key columns.",
                            "Changing primary key values after relationships are established.",
                            "Creating overly complex composite primary keys.",
                            "Using artificial keys unnecessarily when a natural key exists."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "B. Best Practices"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Choose meaningful natural keys when available (e.g., Email, Username).",
                            "Use surrogate keys (auto-increment IDs) when no natural key exists.",
                            "Avoid changing primary key values after creation.",
                            "Prefer simple primary keys over composite when possible.",
                            "Ensure primary key values remain stable for life of the row."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "9. Database Design Implications"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Supports normalized database design by uniquely identifying rows.",
                            "Enables Foreign Keys to reference other tables.",
                            "Improves query speed due to automatic indexing.",
                            "Reduces chances of inconsistent or duplicate data."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "10. Comparison with Other Constraints"
                    },
                    {
                        "type": "heading",
                        "text": "PRIMARY KEY vs UNIQUE Constraint"
                    },
                    {
                        "type": "paragraph",
                        "text": "UNIQUE enforces distinct values but allows NULL (in many DBs). PRIMARY KEY does not allow NULL and must be unique."
                    },
                    {
                        "type": "heading",
                        "text": "PRIMARY KEY vs NOT NULL Constraint"
                    },
                    {
                        "type": "paragraph",
                        "text": "NOT NULL only prevents NULL values. PRIMARY KEY prevents NULL and requires uniqueness."
                    },
                    {
                        "type": "heading",
                        "text": "PRIMARY KEY vs FOREIGN KEY Constraint"
                    },
                    {
                        "type": "paragraph",
                        "text": "PRIMARY KEY identifies rows; FOREIGN KEY references a primary key in another table to enforce relationship integrity."
                    },
                    {
                        "type": "heading",
                        "text": "11. Real-World Applications"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Customer tables → CustomerID as primary key.",
                            "Products table → ProductID uniquely identifies products.",
                            "Order tables → OrderID for tracking purchases.",
                            "User management → UserID or username used as primary key."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "12. Technical Considerations"
                    },
                    {
                        "type": "list",
                        "items": [
                            "PRIMARY KEY automatically creates a unique index for fast lookups.",
                            "Minimal storage overhead due to indexing structure.",
                            "INSERT operations incur slight overhead from uniqueness checking.",
                            "Updating a primary key cascades to dependent foreign keys if ON UPDATE CASCADE is enabled."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Summary Table"
                    },
                    {
                        "type": "table",
                        "headers": ["Constraint", "Uniqueness", "NULL Allowed", "Count Per Table", "Use Case"],
                        "rows": [
                            ["PRIMARY KEY", "Yes", "No", "1 (simple or composite)", "Unique row identifier"],
                            ["UNIQUE", "Yes", "Yes (in most DBs)", "Multiple", "Unique but optional values"],
                            ["NOT NULL", "No", "No", "Multiple", "Mandatory fields"],
                            ["FOREIGN KEY", "No", "Yes", "Multiple", "Reference other tables"]
                        ]
                    }
                ]
            },
            {
                name: "SQL COUNT() Function",
                content: [
                    {
                        "type": "paragraph",
                        "text": "The COUNT() function in SQL is used to count rows, non-null values, or distinct values. It is one of the most commonly used aggregate functions for generating summaries, analytics, and reports."
                    },
                    {
                        "type": "heading",
                        "text": "1. COUNT() Function Definition & Purpose"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Returns the number of rows or the number of non-null values in a column.",
                            "Widely used in reporting, analytics, and summary computations.",
                            "Helps measure dataset size, category frequencies, and group distributions."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2. Basic Syntax & Variations"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "COUNT(expression)\n\nCOUNT(*)                       -- Counts all rows (including NULLs)\nCOUNT(column_name)             -- Counts non-null values in a column\nCOUNT(DISTINCT column_name)    -- Counts unique non-null values"
                    },
                    {
                        "type": "heading",
                        "text": "3. Different Ways to Use COUNT()"
                    },
                    {
                        "type": "heading",
                        "text": "A. Basic Counting"
                    },
                    {
                        "type": "list",
                        "items": [
                            "COUNT(*) → Counts all rows regardless of NULL values.",
                            "COUNT(column) → Counts only non-null values.",
                            "COUNT(DISTINCT column) → Counts unique non-null values."
                        ]
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT COUNT(*) FROM Customers;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["COUNT(*)"],
                        "rows": [[10]]
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT COUNT(Country) FROM Customers;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["COUNT(Country)"],
                        "rows": [[9]]
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT COUNT(DISTINCT Country) FROM Customers;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["COUNT(DISTINCT Country)"],
                        "rows": [[4]]
                    },
                    {
                        "type": "heading",
                        "text": "B. Conditional Counting (CASE WHEN)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Counts rows matching specific conditions using CASE WHEN."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- Syntax\nCOUNT(CASE WHEN condition THEN 1 ELSE NULL END)"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT COUNT(CASE WHEN Age > 30 THEN 1 END) AS Over30 FROM Customers;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Over30"],
                        "rows": [[3]]
                    },
                    {
                        "type": "heading",
                        "text": "C. Conditional Counting (WHERE)"
                    },
                    {
                        "type": "paragraph",
                        "text": "WHERE filters rows before COUNT() is applied."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT COUNT(*) FROM Customers WHERE City = 'Averton';"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["COUNT(*)"],
                        "rows": [[2]]
                    },
                    {
                        "type": "heading",
                        "text": "D. Counting with GROUP BY"
                    },
                    {
                        "type": "paragraph",
                        "text": "Counts rows within grouped categories."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT Country, COUNT(*) AS customer_count\nFROM Customers\nGROUP BY Country;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Country", "customer_count"],
                        "rows": [
                            ["India", 4],
                            ["Canada", 3],
                            ["Brazil", 2],
                            ["Singapore", 1]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "E. Filtering Groups with HAVING"
                    },
                    {
                        "type": "paragraph",
                        "text": "HAVING filters groups after aggregation."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT Country, COUNT(*) AS total\nFROM Customers\nGROUP BY Country\nHAVING COUNT(*) > 2;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Country", "total"],
                        "rows": [
                            ["India", 4],
                            ["Canada", 3]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "4. Practical Examples"
                    },
                    {
                        "type": "heading",
                        "text": "Example 1: Employee Table"
                    },
                    {
                        "type": "paragraph",
                        "text": "Sample Employee table:"
                    },
                    {
                        "type": "table",
                        "headers": ["EmpID", "EmpName", "Department", "Salary"],
                        "rows": [
                            [1, "Arun", "IT", 50000],
                            [2, "Megha", "HR", 45000],
                            [3, "Ishan", "IT", 52000],
                            [4, "Riya", "NULL", 40000]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Query 1: Total employees"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT COUNT(*) FROM Employee;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["COUNT(*)"],
                        "rows": [[4]]
                    },
                    {
                        "type": "heading",
                        "text": "Query 2: Count non-null departments"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT COUNT(Department) FROM Employee;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["COUNT(Department)"],
                        "rows": [[3]]
                    },
                    {
                        "type": "heading",
                        "text": "Query 3: Count distinct departments"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT COUNT(DISTINCT Department) FROM Employee;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["COUNT(DISTINCT Department)"],
                        "rows": [[2]]
                    },
                    {
                        "type": "heading",
                        "text": "Example 2: Customers Table"
                    },
                    {
                        "type": "paragraph",
                        "text": "Sample Customers table:"
                    },
                    {
                        "type": "table",
                        "headers": ["CustomerID", "Name", "Age", "City", "Country"],
                        "rows": [
                            [1, "Neel", 28, "Averton", "India"],
                            [2, "Riya", 34, "Averton", "India"],
                            [3, "Mark", 29, "Vancouver", "Canada"],
                            [4, "Sara", 31, "Toronto", "Canada"],
                            [5, "Felix", 41, "Berlin", "Singapore"],
                            [6, "Asha", 26, "Mumbai", "India"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Query 1: Total customers"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT COUNT(*) FROM Customers;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["COUNT(*)"],
                        "rows": [[6]]
                    },
                    {
                        "type": "heading",
                        "text": "Query 2: Unique countries"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT COUNT(DISTINCT Country) FROM Customers;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["COUNT(DISTINCT Country)"],
                        "rows": [[3]]
                    },
                    {
                        "type": "heading",
                        "text": "Query 3: Customers older than 30"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT COUNT(CASE WHEN Age > 30 THEN 1 END) AS Over30 FROM Customers;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Over30"],
                        "rows": [[3]]
                    },
                    {
                        "type": "heading",
                        "text": "5. Detailed Function Applications"
                    },
                    {
                        "type": "list",
                        "items": [
                            "COUNT(*) counts all rows, including rows where all columns may be NULL.",
                            "COUNT(DISTINCT column) is useful for discovering number of unique categories.",
                            "Conditional COUNT using CASE WHEN allows counting based on specific rules.",
                            "GROUP BY + COUNT creates category-wise summaries.",
                            "HAVING filters summarized values, enabling threshold-based analysis."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "6. Performance & Best Practices"
                    },
                    {
                        "type": "heading",
                        "text": "A. Optimization Techniques"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Create indexes on frequently counted columns.",
                            "Use WHERE to reduce scanned row count.",
                            "Avoid unnecessary DISTINCT on large datasets.",
                            "Break complex COUNT queries into smaller subqueries."
                        ]
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE INDEX idx_country ON Customers(Country);"
                    },
                    {
                        "type": "heading",
                        "text": "B. Performance Considerations"
                    },
                    {
                        "type": "list",
                        "items": [
                            "COUNT(*) is usually fastest because it scans index efficiently.",
                            "COUNT(column) may be slower if many NULL values exist.",
                            "COUNT(DISTINCT) is heavier due to duplicate elimination."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "C. Best Practices"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Always choose the correct COUNT variant for the task.",
                            "Use CASE WHEN for flexible conditional counts.",
                            "Use indexes strategically on large datasets.",
                            "Avoid counting unnecessary columns when COUNT(*) suffices."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "7. Real-World Applications"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Customer analytics: Count customers by region or age group.",
                            "Sales reporting: Count transactions per day or product.",
                            "Quality checks: Count missing or NULL entries.",
                            "User engagement: Count active or inactive users.",
                            "Inventory: Count products by category."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "8. Common Patterns & Use Cases"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- Pattern 1: Basic count\nSELECT COUNT(*) FROM table;\n\n-- Pattern 2: Count non-null values\nSELECT COUNT(column) FROM table;\n\n-- Pattern 3: Count distinct values\nSELECT COUNT(DISTINCT column) FROM table;\n\n-- Pattern 4: Conditional count\nSELECT COUNT(CASE WHEN condition THEN 1 END) FROM table;\n\n-- Pattern 5: Grouped count\nSELECT column, COUNT(*) FROM table GROUP BY column;\n\n-- Pattern 6: Filtered groups\nSELECT column, COUNT(*) FROM table GROUP BY column HAVING COUNT(*) > 2;"
                    },
                    {
                        "type": "heading",
                        "text": "9. Advanced Techniques"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Nested COUNTs inside subqueries to measure filtered subsets.",
                            "Using COUNT OVER() for running totals (window functions).",
                            "Combining COUNT with SUM, AVG, MAX for summary dashboards."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "10. Error Prevention & Tips"
                    },
                    {
                        "type": "list",
                        "items": [
                            "COUNT(column) excludes NULL values—important for data quality checks.",
                            "DISTINCT may slow performance on large datasets.",
                            "WHERE filters before grouping; HAVING filters after grouping.",
                            "Ensure all non-aggregated columns in SELECT appear in GROUP BY."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Summary Table: COUNT() Variations"
                    },
                    {
                        "type": "table",
                        "headers": ["Function", "Counts", "Includes NULL", "Use Case"],
                        "rows": [
                            ["COUNT(*)", "All rows", "Yes", "Total row count"],
                            ["COUNT(column)", "Non-null values", "No", "Data completeness check"],
                            ["COUNT(DISTINCT column)", "Unique non-null values", "No", "Category diversity"],
                            ["COUNT(CASE WHEN...)", "Conditional matches", "No", "Filtered counting"]
                        ]
                    }
                ]
            },
            {
                name: "SQL SUM() Function",
                content: [
                    {
                        "type": "paragraph",
                        "text": "The SUM() function is an aggregate function used to calculate the total of numeric values in a column. It is widely used in financial calculations, reporting, analytics, and business intelligence."
                    },
                    {
                        "type": "heading",
                        "text": "1. SUM() Function Definition & Purpose"
                    },
                    {
                        "type": "table",
                        "headers": ["Aspect", "Description"],
                        "rows": [
                            ["Primary Use", "Calculate overall totals"],
                            ["Data Type", "Works with numeric columns only"],
                            ["Return Type", "Single numeric value representing the total"]
                        ]
                    },
                    {
                        "type": "list",
                        "items": [
                            "SUM() calculates the total value of a numeric column.",
                            "Frequently used in finance, sales analytics, reporting, and aggregations.",
                            "Ignores NULL values while performing calculations."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2. Basic Syntax"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT SUM(column_name) FROM table_name;\n\nSELECT SUM(DISTINCT column_name) FROM table_name;\n\nSELECT SUM(expression) FROM table_name;"
                    },
                    {
                        "type": "heading",
                        "text": "3. Different Ways to Use SUM()"
                    },
                    {
                        "type": "heading",
                        "text": "A. Basic Summation"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT SUM(Price) AS TotalPrice FROM Sales;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["TotalPrice"],
                        "rows": [[1690]]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Adds all Price values including duplicates."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT SUM(DISTINCT Price) AS SumDistinctPrice FROM Sales;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["SumDistinctPrice"],
                        "rows": [[870]]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Adds only unique price values."
                    },
                    {
                        "type": "heading",
                        "text": "B. Calculated Summation"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT SUM(Quantity * Price) AS TotalRevenue FROM Sales;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["TotalRevenue"],
                        "rows": [[11400]]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Calculates row-level revenue and aggregates the total."
                    },
                    {
                        "type": "heading",
                        "text": "C. Conditional & Grouped Summation"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT SUM(Quantity * Price) FROM Sales WHERE Product = 'Laptop';"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["SUM(Quantity * Price)"],
                        "rows": [[12000]]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Filters laptop rows before summing."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT Product, SUM(Quantity * Price) FROM Sales GROUP BY Product;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Product", "SUM(Quantity * Price)"],
                        "rows": [
                            ["Laptop", 12000],
                            ["Mouse", 1400],
                            ["Keyboard", 1500]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Sums revenue for each product category."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT Product, SUM(Quantity * Price) AS TotalRevenue\nFROM Sales\nGROUP BY Product\nHAVING SUM(Quantity * Price) > 2000;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Product", "TotalRevenue"],
                        "rows": [["Laptop", 12000]]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Filters groups to show products with revenue above 2000."
                    },
                    {
                        "type": "heading",
                        "text": "4. Practical Examples (Sales Table)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Sample Sales table:"
                    },
                    {
                        "type": "table",
                        "headers": ["Product", "Quantity", "Price"],
                        "rows": [
                            ["Laptop", 10, 800],
                            ["Mouse", 50, 20],
                            ["Keyboard", 30, 50],
                            ["Laptop", 5, 800],
                            ["Mouse", 25, 20]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 1: SUM() on a Single Column"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT SUM(Price) AS TotalPrice FROM Sales;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["TotalPrice"],
                        "rows": [[1690]]
                    },
                    {
                        "type": "heading",
                        "text": "Example 2: SUM() with Expression"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT SUM(Quantity * Price) AS TotalRevenue FROM Sales;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["TotalRevenue"],
                        "rows": [[11400]]
                    },
                    {
                        "type": "heading",
                        "text": "Example 3: SUM() with GROUP BY"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT Product, SUM(Quantity * Price) AS TotalRevenue\nFROM Sales\nGROUP BY Product;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Product", "TotalRevenue"],
                        "rows": [
                            ["Laptop", 12000],
                            ["Mouse", 1400],
                            ["Keyboard", 1500]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 4: SUM(DISTINCT)"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT SUM(DISTINCT Price) AS SumDistinctPrice FROM Sales;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["SumDistinctPrice"],
                        "rows": [[870]]
                    },
                    {
                        "type": "heading",
                        "text": "Example 5: SUM() with HAVING"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT Product, SUM(Quantity * Price) AS TotalRevenue\nFROM Sales\nGROUP BY Product\nHAVING SUM(Quantity * Price) > 2000;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Product", "TotalRevenue"],
                        "rows": [["Laptop", 12000]]
                    },
                    {
                        "type": "heading",
                        "text": "5. Key Features & Capabilities"
                    },
                    {
                        "type": "table",
                        "headers": ["Feature", "Description", "Use Case"],
                        "rows": [
                            ["Numeric Only", "Works only with numeric data types", "Financial calculations"],
                            ["NULL Handling", "Ignores NULL values", "Accurate totals with missing data"],
                            ["DISTINCT Support", "Sums only unique values", "Avoid duplicates"],
                            ["Expression Support", "Can sum calculated expressions", "Revenue calculations"],
                            ["Grouping", "Works with GROUP BY", "Sales by region or product"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "6. Common Use Cases & Applications"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Financial reporting: Total revenue, total expenses, profit.",
                            "Inventory management: Total stock value, total quantity.",
                            "Business analytics: Category performance, KPIs, revenue breakdowns.",
                            "General data analysis: Statistical totals, validations."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "7. Performance Considerations"
                    },
                    {
                        "type": "table",
                        "headers": ["Consideration", "Impact", "Best Practice"],
                        "rows": [
                            ["Large Datasets", "Full table scans slow down", "Use WHERE to limit rows"],
                            ["Indexing", "Improves speed on numeric columns", "Create indexes on summed columns"],
                            ["Complex Expressions", "Slower evaluation", "Precompute frequently used fields"],
                            ["DISTINCT", "Extra overhead for uniqueness", "Use only when required"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "8. Error Prevention & Best Practices"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Always ensure the column is numeric before applying SUM().",
                            "SUM() ignores NULLs, but COALESCE can replace NULLs with zero.",
                            "Control precision using ROUND() when summing decimals.",
                            "Validate data type issues using ISNUMERIC or CAST.",
                            "Use HAVING only for filtering aggregated results."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example: Casting for Safe Summation"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT SUM(CAST(amount AS DECIMAL(10,2))) FROM Transactions;"
                    },
                    {
                        "type": "heading",
                        "text": "Example: Replace NULLs Before Summing"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT SUM(COALESCE(amount, 0)) FROM Payments;"
                    },
                    {
                        "type": "heading",
                        "text": "Example: Check for Non-Numeric Data"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT COUNT(*) FROM DataSet WHERE ISNUMERIC(column) = 0;"
                    },
                    {
                        "type": "heading",
                        "text": "9. Real-World Business Scenarios"
                    },
                    {
                        "type": "heading",
                        "text": "Scenario 1: Monthly Sales Report"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT MONTH(order_date) AS Month, SUM(order_amount) AS MonthlyTotal\nFROM Orders\nWHERE YEAR(order_date) = 2024\nGROUP BY MONTH(order_date)\nORDER BY Month;"
                    },
                    {
                        "type": "heading",
                        "text": "Scenario 2: Product Performance Analysis"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT product_category,\n       SUM(quantity_sold) AS TotalUnits,\n       SUM(quantity_sold * unit_price) AS TotalRevenue\nFROM Sales\nGROUP BY product_category\nHAVING SUM(quantity_sold * unit_price) > 10000\nORDER BY TotalRevenue DESC;"
                    },
                    {
                        "type": "heading",
                        "text": "Scenario 3: Customer Lifetime Value"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT customer_id,\n       COUNT(*) AS NumberOfOrders,\n       SUM(order_total) AS LifetimeValue\nFROM Orders\nGROUP BY customer_id\nHAVING SUM(order_total) > 5000\nORDER BY LifetimeValue DESC;"
                    },
                    {
                        "type": "heading",
                        "text": "10. Comparison with Other Aggregate Functions"
                    },
                    {
                        "type": "table",
                        "headers": ["Function", "Purpose", "Difference from SUM()"],
                        "rows": [
                            ["AVG()", "Calculates average", "AVG divides total by count"],
                            ["COUNT()", "Counts rows", "Does not sum values"],
                            ["MIN()/MAX()", "Find smallest/largest value", "Does not compute totals"],
                            ["SUM()", "Computes total", "Only function that adds values"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "11. Advanced Techniques"
                    },
                    {
                        "type": "heading",
                        "text": "Running Totals Using Window Function"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT date, amount, SUM(amount) OVER (ORDER BY date) AS RunningTotal\nFROM Transactions;"
                    },
                    {
                        "type": "heading",
                        "text": "Conditional Summing with CASE"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT SUM(CASE WHEN status = 'Completed' THEN amount ELSE 0 END) AS CompletedTotal,\n       SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END) AS PendingTotal\nFROM Orders;"
                    },
                    {
                        "type": "heading",
                        "text": "Percentage of Total Contribution"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT category,\n       SUM(amount) AS CategoryTotal,\n       SUM(amount) * 100.0 / (SELECT SUM(amount) FROM TableName) AS Percentage\nFROM TableName\nGROUP BY category;"
                    },
                    {
                        "type": "heading",
                        "text": "Summary: SUM() Function Variations"
                    },
                    {
                        "type": "table",
                        "headers": ["Variation", "Syntax", "Use Case"],
                        "rows": [
                            ["Basic SUM", "SUM(column)", "Total of all values"],
                            ["Distinct SUM", "SUM(DISTINCT column)", "Total of unique values"],
                            ["Expression SUM", "SUM(col1 * col2)", "Calculated totals"],
                            ["Conditional SUM", "SUM(CASE WHEN... THEN... END)", "Filtered totals"],
                            ["Window SUM", "SUM(column) OVER (ORDER BY...)", "Running totals"]
                        ]
                    }
                ]
            },
            {
                name: "SQL MAX() Function",
                content: [
                    {
                        "type": "paragraph",
                        "text": "The SQL MAX() function returns the highest value from a column. It is used in reporting, analytics, financial summaries, and identifying top-performing data. MAX() works with numeric, date, and text values while ignoring NULLs."
                    },
                    {
                        "type": "heading",
                        "text": "1. MAX() Function Definition & Purpose"
                    },
                    {
                        "type": "table",
                        "headers": ["Aspect", "Description"],
                        "rows": [
                            ["Primary Use", "Find maximum/highest values"],
                            ["Data Types", "Numeric, date, text"],
                            ["NULL Handling", "Ignores NULL values"],
                            ["Return Type", "Single highest value"]
                        ]
                    },
                    {
                        "type": "list",
                        "items": [
                            "Identifies the highest value in a column.",
                            "Useful in analytics, ranking, and trend insights.",
                            "Works with numbers, dates, and character data."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2. Basic Syntax"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT MAX(column_name) FROM table_name;\n\nSELECT MAX(expression) FROM table_name;"
                    },
                    {
                        "type": "heading",
                        "text": "3. Different Applications of MAX()"
                    },
                    {
                        "type": "heading",
                        "text": "A. Basic Maximum Finding"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT MAX(price) FROM Products;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Finds highest price among all products."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT MAX(sale_date) FROM Products;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Returns latest date in sale_date column."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT MAX(product_name) FROM Products;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Returns the alphabetically highest product name."
                    },
                    {
                        "type": "heading",
                        "text": "B. Conditional Maximum"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT MAX(price) FROM Products WHERE category = 'Electronics';"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Finds maximum price only among Electronics."
                    },
                    {
                        "type": "heading",
                        "text": "C. Grouped Maximum"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT category, MAX(total_sales) AS MaxSales FROM Products GROUP BY category;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Finds highest sales amount per category."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT category, MAX(price) AS MaxPrice\nFROM Products\nGROUP BY category\nHAVING MAX(price) > 500;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Filters to categories where highest price exceeds 500."
                    },
                    {
                        "type": "heading",
                        "text": "D. Advanced Techniques"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT * FROM Products\nWHERE total_sales = (SELECT MAX(total_sales) FROM Products);"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Subquery retrieves record(s) having maximum sales."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT product_name, price, MAX(price) OVER() AS HighestPrice FROM Products;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Window function compares each row with overall maximum price."
                    },
                    {
                        "type": "heading",
                        "text": "4. Practical Examples Using Products Table"
                    },
                    {
                        "type": "paragraph",
                        "text": "Sample Products table:"
                    },
                    {
                        "type": "table",
                        "headers": ["product_id", "product_name", "category", "price", "total_sales", "sale_date"],
                        "rows": [
                            [1, "Laptop", "Electronics", 1200, 75000, "2024-01-15"],
                            [2, "Mouse", "Electronics", 50, 15000, "2024-02-20"],
                            [3, "Desk", "Furniture", 300, 25000, "2024-01-10"],
                            [4, "Chair", "Furniture", 150, 18000, "2024-03-05"],
                            [5, "Phone", "Electronics", 800, 90000, "2024-02-28"],
                            [6, "Keyboard", "Electronics", 80, 12000, "2024-03-10"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 1: Find Maximum Total Sales"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT MAX(total_sales) AS HighestTotalSales FROM Products;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["HighestTotalSales"],
                        "rows": [[90000]]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Phone has the highest total_sales value of 90000."
                    },
                    {
                        "type": "heading",
                        "text": "Example 2: Conditional MAX()"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT MAX(price) AS HighestPriceInElectronics\nFROM Products\nWHERE category = 'Electronics';"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["HighestPriceInElectronics"],
                        "rows": [[1200]]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Laptop has the highest price in Electronics."
                    },
                    {
                        "type": "heading",
                        "text": "Example 3: Find Latest Sale Date"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT MAX(sale_date) AS LatestSaleDate FROM Products;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["LatestSaleDate"],
                        "rows": [["2024-03-10"]]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Keyboard sale date is the most recent."
                    },
                    {
                        "type": "heading",
                        "text": "Example 4: MAX() with GROUP BY"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT product_name, MAX(total_sales) AS TopSalesAmount\nFROM Products\nGROUP BY product_name;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["product_name", "TopSalesAmount"],
                        "rows": [
                            ["Laptop", 75000],
                            ["Mouse", 15000],
                            ["Desk", 25000],
                            ["Chair", 18000],
                            ["Phone", 90000],
                            ["Keyboard", 12000]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Shows maximum sales for each product."
                    },
                    {
                        "type": "heading",
                        "text": "Example 5: MAX() in Subquery"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT * FROM Products\nWHERE total_sales = (SELECT MAX(total_sales) FROM Products);"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["product_id", "product_name", "category", "price", "total_sales", "sale_date"],
                        "rows": [
                            [5, "Phone", "Electronics", 800, 90000, "2024-02-28"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Returns the full row of the product with highest sales."
                    },
                    {
                        "type": "heading",
                        "text": "Example 6: MAX() with HAVING"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT product_name, MAX(total_sales) AS HighestSale\nFROM Products\nGROUP BY product_name\nHAVING MAX(total_sales) > 50000;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["product_name", "HighestSale"],
                        "rows": [
                            ["Laptop", 75000],
                            ["Phone", 90000]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Filters to only top-performing products."
                    },
                    {
                        "type": "heading",
                        "text": "5. Key Features & Data Type Support"
                    },
                    {
                        "type": "table",
                        "headers": ["Data Type", "MAX() Behavior", "Use Case"],
                        "rows": [
                            ["Numeric", "Returns highest number", "Top revenue, highest score"],
                            ["Date/Time", "Latest date/time", "Most recent transaction"],
                            ["String/Text", "Alphabetically highest text", "Last surname alphabetically"],
                            ["NULL Handling", "Ignores NULL values", "Accurate maximum computation"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "6. Common Business Applications"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Finding top-selling products",
                            "Identifying highest revenue periods",
                            "Finding latest transaction or login date",
                            "Finding highest-rated items",
                            "Checking maximum salary, price, or stock level"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "7. Performance Considerations"
                    },
                    {
                        "type": "table",
                        "headers": ["Scenario", "Performance Impact", "Optimization Tip"],
                        "rows": [
                            ["Large datasets", "Full scan required", "Use WHERE to reduce data"],
                            ["Indexed columns", "Faster lookup", "Index numeric/date columns"],
                            ["GROUP BY operations", "Extra computation", "Filter rows early using WHERE"],
                            ["Text MAX()", "Slower for long strings", "Avoid unnecessary text comparisons"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "8. Comparison with Similar Functions"
                    },
                    {
                        "type": "table",
                        "headers": ["Function", "Purpose", "Difference from MAX()"],
                        "rows": [
                            ["MIN()", "Finds minimum value", "Opposite of MAX()"],
                            ["AVG()", "Calculates average", "Not finding extremes"],
                            ["SUM()", "Adds values", "Aggregation not comparison"],
                            ["TOP/LIMIT", "Returns row(s)", "Does not compute a maximum value"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "9. Real-World Business Scenarios"
                    },
                    {
                        "type": "heading",
                        "text": "Scenario 1: Highest Selling Product"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT product_name, category, total_sales\nFROM Products\nWHERE total_sales = (SELECT MAX(total_sales) FROM Products);"
                    },
                    {
                        "type": "heading",
                        "text": "Scenario 2: Latest Activity by Category"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT category, MAX(sale_date) AS LatestSale\nFROM Products\nGROUP BY category\nORDER BY LatestSale DESC;"
                    },
                    {
                        "type": "heading",
                        "text": "Scenario 3: Price Analysis by Department"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT department, MAX(price) AS MaxPrice\nFROM inventory\nWHERE status = 'In Stock'\nGROUP BY department\nHAVING MAX(price) > 1000\nORDER BY MaxPrice DESC;"
                    },
                    {
                        "type": "heading",
                        "text": "10. Advanced Techniques & Patterns"
                    },
                    {
                        "type": "heading",
                        "text": "Pattern 1: Top N Maximum Values"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT DISTINCT total_sales\nFROM Products\nORDER BY total_sales DESC\nLIMIT 3;"
                    },
                    {
                        "type": "heading",
                        "text": "Pattern 2: MAX() with Window Function"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT product_name,\n       price,\n       MAX(price) OVER() AS OverallMaxPrice,\n       price / MAX(price) OVER() * 100 AS PercentOfMax\nFROM Products;"
                    },
                    {
                        "type": "heading",
                        "text": "Pattern 3: Conditional MAX() with CASE"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT MAX(CASE WHEN category = 'Electronics' THEN price END) AS MaxElectronicsPrice,\n       MAX(CASE WHEN category = 'Furniture' THEN price END) AS MaxFurniturePrice\nFROM Products;"
                    },
                    {
                        "type": "heading",
                        "text": "11. Common Pitfalls & Solutions"
                    },
                    {
                        "type": "table",
                        "headers": ["Pitfall", "Problem", "Solution"],
                        "rows": [
                            ["NULL confusion", "Thinking NULL affects maximum", "MAX() ignores NULL automatically"],
                            ["Text maximum confusion", "Unexpected alphabetical order", "Understand collation rules"],
                            ["GROUP BY errors", "Non-aggregated columns missing", "Include all non-aggregated columns"],
                            ["Performance issues", "Slow on large tables", "Add indexes or filters"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "12. Data Type Specific Behaviors"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Integer: Highest integer value returned.",
                            "Decimal/Float: Highest numeric precision value returned.",
                            "DATE: Returns most recent date.",
                            "DATETIME/TIMESTAMP: Latest timestamp returned.",
                            "VARCHAR/CHAR: Highest alphabetical value (collation-dependent)."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Summary: MAX() Function Overview"
                    },
                    {
                        "type": "table",
                        "headers": ["Usage", "Syntax", "Result"],
                        "rows": [
                            ["Basic MAX", "MAX(column)", "Single highest value"],
                            ["Conditional MAX", "MAX(column) WHERE...", "Filtered maximum"],
                            ["Grouped MAX", "MAX(column) GROUP BY...", "Maximum per group"],
                            ["Subquery MAX", "WHERE col = (SELECT MAX(col)...)", "Row(s) with max value"],
                            ["Window MAX", "MAX(column) OVER()", "Max with row details"]
                        ]
                    }
                ]
            },
            {
                name: "SQL AVG() Function",
                content: [
                    {
                        "type": "paragraph",
                        "text": "The SQL AVG() function calculates the average (mean) value of a numeric column. It ignores NULL values and is commonly used in analytics, reporting, academic scoring, finance, and business intelligence."
                    },
                    {
                        "type": "heading",
                        "text": "1. AVG() Function Definition & Purpose"
                    },
                    {
                        "type": "table",
                        "headers": ["Aspect", "Description"],
                        "rows": [
                            ["Primary Use", "Calculate numeric average/mean"],
                            ["Data Type", "Numeric columns only"],
                            ["NULL Handling", "NULL values ignored"],
                            ["Return Type", "Single numeric value"]
                        ]
                    },
                    {
                        "type": "list",
                        "items": [
                            "Finds the central value of a dataset.",
                            "Summarizes large numeric datasets efficiently.",
                            "Automatically excludes NULLs to prevent skewing results."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2. Basic Syntax"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT AVG(column_name) FROM table_name;\n\nSELECT AVG(expression) FROM table_name;"
                    },
                    {
                        "type": "heading",
                        "text": "3. Different Applications of AVG()"
                    },
                    {
                        "type": "heading",
                        "text": "A. Basic Averaging"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT AVG(score) FROM student_scores;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Computes overall average score."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT AVG(price * quantity) FROM orders;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Average of calculated totals."
                    },
                    {
                        "type": "heading",
                        "text": "B. Conditional Averaging"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT AVG(score) FROM student_scores WHERE subject = 'Math';"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Averages only Math scores."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT AVG(CASE WHEN score >= 50 THEN score END) FROM student_scores;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Conditional averaging using CASE."
                    },
                    {
                        "type": "heading",
                        "text": "C. Grouped Averaging"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT subject, AVG(score) FROM student_scores GROUP BY subject;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Average score per subject."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT subject, AVG(score) FROM student_scores GROUP BY subject HAVING AVG(score) > 85;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Shows only subjects with strong performance."
                    },
                    {
                        "type": "heading",
                        "text": "D. Advanced Techniques"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT student_name, score, AVG(score) OVER() AS overall_avg FROM student_scores;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Window function: average available for each row."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT SUM(weight * score) / SUM(weight) AS weighted_avg FROM weighted_scores;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Calculates weighted average manually."
                    },
                    {
                        "type": "heading",
                        "text": "4. Practical Examples Using student_scores Table"
                    },
                    {
                        "type": "paragraph",
                        "text": "Sample student_scores table:"
                    },
                    {
                        "type": "table",
                        "headers": ["student_id", "student_name", "subject", "score"],
                        "rows": [
                            [1, "Alice", "Math", 85],
                            [2, "Bob", "Math", 92],
                            [3, "Charlie", "Science", 78],
                            [4, "Diana", "Science", 88],
                            [5, "Eve", "Math", 90],
                            [6, "Frank", "Science", 95],
                            [7, "Grace", "English", 82],
                            [8, "Henry", "English", 79]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 1: Overall Average Score"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT AVG(score) AS overall_average_score FROM student_scores;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["overall_average_score"],
                        "rows": [[86.1250]]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Average of all scores: (85 + 92 + 78 + 88 + 90 + 95 + 82 + 79) / 8."
                    },
                    {
                        "type": "heading",
                        "text": "Example 2: Average Score per Subject"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT subject, AVG(score) AS average_score\nFROM student_scores\nGROUP BY subject;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["subject", "average_score"],
                        "rows": [
                            ["Math", 89.0000],
                            ["Science", 87.0000],
                            ["English", 80.5000]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Groups by subject, finds mean score for each subject."
                    },
                    {
                        "type": "heading",
                        "text": "Example 3: Average Score for Science Only"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT AVG(score) AS average_science_score\nFROM student_scores\nWHERE subject = 'Science';"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["average_science_score"],
                        "rows": [[87.0000]]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Science scores: (78 + 88 + 95) / 3."
                    },
                    {
                        "type": "heading",
                        "text": "Example 4: Subjects with Average Score Above 85"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT subject, AVG(score) AS average_score\nFROM student_scores\nGROUP BY subject\nHAVING AVG(score) > 85;"
                    },
                    {
                        "type": "heading",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["subject", "average_score"],
                        "rows": [
                            ["Math", 89.0000],
                            ["Science", 87.0000]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: English average 80.5 is below 85, so excluded."
                    },
                    {
                        "type": "heading",
                        "text": "5. Key Features & Mathematical Properties"
                    },
                    {
                        "type": "table",
                        "headers": ["Property", "Description", "Implication"],
                        "rows": [
                            ["NULL Exclusion", "NULL values ignored", "Average reflects only valid entries"],
                            ["Numeric Only", "Works with INT, FLOAT, DECIMAL", "Cannot average text or dates"],
                            ["Precision", "Returns decimal output", "Often combined with ROUND()"],
                            ["Weighted", "No built-in weighted avg", "Must compute via expressions"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "6. Common Business Applications"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Classroom performance analysis",
                            "Subject-level student performance",
                            "Average order value (AOV)",
                            "Customer spending analytics",
                            "Average product price or rating",
                            "Performance score averages",
                            "Financial averages such as daily balance"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "7. Performance Considerations"
                    },
                    {
                        "type": "table",
                        "headers": ["Scenario", "Impact", "Optimization"],
                        "rows": [
                            ["Large Tables", "Full scan required", "Use WHERE to reduce dataset"],
                            ["GROUP BY", "Adds processing cost", "Filter rows before grouping"],
                            ["Precision", "High precision slows processing", "Use efficient numeric types"],
                            ["Missing Indexes", "Slow evaluation", "Index frequently-averaged columns"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "8. Comparison with Similar Aggregate Functions"
                    },
                    {
                        "type": "table",
                        "headers": ["Function", "Purpose", "Difference"],
                        "rows": [
                            ["SUM()", "Adds all values", "Does not compute mean"],
                            ["COUNT()", "Counts rows", "Does not calculate average"],
                            ["MIN()/MAX()", "Finds extremes", "Not central tendency"],
                            ["AVG()", "Computes mean", "Central value calculation"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "9. Real-World Business Scenarios"
                    },
                    {
                        "type": "heading",
                        "text": "Scenario 1: Average Order Value (AOV)"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT AVG(order_total) AS average_order_value\nFROM orders\nWHERE order_date >= '2024-01-01';"
                    },
                    {
                        "type": "heading",
                        "text": "Scenario 2: Student Performance by Class"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT class_name,\n       AVG(exam_score) AS avg_score,\n       COUNT(*) AS student_count\nFROM students\nGROUP BY class_name\nORDER BY avg_score DESC;"
                    },
                    {
                        "type": "heading",
                        "text": "Scenario 3: Product Rating Analysis"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT product_category,\n       AVG(rating) AS avg_rating,\n       COUNT(rating) AS review_count\nFROM product_reviews\nGROUP BY product_category\nHAVING COUNT(rating) >= 10\nORDER BY avg_rating DESC;"
                    },
                    {
                        "type": "heading",
                        "text": "10. Advanced Techniques & Patterns"
                    },
                    {
                        "type": "heading",
                        "text": "Pattern 1: Comparing Individual Values to Average"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT student_name,\n       score,\n       AVG(score) OVER() AS class_avg,\n       score - AVG(score) OVER() AS deviation_from_avg\nFROM student_scores;"
                    },
                    {
                        "type": "heading",
                        "text": "Pattern 2: Conditional Average with CASE"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT AVG(CASE WHEN subject = 'Math' THEN score END) AS avg_math,\n       AVG(CASE WHEN subject = 'Science' THEN score END) AS avg_science,\n       AVG(CASE WHEN subject = 'English' THEN score END) AS avg_english\nFROM student_scores;"
                    },
                    {
                        "type": "heading",
                        "text": "Pattern 3: Weighted Average Calculation"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT student_name,\n       SUM(score * credit_hours) / SUM(credit_hours) AS weighted_gpa\nFROM course_grades\nGROUP BY student_name;"
                    },
                    {
                        "type": "heading",
                        "text": "Pattern 4: Moving Average (Window Function)"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT date,\n       sales_amount,\n       AVG(sales_amount) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS moving_avg_7days\nFROM daily_sales;"
                    },
                    {
                        "type": "heading",
                        "text": "11. Common Pitfalls & Solutions"
                    },
                    {
                        "type": "table",
                        "headers": ["Pitfall", "Problem", "Solution"],
                        "rows": [
                            ["NULL values", "Thinking NULLs count as zero", "AVG() ignores NULLs automatically"],
                            ["Precision issues", "Too many decimal places", "Use ROUND(AVG(col), 2)"],
                            ["Division by zero", "Empty result set", "Use COALESCE or check COUNT first"],
                            ["Text columns", "Attempting to average non-numeric", "Ensure column is numeric type"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "12. Precision Control & Rounding"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- Round to 2 decimal places\nSELECT ROUND(AVG(score), 2) AS avg_score FROM student_scores;\n\n-- Cast to specific precision\nSELECT CAST(AVG(score) AS DECIMAL(5,2)) AS avg_score FROM student_scores;\n\n-- Format as currency\nSELECT CONCAT('$', FORMAT(AVG(price), 2)) AS avg_price FROM products;"
                    },
                    {
                        "type": "heading",
                        "text": "Summary: AVG() Function Overview"
                    },
                    {
                        "type": "table",
                        "headers": ["Usage", "Syntax", "Result"],
                        "rows": [
                            ["Basic AVG", "AVG(column)", "Overall mean value"],
                            ["Conditional AVG", "AVG(column) WHERE...", "Filtered average"],
                            ["Grouped AVG", "AVG(column) GROUP BY...", "Average per group"],
                            ["Window AVG", "AVG(column) OVER()", "Average with row details"],
                            ["Weighted AVG", "SUM(val*weight)/SUM(weight)", "Weighted mean"]
                        ]
                    }
                ]
            }, {
                "name": "SQL Subquery",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "Last Updated : 2025-12-12"
                    },
                    {
                        "type": "paragraph",
                        "text": "A subquery is a query nested inside another SQL query. It allows complex filtering, comparison, aggregation, and data operations by using the results of one query inside another."
                    },
                    {
                        "type": "heading",
                        "text": "1. Subquery Definition & Purpose"
                    },
                    {
                        "type": "table",
                        "headers": ["Aspect", "Description"],
                        "rows": [
                            ["Primary Use", "Perform complex SQL operations by using one query inside another"],
                            ["Execution", "Inner subquery executes first"],
                            ["Result Usage", "Outer query uses the returned result for filtering, comparing, or joining"]
                        ]
                    },
                    {
                        "type": "list",
                        "items": [
                            "Enables dynamic comparisons.",
                            "Useful for filtering based on aggregated results.",
                            "Allows updating or deleting records using values from other tables."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2. Subquery Capabilities & Use Cases"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Filter rows using aggregated or calculated values.",
                            "Retrieve dynamic comparison values (e.g., MAX, AVG results).",
                            "Update data using values from other tables.",
                            "Delete rows based on conditions derived from another query.",
                            "Create temporary derived tables (use in FROM) for complex transformations."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "3. Basic Syntax"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT column_name\nFROM table_name\nWHERE column operator (SELECT column FROM table WHERE condition);"
                    },
                    {
                        "type": "heading",
                        "text": "4. Types of Subqueries"
                    },
                    {
                        "type": "heading",
                        "text": "A. Based on Result Size"
                    },
                    {
                        "type": "table",
                        "headers": ["Type", "Description", "Typical Operators"],
                        "rows": [
                            ["Single-Row Subquery", "Returns exactly one value", "=, >, <, >=, <="],
                            ["Multi-Row Subquery", "Returns multiple values (set)", "IN, ANY, ALL, EXISTS"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "B. Based on Dependency"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Non-Correlated Subquery: Independent of outer query; executed once.",
                            "Correlated Subquery: References outer query columns; executed per outer row (can be slow)."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "5. Where You Can Place Subqueries"
                    },
                    {
                        "type": "table",
                        "headers": ["Clause", "Purpose", "Example"],
                        "rows": [
                            ["WHERE", "Filter rows using subquery results", "WHERE id IN (SELECT id FROM other_table WHERE ...)"],
                            ["FROM", "Use subquery as derived table / virtual table", "FROM (SELECT ... ) AS dt"],
                            ["HAVING", "Filter grouped results using subquery", "HAVING SUM(x) > (SELECT AVG(y) FROM ...)"],
                            ["SELECT", "Return scalar value in select list", "SELECT (SELECT COUNT(*) FROM orders WHERE ...) AS order_count"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "6. Example Tables (sample data)"
                    },
                    {
                        "type": "table",
                        "headers": ["Student_Info: columns", "Notes"],
                        "rows": [
                            [["ROLL_NO", "NAME", "LOCATION", "PHONE_NUMBER"], "Sample student details"]
                        ]
                    },
                    {
                        "type": "table",
                        "headers": ["Student_Info: rows"],
                        "rows": [
                            [[101, "Sophia", "London", "9876543210"]],
                            [[102, "Emma", "Berlin", "9123456780"]],
                            [[103, "Noah", "Toronto", "9988776655"]],
                            [[104, "Olivia", "Sydney", "9112233445"]]
                        ]
                    },
                    {
                        "type": "table",
                        "headers": ["Student_Section: columns", "Student_Section: rows"],
                        "rows": [
                            [["ROLL_NO", "SECTION"], [[101, "A"], [102, "A"], [103, "B"], [104, "B"]]]
                        ]
                    },
                    {
                        "type": "table",
                        "headers": ["Employees: columns", "Employees: rows"],
                        "rows": [
                            [["EmployeeID", "Name", "Salary", "DepartmentID"], [[1, "John", 50000, 10], [2, "Jane", 60000, 20], [3, "Bob", 70000, 10], [4, "Alice", 55000, 20]]]
                        ]
                    },
                    {
                        "type": "table",
                        "headers": ["Departments: columns", "Departments: rows"],
                        "rows": [
                            [["DepartmentID", "DepartmentName", "Location"], [[10, "HR", "New York"], [20, "IT", "New York"], [30, "Sales", "Chicago"]]]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "7. Practical Examples"
                    },
                    {
                        "type": "heading",
                        "text": "Example 1: Single-Row Subquery"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT *\nFROM Employees\nWHERE Salary = (SELECT MAX(Salary) FROM Employees);"
                    },
                    {
                        "type": "table",
                        "headers": ["EmployeeID", "Name", "Salary", "DepartmentID"],
                        "rows": [
                            [3, "Bob", 70000, 10]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Finds the employee whose salary equals the maximum salary in the Employees table."
                    },
                    {
                        "type": "heading",
                        "text": "Example 2: Multi-Row Subquery with IN"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT \nFROM Employees\nWHERE DepartmentID IN (SELECT DepartmentID FROM Departments WHERE Location = 'New York');"
                    },
                    {
                        "type": "table",
                        "headers": ["EmployeeID", "Name", "Salary", "DepartmentID"],
                        "rows": [
                            [1, "John", 50000, 10],
                            [2, "Jane", 60000, 20],
                            [3, "Bob", 70000, 10],
                            [4, "Alice", 55000, 20]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Returns employees in departments located in New York."
                    },
                    {
                        "type": "heading",
                        "text": "Example 3: Correlated Subquery"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT e.Name, e.Salary\nFROM Employees e\nWHERE e.Salary > (\n SELECT AVG(Salary)\n FROM Employees\n WHERE DepartmentID = e.DepartmentID\n);"
                    },
                    {
                        "type": "table",
                        "headers": ["Name", "Salary"],
                        "rows": [
                            ["Bob", 70000],
                            ["Jane", 60000]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: For each employee, compares their salary to the average salary of their department."
                    },
                    {
                        "type": "heading",
                        "text": "Example 4: Subquery in FROM (Derived Table)"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT NAME, PHONE_NUMBER\nFROM (\n SELECT NAME, PHONE_NUMBER, LOCATION\n FROM Student_Info\n WHERE LOCATION LIKE 'T%'\n) AS subquery_table;"
                    },
                    {
                        "type": "table",
                        "headers": ["NAME", "PHONE_NUMBER"],
                        "rows": [
                            ["Noah", "9988776655"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Uses a derived table of students whose location starts with 'T'."
                    },
                    {
                        "type": "heading",
                        "text": "Example 5: Subquery with JOIN"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT s.NAME, s.LOCATION, sec.SECTION\nFROM Student_Info s\nINNER JOIN (\n SELECT ROLL_NO, SECTION\n FROM Student_Section\n WHERE SECTION = 'A'\n) sec ON s.ROLL_NO = sec.ROLL_NO;"
                    },
                    {
                        "type": "table",
                        "headers": ["NAME", "LOCATION", "SECTION"],
                        "rows": [
                            ["Sophia", "London", "A"],
                            ["Emma", "Berlin", "A"]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Joins Student_Info with a subquery that selects only section 'A' students."
                    },
                    {
                        "type": "heading",
                        "text": "8. DML Operations Using Subqueries"
                    },
                    {
                        "type": "heading",
                        "text": "UPDATE with Subquery"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "UPDATE Student_Info\nSET NAME = 'Geeks'\nWHERE LOCATION IN (\n SELECT LOCATION FROM Student_Info WHERE LOCATION IN ('London', 'Berlin')\n);"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Updates NAME to 'Geeks' for students located in London or Berlin."
                    },
                    {
                        "type": "heading",
                        "text": "DELETE with Subquery"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "DELETE FROM Student_Info\nWHERE ROLL_NO IN (\n SELECT ROLL_NO FROM Student_Info WHERE ROLL_NO <= 101 OR ROLL_NO = 201\n);"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Deletes rows matching the subquery condition."
                    },
                    {
                        "type": "heading",
                        "text": "9. Performance Considerations"
                    },
                    {
                        "type": "table",
                        "headers": ["Subquery Type", "Performance Impact", "Optimization Tips"],
                        "rows": [
                            ["Non-Correlated", "Fast (runs once)", "Ensure subquery returns minimal rows; index filtered columns"],
                            ["Correlated", "Slow (runs per outer row)", "Rewrite as JOIN when possible; add indexes; reduce row set"],
                            ["IN Subquery", "Can be slow on large sets", "Use EXISTS or JOIN for large datasets"],
                            ["Scalar Subquery", "Moderate cost", "Ensure it returns a single value; avoid in large row sets"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "10. Subquery vs JOIN"
                    },
                    {
                        "type": "table",
                        "headers": ["Aspect", "Subquery", "JOIN"],
                        "rows": [
                            ["Readability", "Can be clearer for complex logic", "Clear for direct table combinations"],
                            ["Performance", "Varies; correlated can be slow", "Often optimized by the engine"],
                            ["Result Set", "Often single-column or scalar", "Can return many columns"],
                            ["Use Case", "When intermediate result or conditional logic needed", "When combining related tables directly"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "11. Common Operators for Subqueries"
                    },
                    {
                        "type": "table",
                        "headers": ["Operator", "Use", "Example"],
                        "rows": [
                            ["IN", "Check if a value belongs to a set returned by subquery", "WHERE id IN (SELECT id FROM ...)"],
                            ["ANY / SOME", "Compare to any value in subquery result", "WHERE salary > ANY (SELECT salary FROM ...)"],
                            ["ALL", "Compare to all values in subquery result", "WHERE salary > ALL (SELECT salary FROM ...)"],
                            ["EXISTS", "Check existence of rows from subquery", "WHERE EXISTS (SELECT 1 FROM ... WHERE ... )"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "12. Best Practices"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Prefer EXISTS over IN for large subqueries returning many rows.",
                            "Avoid correlated subqueries when a JOIN can achieve the same result more efficiently.",
                            "Limit subquery result sets with WHERE to reduce processing.",
                            "Use clear aliases to improve readability.",
                            "Test query plans and add indexes on join/filter columns."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "13. Common Subquery Patterns"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- Pattern 1: Above-average performers\nSELECT * FROM Employees WHERE Salary > (SELECT AVG(Salary) FROM Employees);\n\n-- Pattern 2: Records with no related entries\nSELECT * FROM Customers c WHERE NOT EXISTS (SELECT 1 FROM Orders o WHERE o.customer_id = c.id);\n\n-- Pattern 3: Scalar subquery in SELECT\nSELECT name, (SELECT COUNT() FROM orders WHERE customer_id = c.id) AS order_count FROM customers c;\n\n-- Pattern 4: Aggregation per parent row\nSELECT department_id, (\n SELECT AVG(salary) FROM employees WHERE department_id = d.id\n) AS avg_salary\nFROM departments d;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Summary: Subqueries are powerful for conditional logic, aggregation lookups, and derived tables. Use them where they make queries simpler or when a scalar/conditional result from another query is required. For performance-sensitive workloads, prefer JOINs, EXISTS, and indexing over correlated subqueries."
                    }
                ]
            }, {
                "name": "SQL Window Functions",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "Window functions perform calculations across a set of rows related to the current row without collapsing results like GROUP BY."
                    },
                    {
                        "type": "heading",
                        "text": "1. Window Functions Definition & Purpose"
                    },
                    {
                        "type": "table",
                        "headers": ["Aspect", "Description"],
                        "rows": [
                            ["Core Concept", "Calculations over a window (range/set) of rows"],
                            ["Key Difference from GROUP BY", "Retains all individual rows while adding new calculated columns"],
                            ["Performance", "Can be computationally expensive on large datasets"]
                        ]
                    },
                    {
                        "type": "list",
                        "items": [
                            "Perform aggregate-like operations without reducing row counts",
                            "Support ranking, running totals, moving averages",
                            "Operate using OVER() clause with PARTITION BY and ORDER BY"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2. Basic Syntax & OVER() Clause"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT column1,\n       window_function(column2)\n       OVER (PARTITION BY column3 ORDER BY column4) AS new_column\nFROM table_name;"
                    },
                    {
                        "type": "list",
                        "items": [
                            "window_function: SUM, AVG, ROW_NUMBER, RANK, etc.",
                            "OVER(): Defines the window",
                            "PARTITION BY: Groups rows",
                            "ORDER BY: Orders rows for calculation"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "3. Example Table: Employees"
                    },
                    {
                        "type": "table",
                        "headers": ["Name", "Age", "Department", "Salary"],
                        "rows": [
                            ["Ramesh", 20, "Finance", 50000],
                            ["Suresh", 22, "Finance", 50000],
                            ["Ram", 28, "Finance", 20000],
                            ["Deep", 25, "Sales", 30000],
                            ["Pradeep", 22, "Sales", 20000]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "4. Types of Window Functions"
                    },
                    {
                        "type": "heading",
                        "text": "A. Aggregate Window Functions"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT Name, Age, Department, Salary,\n       AVG(Salary) OVER(PARTITION BY Department) AS Avg_Salary\nFROM employee;"
                    },
                    {
                        "type": "table",
                        "headers": ["Name", "Age", "Department", "Salary", "Avg_Salary"],
                        "rows": [
                            ["Ramesh", 20, "Finance", 50000, 40000],
                            ["Suresh", 22, "Finance", 50000, 40000],
                            ["Ram", 28, "Finance", 20000, 40000],
                            ["Deep", 25, "Sales", 30000, 25000],
                            ["Pradeep", 22, "Sales", 20000, 25000]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Computes average salary per department while keeping every row."
                    },
                    {
                        "type": "heading",
                        "text": "5. Ranking Window Functions"
                    },
                    {
                        "type": "heading",
                        "text": "1. RANK() Function"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT Name, Department, Salary,\n       RANK() OVER(PARTITION BY Department ORDER BY Salary DESC) AS emp_rank\nFROM employee;"
                    },
                    {
                        "type": "table",
                        "headers": ["Name", "Department", "Salary", "emp_rank"],
                        "rows": [
                            ["Ramesh", "Finance", 50000, 1],
                            ["Suresh", "Finance", 50000, 1],
                            ["Ram", "Finance", 20000, 3],
                            ["Deep", "Sales", 30000, 1],
                            ["Pradeep", "Sales", 20000, 2]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Tied salaries get same rank; next rank is skipped."
                    },
                    {
                        "type": "heading",
                        "text": "2. DENSE_RANK() Function"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT Name, Department, Salary,\n       DENSE_RANK() OVER(PARTITION BY Department ORDER BY Salary DESC) AS emp_dense_rank\nFROM employee;"
                    },
                    {
                        "type": "table",
                        "headers": ["Name", "Department", "Salary", "emp_dense_rank"],
                        "rows": [
                            ["Ramesh", "Finance", 50000, 1],
                            ["Suresh", "Finance", 50000, 1],
                            ["Ram", "Finance", 20000, 2],
                            ["Deep", "Sales", 30000, 1],
                            ["Pradeep", "Sales", 20000, 2]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: No gaps in ranking numbers."
                    },
                    {
                        "type": "heading",
                        "text": "3. ROW_NUMBER() Function"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT Name, Department, Salary,\n       ROW_NUMBER() OVER(PARTITION BY Department ORDER BY Salary DESC) AS emp_row_no\nFROM employee;"
                    },
                    {
                        "type": "table",
                        "headers": ["Name", "Department", "Salary", "emp_row_no"],
                        "rows": [
                            ["Ramesh", "Finance", 50000, 1],
                            ["Suresh", "Finance", 50000, 2],
                            ["Ram", "Finance", 20000, 3],
                            ["Deep", "Sales", 30000, 1],
                            ["Pradeep", "Sales", 20000, 2]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Always generates unique sequential numbers."
                    },
                    {
                        "type": "heading",
                        "text": "4. PERCENT_RANK() Function"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT Name, Department, Salary,\n       PERCENT_RANK() OVER(PARTITION BY Department ORDER BY Salary DESC) AS emp_percent_rank\nFROM employee;"
                    },
                    {
                        "type": "table",
                        "headers": ["Name", "Department", "Salary", "emp_percent_rank"],
                        "rows": [
                            ["Ramesh", "Finance", 50000, 0.00],
                            ["Suresh", "Finance", 50000, 0.00],
                            ["Ram", "Finance", 20000, 1.00],
                            ["Deep", "Sales", 30000, 0.00],
                            ["Pradeep", "Sales", 20000, 1.00]
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: Shows relative ranking from 0 (top) to 1 (bottom)."
                    },
                    {
                        "type": "heading",
                        "text": "6. Window Frame Specification"
                    },
                    {
                        "type": "list",
                        "items": [
                            "ROWS BETWEEN: Counts physical rows",
                            "RANGE BETWEEN: Uses logical values",
                            "Default frame: RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "7. Common Use Cases & Examples"
                    },
                    {
                        "type": "table",
                        "headers": ["Use Case", "Function", "Example"],
                        "rows": [
                            ["Running Totals", "SUM()", "Cumulative sales calculation"],
                            ["Moving Averages", "AVG()", "3-month moving average"],
                            ["Rankings", "RANK()", "Top employee performance"],
                            ["Row Numbering", "ROW_NUMBER()", "Pagination"],
                            ["Percentiles", "NTILE(), PERCENT_RANK()", "Quartile distribution"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "8. Performance Considerations"
                    },
                    {
                        "type": "table",
                        "headers": ["Factor", "Impact", "Optimization"],
                        "rows": [
                            ["Large datasets", "High memory and CPU load", "Index PARTITION BY and ORDER BY columns"],
                            ["Too many partitions", "Slow calculations", "Minimize partitions"],
                            ["Sorting in ORDER BY", "Expensive operation", "Use indexed columns"],
                            ["Complex window frames", "Slower execution", "Prefer ROWS over RANGE when possible"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "9. Common Errors & Fixes"
                    },
                    {
                        "type": "table",
                        "headers": ["Issue", "Cause", "Solution"],
                        "rows": [
                            ["Incorrect partitions", "Wrong PARTITION BY column", "Check grouping logic"],
                            ["Unexpected order results", "Incorrect ORDER BY", "Align with calculation"],
                            ["Slow performance", "Unindexed window cols", "Add indexes"],
                            ["Wrong results", "Default frame misunderstood", "Define ROWS/RANGE explicitly"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "10. Comparison with GROUP BY"
                    },
                    {
                        "type": "table",
                        "headers": ["Aspect", "Window Functions", "GROUP BY"],
                        "rows": [
                            ["Result Rows", "Retains all rows", "Reduces rows"],
                            ["Aggregation", "Adds new calculated columns", "Returns grouped rows"],
                            ["Use Case", "Running totals, rankings", "Summary totals"],
                            ["Performance", "Slower", "Usually faster"]
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "11. Advanced Window Function Patterns"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- Running Total\nSELECT date, sales,\n       SUM(sales) OVER (ORDER BY date) AS running_total\nFROM daily_sales;\n\n-- Moving Average\nSELECT date, sales,\n       AVG(sales) OVER (ORDER BY date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg\nFROM daily_sales;\n\n-- Difference from Department Average\nSELECT department, salary,\n       salary - AVG(salary) OVER(PARTITION BY department) AS diff_from_avg\nFROM employees;\n\n-- Top 3 per Department\nSELECT * FROM (\n    SELECT department, employee, salary,\n           ROW_NUMBER() OVER(PARTITION BY department ORDER BY salary DESC) AS rn\n    FROM employees\n) AS t WHERE rn <= 3;"
                    },
                    {
                        "type": "heading",
                        "text": "12. Other Important Window Functions"
                    },
                    {
                        "type": "list",
                        "items": [
                            "LEAD(): Get next row value",
                            "LAG(): Get previous row value",
                            "FIRST_VALUE(): First value in window",
                            "LAST_VALUE(): Last value in window",
                            "NTILE(): Distribute rows into buckets"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "13. Best Practices"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Index PARTITION BY and ORDER BY columns",
                            "Use ROWS instead of RANGE for better performance",
                            "Limit window size for large datasets",
                            "Avoid unnecessary sorting",
                            "Use EXPLAIN ANALYZE to check performance"
                        ]
                    }
                ]
            }, {
                "name": "SQL Stored Procedures",
                "content": [
                    {
                        "type": "heading",
                        "text": "1. Stored Procedure Definition & Purpose"
                    },
                    {
                        "type": "paragraph",
                        "text": "A stored procedure is a precompiled collection of SQL statements stored inside the database. It is executed as a single unit and allows input parameters, output values, and encapsulates business logic."
                    },
                    {
                        "type": "table",
                        "headers": ["Aspect", "Description"],
                        "rows": [
                            ["Storage", "Stored inside the database"],
                            ["Execution", "Runs as a single unit"],
                            ["Reusability", "Can be called multiple times"],
                            ["Callers", "Applications, SQL users, other procedures"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "2. Basic Syntax"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE PROCEDURE procedure_name\n    @param1 datatype,\n    @param2 datatype\nAS\nBEGIN\n    -- SQL statements\nEND;"
                    },
                    {
                        "type": "list",
                        "items": [
                            "CREATE PROCEDURE — defines the procedure",
                            "procedure_name — name of the stored procedure",
                            "@parameters — input parameters",
                            "BEGIN...END — block of SQL statements"
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "3. Types of SQL Stored Procedures"
                    },
                    {
                        "type": "table",
                        "headers": ["Type", "Description", "Examples"],
                        "rows": [
                            ["System Stored Procedures", "Built-in by SQL Server", "sp_help, sp_rename"],
                            ["User-Defined Procedures", "Created by developers", "Custom business logic"],
                            ["Extended Procedures", "Execute external functions", "C/C++ integrations"],
                            ["CLR Procedures", "Written in .NET languages", "API calls, string processing"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "4. Why Use Stored Procedures (Advantages)"
                    },
                    {
                        "type": "table",
                        "headers": ["Advantage", "Description", "Benefit"],
                        "rows": [
                            ["Performance Optimization", "Precompiled execution plans", "Faster execution"],
                            ["Security", "Restrict direct table access", "Protect sensitive data"],
                            ["Code Reusability", "Reusable calls", "Reduces duplication"],
                            ["Reduced Network Traffic", "Multiple operations in one call", "Lower network load"],
                            ["Maintainability", "Centralized business logic", "Easy updates"],
                            ["Error Handling", "TRY...CATCH support", "Better reliability"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "5. Practical Example: Customers Table"
                    },
                    {
                        "type": "table",
                        "headers": ["CustomerID", "CustomerName", "ContactName", "Country"],
                        "rows": [
                            [1, "Naveen", "Tulasi", "Sri Lanka"],
                            [2, "Maria", "Anders", "Germany"],
                            [3, "Ana", "Trujillo", "Mexico"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "Example 1: Creating a Stored Procedure"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE PROCEDURE GetCustomersByCountry\n    @Country VARCHAR(50)\nAS\nBEGIN\n    SELECT CustomerName, ContactName\n    FROM Customers\n    WHERE Country = @Country;\nEND;"
                    },

                    {
                        "type": "heading",
                        "text": "Example 2: Executing the Stored Procedure"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "EXEC GetCustomersByCountry @Country = 'Sri Lanka';"
                    },
                    {
                        "type": "table",
                        "headers": ["CustomerName", "ContactName"],
                        "rows": [
                            ["Naveen", "Tulasi"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "6. Execution & Permissions"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Use EXEC procedure_name to run stored procedures",
                            "Requires CREATE PROCEDURE permission",
                            "Cloud databases require proper role configuration"
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "7. Real-World Use Cases"
                    },
                    {
                        "type": "table",
                        "headers": ["Application Area", "Use Case", "Example Procedure"],
                        "rows": [
                            ["E-commerce", "Orders, invoices, stock updates", "ProcessOrder, UpdateStock"],
                            ["HR Management", "Payroll & salary calculations", "CalculateSalary"],
                            ["Validation", "Data checking before insert", "CheckDuplicateUser"],
                            ["Audit & Logging", "Track sensitive changes", "TrackUserUpdates"],
                            ["Reporting", "Monthly reports", "GenerateMonthlySalesReport"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "8. Best Practices for Stored Procedures"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Keep logic modular",
                            "Use TRY...CATCH for error handling",
                            "Avoid cursors unless necessary",
                            "Use parameters instead of hardcoded values",
                            "Optimize queries inside procedures",
                            "Add comments for maintainability"
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "9. Security Considerations"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Stored procedures reduce SQL injection risk",
                            "Use EXECUTE permissions instead of table permissions",
                            "Hide business logic inside stored procedures",
                            "Add audit logs for sensitive operations"
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "10. Performance Considerations"
                    },
                    {
                        "type": "table",
                        "headers": ["Factor", "Impact", "Optimization"],
                        "rows": [
                            ["Precompilation", "Faster execution plans", "Reuse execution plan"],
                            ["Network Reduction", "Fewer round trips", "Bundle operations"],
                            ["Parameter Sniffing", "Can cause slowdowns", "Use local variables"],
                            ["Recompilation", "Needed when stats change", "Monitor performance"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "11. Error Handling Example"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE PROCEDURE SafeProcedure\n    @InputParam INT\nAS\nBEGIN\n    BEGIN TRY\n        SELECT * FROM Table1 WHERE Column1 = @InputParam;\n    END TRY\n    BEGIN CATCH\n        SELECT ERROR_NUMBER() AS ErrorNumber,\n               ERROR_MESSAGE() AS ErrorMessage;\n    END CATCH\nEND;"
                    },

                    {
                        "type": "heading",
                        "text": "12. Parameter Types & Usage"
                    },
                    {
                        "type": "table",
                        "headers": ["Parameter Type", "Syntax", "Purpose"],
                        "rows": [
                            ["Input Parameter", "@Param DataType", "Send data into procedure"],
                            ["Output Parameter", "@Param DataType OUTPUT", "Return data from procedure"],
                            ["Default Parameter", "@Param DataType = Default", "Optional inputs"],
                            ["Return Value", "RETURN int", "Return status code"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "Example: Procedure with OUTPUT Parameter"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE PROCEDURE GetCustomerCount\n    @Country VARCHAR(50),\n    @Total INT OUTPUT\nAS\nBEGIN\n    SELECT @Total = COUNT(*)\n    FROM Customers\n    WHERE Country = @Country;\nEND;\n\nDECLARE @CountResult INT;\nEXEC GetCustomerCount 'Germany', @CountResult OUTPUT;\nSELECT @CountResult AS TotalCustomers;"
                    },

                    {
                        "type": "heading",
                        "text": "13. Maintenance & Version Control"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Centralize business logic",
                            "Store procedure definitions in Git",
                            "Test procedures before deployment",
                            "Plan version upgrades and deprecations"
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "14. Comparison with Other Database Objects"
                    },
                    {
                        "type": "table",
                        "headers": ["Feature", "Stored Procedure", "Function", "View"],
                        "rows": [
                            ["Return Type", "Multiple result sets", "Single value/table", "Virtual table"],
                            ["Parameters", "Input/Output", "Input only", "No parameters"],
                            ["DML Operations", "Allowed", "Not allowed", "Not allowed"],
                            ["Execution", "EXEC command", "Used in SELECT", "Used as table"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "15. Common Stored Procedure Patterns"
                    },

                    {
                        "type": "heading",
                        "text": "Pattern 1: CRUD Operations Procedure"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE PROCEDURE ManageCustomer\n    @Action VARCHAR(10),\n    @CustomerID INT = NULL,\n    @CustomerName VARCHAR(100) = NULL,\n    @ContactName VARCHAR(100) = NULL\nAS\nBEGIN\n    IF @Action = 'INSERT'\n        INSERT INTO Customers (CustomerName, ContactName)\n        VALUES (@CustomerName, @ContactName);\n\n    ELSE IF @Action = 'UPDATE'\n        UPDATE Customers\n        SET CustomerName = @CustomerName, ContactName = @ContactName\n        WHERE CustomerID = @CustomerID;\n\n    ELSE IF @Action = 'DELETE'\n        DELETE FROM Customers WHERE CustomerID = @CustomerID;\n\n    ELSE IF @Action = 'SELECT'\n        SELECT * FROM Customers WHERE CustomerID = @CustomerID;\nEND;"
                    },

                    {
                        "type": "heading",
                        "text": "Pattern 2: Transaction Handling Procedure"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE PROCEDURE ProcessOrderTransaction\n    @OrderID INT,\n    @ProductID INT,\n    @Quantity INT\nAS\nBEGIN\n    BEGIN TRANSACTION;\n    BEGIN TRY\n        UPDATE Inventory\n        SET Stock = Stock - @Quantity\n        WHERE ProductID = @ProductID;\n\n        INSERT INTO OrderDetails (OrderID, ProductID, Quantity)\n        VALUES (@OrderID, @ProductID, @Quantity);\n\n        COMMIT TRANSACTION;\n    END TRY\n    BEGIN CATCH\n        ROLLBACK TRANSACTION;\n        SELECT ERROR_MESSAGE() AS ErrorMessage;\n    END CATCH\nEND;"
                    }
                ]
            },
            {
                "name": "SQL Triggers",
                "content": [
                    {
                        "type": "heading",
                        "text": "1. Definition of SQL Trigger"
                    },
                    {
                        "type": "paragraph",
                        "text": "A trigger is a special stored procedure that automatically executes in response to specific database events such as INSERT, UPDATE, or DELETE on a table. Triggers help enforce business rules, maintain data integrity, log changes, and automate system actions without requiring manual execution."
                    },
                    {
                        "type": "table",
                        "headers": ["Aspect", "Description"],
                        "rows": [
                            ["Purpose", "Automatically respond to table events"],
                            ["Execution", "Fires without manual call"],
                            ["Trigger Points", "BEFORE or AFTER database operations"],
                            ["Supported Events", "INSERT, UPDATE, DELETE, DDL, LOGON"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "2. Basic Syntax of a Trigger"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TRIGGER trigger_name\nBEFORE | AFTER INSERT | UPDATE | DELETE\nON table_name\nFOR EACH ROW\nBEGIN\n    -- Trigger body logic\nEND;"
                    },
                    {
                        "type": "paragraph",
                        "text": "The trigger body contains SQL logic that runs automatically when the corresponding event occurs. Before triggers run before the event completes, while after triggers run after the operation is successfully executed."
                    },

                    {
                        "type": "heading",
                        "text": "3. Types of SQL Triggers"
                    },
                    {
                        "type": "table",
                        "headers": ["Trigger Type", "Description", "Example Use Case"],
                        "rows": [
                            ["DML Triggers", "Activate on INSERT, UPDATE, DELETE operations", "Prevent unauthorized updates, maintain audit logs"],
                            ["DDL Triggers", "Fire on schema changes like CREATE, ALTER, DROP", "Prevent table deletion or unauthorized schema modification"],
                            ["Logon Triggers", "Execute when a user logs into the database", "Security checks, connection auditing"],
                            ["Instead-Of Triggers", "Override default behavior of views", "Custom insert/update logic for complex views"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "4. Real-World Use Cases"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Automatically updating timestamps on record updates",
                            "Validating data before inserting into a table",
                            "Maintaining audit logs for sensitive tables",
                            "Cascading updates to related tables",
                            "Blocking malicious or accidental deletion of important tables",
                            "Generating computed fields before insertion (marks, total, percentage)"
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "5. Example Table Used for Trigger Demonstrations"
                    },
                    {
                        "type": "table",
                        "headers": ["StudentID", "Name", "Marks1", "Marks2", "Marks3", "Total", "Percentage"],
                        "rows": [
                            [101, "Ravi", 75, 80, 70, null, null],
                            [102, "Meena", 88, 92, 85, null, null]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "6. BEFORE Trigger Example: Calculate Total and Percentage"
                    },
                    {
                        "type": "paragraph",
                        "text": "A BEFORE INSERT trigger is useful when values must be computed before storing the record. In this example, the trigger calculates the total marks and percentage automatically before inserting the student’s record."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TRIGGER CalculateMarks\nBEFORE INSERT ON StudentMarks\nFOR EACH ROW\nBEGIN\n    SET NEW.Total = NEW.Marks1 + NEW.Marks2 + NEW.Marks3;\n    SET NEW.Percentage = (NEW.Total / 300) * 100;\nEND;"
                    },
                    {
                        "type": "paragraph",
                        "text": "This ensures that every new student record contains accurate total marks and percentage without manual calculation."
                    },

                    {
                        "type": "heading",
                        "text": "7. AFTER UPDATE Trigger Example: Auto-update Timestamp"
                    },
                    {
                        "type": "paragraph",
                        "text": "This trigger automatically updates the last_modified timestamp whenever a user updates their profile. AFTER triggers are ideal for logging actions or updating secondary fields."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TRIGGER UpdateUserTimestamp\nAFTER UPDATE ON Users\nFOR EACH ROW\nBEGIN\n    UPDATE Users SET last_modified = CURRENT_TIMESTAMP\n    WHERE UserID = NEW.UserID;\nEND;"
                    },

                    {
                        "type": "heading",
                        "text": "8. DML Trigger Example: Prevent Unauthorized DELETE"
                    },
                    {
                        "type": "paragraph",
                        "text": "DML triggers can block dangerous or unauthorized operations. This example prevents deleting rows from the Employees table."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TRIGGER PreventDelete\nBEFORE DELETE ON Employees\nFOR EACH ROW\nBEGIN\n    SIGNAL SQLSTATE '45000'\n    SET MESSAGE_TEXT = 'Deleting employees is not allowed!';\nEND;"
                    },

                    {
                        "type": "heading",
                        "text": "9. DDL Trigger Example: Prevent Table Deletion"
                    },
                    {
                        "type": "paragraph",
                        "text": "DDL triggers fire when a schema operation occurs. This example prevents dropping tables in the database."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TRIGGER PreventDrop\nON DATABASE\nFOR DROP_TABLE\nAS\nBEGIN\n    PRINT 'DROP TABLE operation is blocked!';\n    ROLLBACK TRANSACTION;\nEND;"
                    },

                    {
                        "type": "heading",
                        "text": "10. Viewing and Managing Triggers"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT name, is_instead_of_trigger FROM sys.triggers;"
                    },
                    {
                        "type": "paragraph",
                        "text": "This query retrieves all triggers in the database, including whether each trigger is an INSTEAD OF trigger."
                    },

                    {
                        "type": "heading",
                        "text": "Viewing Trigger Definition"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT OBJECT_DEFINITION(OBJECT_ID('trigger_name'));"
                    },

                    {
                        "type": "heading",
                        "text": "11. BEFORE vs AFTER Triggers"
                    },
                    {
                        "type": "table",
                        "headers": ["Trigger Type", "Execution Time", "Use Case"],
                        "rows": [
                            ["BEFORE Trigger", "Runs before data is inserted or updated", "Validate or modify incoming data"],
                            ["AFTER Trigger", "Runs after the operation completes", "Logging, cascading updates"],
                            ["INSTEAD OF Trigger", "Replaces default behavior", "Custom logic for views"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "12. Logon Trigger Example"
                    },
                    {
                        "type": "paragraph",
                        "text": "Logon triggers fire whenever a user connects to the SQL Server. These are useful for monitoring or restricting logins."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "CREATE TRIGGER TrackLogins\nON ALL SERVER\nFOR LOGON\nAS\nBEGIN\n    INSERT INTO LoginAudit(UserName, LoginTime)\n    VALUES (ORIGINAL_LOGIN(), CURRENT_TIMESTAMP);\nEND;"
                    },

                    {
                        "type": "heading",
                        "text": "13. Common Issues and Solutions"
                    },
                    {
                        "type": "table",
                        "headers": ["Issue", "Cause", "Solution"],
                        "rows": [
                            ["Trigger recursion", "Triggers call other triggers", "Disable nested triggers if unnecessary"],
                            ["Performance slowdown", "Too many triggers firing", "Use triggers only when necessary"],
                            ["Unexpected behavior", "Logic conflicts with app logic", "Document trigger behavior clearly"],
                            ["Infinite loops", "UPDATE inside UPDATE trigger", "Use conditions or flags to prevent recursion"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "14. Best Practices for Using Triggers"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Use triggers only when constraints or application logic cannot solve the problem",
                            "Avoid complex business logic inside triggers",
                            "Document every trigger clearly",
                            "Avoid nested triggers unless required",
                            "Test triggers with bulk operations",
                            "Log trigger failures for debugging"
                        ]
                    }
                ]
            },
            {
                "name": "SQL Performance Tuning",
                "content": [
                    {
                        "type": "heading",
                        "text": "1. Performance Tuning Definition & Importance"
                    },
                    {
                        "type": "paragraph",
                        "text": "SQL performance tuning is the process of optimizing queries, indexes, and database structures to improve execution speed, reduce server load, minimize response time, and ensure smooth database operations. Effective tuning prevents slowdowns, high CPU usage, and system lag."
                    },
                    {
                        "type": "table",
                        "headers": ["Aspect", "Impact"],
                        "rows": [
                            ["Poor Performance", "Slow databases, user frustration, business impact"],
                            ["Proper Tuning", "Efficient operations, faster response, stable performance"],
                            ["Key Goal", "Optimize resource utilization and query execution speed"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "2. Factors Affecting SQL Performance"
                    },
                    {
                        "type": "table",
                        "headers": ["Factor", "Impact on Performance", "Description"],
                        "rows": [
                            ["Table Size", "High", "Large tables with millions of rows slow down scans and joins"],
                            ["Joins", "High", "Multiple complex joins increase execution time"],
                            ["Aggregations", "High", "SUM, COUNT, AVG on large datasets require heavy processing"],
                            ["Concurrency", "Medium-High", "Many simultaneous requests cause resource contention"],
                            ["Indexes", "High", "Proper indexing improves speed; bad indexing slows performance"],
                            ["Network Latency", "Medium", "Delays during data transfer between application and DB"],
                            ["Hardware Resources", "Medium-High", "Limited CPU, RAM, or disk reduces performance"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "3. Identifying Slow Queries"
                    },
                    {
                        "type": "heading",
                        "text": "A. Execution Plan Analysis"
                    },
                    {
                        "type": "paragraph",
                        "text": "Execution plans show how SQL Server processes a query. They reveal inefficiencies such as missing indexes, table scans, and expensive operations."
                    },
                    {
                        "type": "list",
                        "items": [
                            "Open SQL Server Management Studio",
                            "Select 'Database Engine Query'",
                            "Enable 'Include Actual Execution Plan'",
                            "Execute query and view plan in the Execution Plan tab"
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "B. Resource Usage Monitoring"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Monitor CPU, memory, and disk utilization",
                            "Use Windows Performance Monitor",
                            "Track SQL Server performance counters to identify bottlenecks"
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "C. Dynamic Management Views (DMVs)"
                    },
                    {
                        "type": "table",
                        "headers": ["DMV", "Purpose"],
                        "rows": [
                            ["sys.dm_exec_query_stats", "Query performance statistics"],
                            ["sys.dm_exec_requests", "Current executing queries"],
                            ["sys.dm_exec_sessions", "Active user sessions"],
                            ["sys.dm_os_wait_stats", "Wait statistics for identifying bottlenecks"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "4. SQL Query Optimization Techniques"
                    },
                    {
                        "type": "table",
                        "headers": ["Technique", "Inefficient Query", "Optimized Query", "Benefit"],
                        "rows": [
                            ["Select Specific Columns", "SELECT * FROM GeeksTable;", "SELECT FirstName, LastName FROM GeeksTable;", "Reduces I/O and improves speed"],
                            ["Avoid SELECT DISTINCT", "SELECT DISTINCT FirstName FROM GeeksTable;", "SELECT FirstName FROM GeeksTable WHERE FirstName IS NOT NULL;", "Avoids unnecessary sorting"],
                            ["Use INNER JOIN Instead of WHERE Joins", "SELECT ... FROM A, B WHERE A.id = B.id;", "SELECT ... FROM A INNER JOIN B ON A.id = B.id;", "Improved optimization and readability"],
                            ["Filter Early Using WHERE Instead of HAVING", "HAVING date BETWEEN ...", "WHERE date BETWEEN ...", "Avoids processing unnecessary rows"],
                            ["Avoid Leading Wildcards", "WHERE City LIKE '%No%'", "WHERE City LIKE 'No%'", "Allows index usage"],
                            ["Use LIMIT for Sampling", "Full table scan", "SELECT * FROM Table LIMIT 10;", "Less load during testing"],
                            ["Run Heavy Queries Off-Peak", "Running queries during peak load", "Schedule jobs at night or low traffic times", "Reduces user impact"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "5. Index Tuning"
                    },
                    {
                        "type": "heading",
                        "text": "A. Index Creation Best Practices"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Use short indexes for faster comparisons",
                            "Create indexes on columns with high selectivity",
                            "Use clustered indexes for frequently used sorting",
                            "Avoid indexing frequently updated columns",
                            "Update statistics regularly"
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "B. Index Tuning Process"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Analyze query patterns and most-used filters",
                            "Check execution plans for missing index suggestions",
                            "Create indexes on WHERE, JOIN, ORDER BY columns",
                            "Remove unused or duplicate indexes",
                            "Monitor index fragmentation"
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "C. Index Considerations"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Balance read performance with write overhead",
                            "Use covering indexes for common queries",
                            "Rebuild and reorganize indexes periodically",
                            "Ensure statistics are updated for better optimizer decisions"
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "6. Performance Tuning Tools"
                    },
                    {
                        "type": "table",
                        "headers": ["Tool", "Vendor", "Purpose"],
                        "rows": [
                            ["SQL Sentry", "SolarWinds", "Monitoring and tuning SQL performance"],
                            ["SQL Profiler", "Microsoft", "Trace and analyze SQL events"],
                            ["SQL Index Manager", "Red Gate", "Index optimization"],
                            ["SQL Diagnostic Manager", "IDERA", "Real-time monitoring"],
                            ["Execution Plan Analyzer", "Various", "Optimize execution plans"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "7. Query Optimization Patterns"
                    },
                    {
                        "type": "heading",
                        "text": "Pattern 1: Reduce Result Set Early"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- Filter before join\nSELECT *\nFROM (SELECT * FROM LargeTable1 WHERE date > '2024-01-01') lt1\nJOIN LargeTable2 lt2 ON lt1.id = lt2.id;"
                    },

                    {
                        "type": "heading",
                        "text": "Pattern 2: EXISTS vs IN"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- Efficient query using EXISTS\nSELECT * FROM Customers c\nWHERE EXISTS (SELECT 1 FROM Orders o WHERE o.CustomerID = c.CustomerID);"
                    },

                    {
                        "type": "heading",
                        "text": "Pattern 3: Avoid Functions on Indexed Columns"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "-- Instead of YEAR(OrderDate) use range\nSELECT * FROM Orders\nWHERE OrderDate >= '2024-01-01' AND OrderDate < '2025-01-01';"
                    },

                    {
                        "type": "heading",
                        "text": "8. Database Design Considerations"
                    },
                    {
                        "type": "table",
                        "headers": ["Design Aspect", "Performance Impact", "Best Practice"],
                        "rows": [
                            ["Normalization", "More joins increase time", "Balance normalization with query patterns"],
                            ["Data Types", "Affects storage and speed", "Use smallest suitable data types"],
                            ["Partitioning", "Improves large table performance", "Partition by date or key columns"],
                            ["Denormalization", "Faster reads but duplicate data", "Use for read-heavy systems"],
                            ["Archiving", "Reducing active table size", "Regularly archive old data"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "9. Common Performance Anti-Patterns"
                    },
                    {
                        "type": "table",
                        "headers": ["Anti-Pattern", "Problem", "Solution"],
                        "rows": [
                            ["N+1 Query Problem", "Many small queries instead of one", "Use JOINs or batch queries"],
                            ["Cartesian Products", "Unintended cross joins", "Always specify join conditions"],
                            ["Over-normalization", "Too many joins", "Strategic denormalization"],
                            ["Missing WHERE Clause", "Full table scans", "Add filtering conditions"],
                            ["Implicit Conversions", "Prevents index usage", "Match column and parameter data types"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "10. Monitoring & Maintenance Routine"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Daily: Monitor long-running queries and resource usage",
                            "Weekly: Review execution plans, update statistics",
                            "Monthly: Rebuild indexes, analyze trends, capacity planning"
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "11. Hardware & Infrastructure Considerations"
                    },
                    {
                        "type": "table",
                        "headers": ["Component", "Impact", "Optimization Tips"],
                        "rows": [
                            ["CPU", "Affects query processing speed", "Increase cores, optimize queries"],
                            ["Memory", "Used for caching and sorting", "Ensure enough RAM for working sets"],
                            ["Disk I/O", "Affects read/write operations", "Use SSDs for better performance"],
                            ["Network", "Affects data transfer time", "Reduce data size, improve pooling"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "12. Query Plan Analysis Elements"
                    },
                    {
                        "type": "table",
                        "headers": ["Plan Element", "Indicates", "Action"],
                        "rows": [
                            ["Table Scan", "Full table read", "Add indexes"],
                            ["Index Scan", "Full index read", "Optimize filters"],
                            ["Index Seek", "Efficient index usage", "Good performance"],
                            ["Key Lookup", "Extra row fetches", "Use covering indexes"],
                            ["Sort/Hash Match", "Heavy sorting operations", "Ensure adequate memory"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "13. Real-World Optimization Examples"
                    },
                    {
                        "type": "heading",
                        "text": "Example 1: E-commerce Order Query"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT o.OrderID, o.OrderDate, c.Name, p.ProductName, od.Quantity, od.Price\nFROM Orders o\nJOIN Customers c ON o.CustomerID = c.CustomerID\nJOIN OrderDetails od ON o.OrderID = od.OrderID\nJOIN Products p ON od.ProductID = p.ProductID\nWHERE o.OrderDate >= '2024-01-01' AND o.OrderDate < '2024-02-01';"
                    },

                    {
                        "type": "heading",
                        "text": "Example 2: Aggregation Optimization"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT CustomerID, COUNT(*) AS OrderCount, SUM(Amount) AS Total\nFROM Orders\nWHERE Amount > 0\nGROUP BY CustomerID\nHAVING SUM(Amount) > 1000;"
                    },

                    {
                        "type": "heading",
                        "text": "14. Advanced Tuning Techniques"
                    },
                    {
                        "type": "heading",
                        "text": "A. Query Hints (Use Sparingly)"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT * FROM Orders WITH (INDEX(IX_OrderDate))\nWHERE OrderDate > '2024-01-01';"
                    },
                    {
                        "type": "heading",
                        "text": "B. Temp Tables vs CTEs"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "WITH RecentOrders AS (\n    SELECT * FROM Orders WHERE OrderDate > '2024-01-01'\n)\nSELECT * FROM RecentOrders;"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "SELECT * INTO #RecentOrders FROM Orders WHERE OrderDate > '2024-01-01';\nSELECT * FROM #RecentOrders;"
                    },

                    {
                        "type": "heading",
                        "text": "C. Parallel Execution"
                    },
                    {
                        "type": "paragraph",
                        "text": "Tune MAXDOP settings, balance parallel vs serial execution, and consider workload groups for resource governance."
                    },

                    {
                        "type": "heading",
                        "text": "15. Continuous Improvement Process"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Monitor performance continuously",
                            "Identify bottlenecks using DMVs and execution plans",
                            "Apply query, index, and schema optimizations",
                            "Test in staging environments",
                            "Deploy changes safely",
                            "Document improvements for future reference"
                        ]
                    }
                ]
            },
            {
                "name": "SQL Transactions",
                "content": [
                    {
                        "type": "heading",
                        "text": "1. Transaction Definition & Purpose"
                    },
                    {
                        "type": "paragraph",
                        "text": "A transaction is a sequence of one or more SQL operations that execute as a single logical unit of work. Either all statements inside the transaction succeed and the changes are committed permanently, or none of them apply (rolled back). Transactions ensure database consistency, error recovery, and reliability."
                    },
                    {
                        "type": "table",
                        "headers": ["Aspect", "Description"],
                        "rows": [
                            ["Atomic Nature", "Executes everything together — all operations succeed or all fail"],
                            ["Data Integrity", "Prevents partial updates that can corrupt data"],
                            ["Unit of Work", "Groups related SQL statements into one safe operation"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "2. ACID Properties"
                    },
                    {
                        "type": "paragraph",
                        "text": "ACID is the foundation of transaction reliability. It ensures transactions behave consistently even under errors, failures, or concurrent operations."
                    },
                    {
                        "type": "table",
                        "headers": ["Property", "Description", "Purpose"],
                        "rows": [
                            ["Atomicity", "All operations succeed or none apply", "Prevents partial or corrupt data changes"],
                            ["Consistency", "Database transitions from one valid state to another", "Maintains rules, constraints, indexes, and relationships"],
                            ["Isolation", "Each transaction executes independently", "Ensures correctness under concurrent transactions"],
                            ["Durability", "Committed changes persist even after a crash", "Guarantees permanent storage"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "3. Transaction Control Commands"
                    },
                    {
                        "type": "table",
                        "headers": ["Command", "Purpose", "Syntax"],
                        "rows": [
                            ["BEGIN TRANSACTION", "Starts a new transaction block", "BEGIN TRANSACTION;"],
                            ["COMMIT", "Saves and finalizes all changes", "COMMIT;"],
                            ["ROLLBACK", "Cancels the transaction and reverts all changes", "ROLLBACK;"],
                            ["SAVEPOINT", "Creates a checkpoint inside a transaction", "SAVEPOINT savepoint_name;"],
                            ["ROLLBACK TO SAVEPOINT", "Undo changes only up to a specific savepoint", "ROLLBACK TO savepoint_name;"],
                            ["RELEASE SAVEPOINT", "Deletes a savepoint", "RELEASE SAVEPOINT savepoint_name;"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "4. Example Table: Student"
                    },
                    {
                        "type": "table",
                        "headers": ["ID", "Name", "Age", "Grade"],
                        "rows": [
                            [1, "Alice", 20, "A"],
                            [2, "Bob", 22, "B"],
                            [3, "Charlie", 20, "C"],
                            [4, "Diana", 21, "A"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "5. Practical Examples"
                    },

                    {
                        "type": "heading",
                        "text": "A. Complete Bank Transfer Transaction"
                    },
                    {
                        "type": "paragraph",
                        "text": "Money transfer is a classic example of a transaction. Both debit and credit must succeed — if any fails, the transaction should rollback."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "BEGIN TRANSACTION;\n\nUPDATE Accounts\nSET Balance = Balance - 150\nWHERE AccountID = 'A';\n\nUPDATE Accounts\nSET Balance = Balance + 150\nWHERE AccountID = 'B';\n\nCOMMIT; -- Saves changes permanently\n-- If any error occurs, use ROLLBACK;"
                    },

                    {
                        "type": "heading",
                        "text": "B. COMMIT Example"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "DELETE FROM Student WHERE Age = 20;\nCOMMIT;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Before COMMIT, changes remain temporary. After COMMIT, deleted rows are permanently removed."
                    },
                    {
                        "type": "table",
                        "headers": ["State", "Record Count"],
                        "rows": [
                            ["Before COMMIT", "4 records"],
                            ["After COMMIT", "2 records (Age 20 removed)"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "C. ROLLBACK Example"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "DELETE FROM Student WHERE Age = 20;\nROLLBACK;"
                    },
                    {
                        "type": "paragraph",
                        "text": "ROLLBACK undoes the delete operation. The Student table remains unchanged."
                    },

                    {
                        "type": "heading",
                        "text": "D. SAVEPOINT Example"
                    },
                    {
                        "type": "paragraph",
                        "text": "SAVEPOINT allows partial rollback inside a larger transaction. It is useful in long transactions where only a specific section needs undoing."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "BEGIN TRANSACTION;\n\nSAVEPOINT SP1;\nDELETE FROM Student WHERE Age = 20; -- Deletes Alice and Charlie\n\nSAVEPOINT SP2;\nUPDATE Student SET Grade = 'A+' WHERE Name = 'Bob';\n\nROLLBACK TO SP2; -- Undo Bob update only\n\nCOMMIT; -- Deletes still applied"
                    },

                    {
                        "type": "heading",
                        "text": "6. Nested Transactions (Simulated with Savepoints)"
                    },
                    {
                        "type": "paragraph",
                        "text": "SQL Server does not support true nested transactions, but SAVEPOINTS emulate nested behavior by allowing partial rollbacks."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "BEGIN TRANSACTION;\nUPDATE Students SET Grade = 'B' WHERE ID = 3;\nSAVEPOINT inner_txn;\nUPDATE Students SET Grade = 'A' WHERE ID = 2;\nROLLBACK TO inner_txn;\nCOMMIT;"
                    },

                    {
                        "type": "heading",
                        "text": "7. Isolation Levels (Transaction Concurrency Control)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Isolation levels control how transactions interact with each other in multi-user environments. They prevent issues like dirty reads, non-repeatable reads, and phantom reads."
                    },
                    {
                        "type": "table",
                        "headers": ["Isolation Level", "Description", "Prevents"],
                        "rows": [
                            ["READ UNCOMMITTED", "Reads uncommitted changes", "Nothing (allows dirty reads)"],
                            ["READ COMMITTED", "Reads only committed data", "Dirty reads"],
                            ["REPEATABLE READ", "Locks rows to prevent changes", "Non-repeatable reads"],
                            ["SERIALIZABLE", "Highest isolation, full range locks", "Phantom reads"],
                            ["SNAPSHOT", "Uses row versioning", "Most concurrency issues"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "8. Transaction Errors & Automatic Rollbacks"
                    },
                    {
                        "type": "paragraph",
                        "text": "When SQL Server encounters an error inside a transaction, behavior depends on the error type. Severe errors may automatically roll back the entire transaction."
                    },
                    {
                        "type": "list",
                        "items": [
                            "Constraint violations (PRIMARY KEY, UNIQUE)",
                            "Foreign key failures",
                            "Arithmetic errors (division by zero)",
                            "Deadlocks (one transaction forced to rollback)"
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "9. Using TRY...CATCH with Transactions"
                    },
                    {
                        "type": "paragraph",
                        "text": "TRY...CATCH ensures safer transaction control. Errors inside TRY trigger the CATCH block, where rollback can occur automatically."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "text": "BEGIN TRY\n    BEGIN TRANSACTION;\n\n    UPDATE Accounts SET Balance = Balance - 200 WHERE AccountID = 'A';\n    UPDATE Accounts SET Balance = Balance + 200 WHERE AccountID = 'B';\n\n    COMMIT;\nEND TRY\nBEGIN CATCH\n    ROLLBACK;\n    SELECT ERROR_MESSAGE() AS ErrorMessage;\nEND CATCH;"
                    },

                    {
                        "type": "heading",
                        "text": "10. Real-World Use Cases"
                    },
                    {
                        "type": "table",
                        "headers": ["Application Area", "Transaction Use"],
                        "rows": [
                            ["Banking", "Money transfer, deposits, withdrawals"],
                            ["E-commerce", "Order placement, payment processing"],
                            ["Inventory Management", "Stock updates, shipment deduction"],
                            ["HR Management", "Payroll calculations, tax deductions"],
                            ["Booking Systems", "Ticket reservations, cancellations"]
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "11. Common Problems Without Transactions"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Partially updated data causing corruption",
                            "Double payments during checkout",
                            "Inconsistent inventory counts",
                            "Broken foreign key relationships",
                            "Unsuccessful operations still modifying data"
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "12. Best Practices for Transaction Handling"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Keep transactions short to reduce locking",
                            "Avoid user input inside transactions",
                            "Use proper indexes to speed up transactional queries",
                            "Do not open transactions across long-running processes",
                            "Use TRY...CATCH for safe error handling",
                            "Commit early, rollback on any failure",
                            "Prefer optimistic concurrency where possible"
                        ]
                    },

                    {
                        "type": "heading",
                        "text": "13. Summary of Transaction Concepts"
                    },
                    {
                        "type": "table",
                        "headers": ["Concept", "Meaning", "Benefit"],
                        "rows": [
                            ["Transaction", "Group of SQL operations", "Ensures consistency"],
                            ["ACID", "Atomicity, Consistency, Isolation, Durability", "Guarantees reliable data"],
                            ["COMMIT", "Save all changes", "Finalizes work"],
                            ["ROLLBACK", "Undo all changes", "Error recovery"],
                            ["SAVEPOINT", "Partial rollback checkpoint", "Finer control"],
                            ["Isolation Levels", "Concurrency control", "Avoids data conflicts"]
                        ]
                    }
                ]
            },
            {
                name: "SQL Injection",
                content: [
                    {
                        type: "heading",
                        text: "1. SQL Injection Definition & Overview"
                    },
                    {
                        type: "paragraph",
                        text: "SQL Injection is an input-validation vulnerability where attackers insert harmful SQL commands in user-controlled fields to manipulate or bypass database queries."
                    },
                    {
                        type: "table",
                        headers: ["Aspect", "Description"],
                        rows: [
                            ["Vulnerability Type", "Input validation flaw allowing malicious SQL execution"],
                            ["Attack Vector", "User input fields such as login forms, search bars, URL parameters"],
                            ["Impact", "Data theft, modification, authentication bypass, full system compromise"]
                        ]
                    },
                    {
                        type: "heading",
                        text: "2. Real-World Example"
                    },
                    {
                        type: "paragraph",
                        text: "A famous breach occurred at Capital One in 2019 due to a misconfigured web application where SQL injection enabled attackers to access sensitive customer information."
                    },
                    {
                        type: "list",
                        items: [
                            "100+ million customer records exposed",
                            "Leaked data: names, addresses, credit scores",
                            "Caused millions of dollars in financial penalties"
                        ]
                    },
                    {
                        type: "heading",
                        text: "3. Security Levels Demonstration (DVWA)"
                    },
                    {
                        type: "table",
                        headers: ["Security Level", "Protection Method", "Vulnerability", "Example Attack"],
                        rows: [
                            ["Low Security", "No input filtering", "Highly vulnerable", "1' OR '1'='1"],
                            ["Medium Security", "Basic escaping (addslashes)", "Moderately vulnerable", "1 OR 1=1"],
                            ["High Security", "Prepared statements", "Very secure", "All SQLi prevented"]
                        ]
                    },
                    {
                        type: "heading",
                        text: "4. Types of SQL Injection"
                    },
                    {
                        type: "table",
                        headers: ["Injection Type", "Description", "Method", "Goal"],
                        rows: [
                            ["Error-Based SQL Injection", "Uses database error messages to extract information", "Broken queries", "Reveal table/column names"],
                            ["Union-Based SQL Injection", "Extracts data by merging results with UNION", "UNION SELECT", "Dump data from other tables"],
                            ["Blind SQL Injection", "No error messages; uses time or boolean checks", "IF statements, SLEEP()", "Infer data slowly from responses"]
                        ]
                    },
                    {
                        type: "heading",
                        text: "5. Error-Based SQL Injection"
                    },
                    {
                        type: "paragraph",
                        text: "Attackers intentionally break queries to force database error messages, which reveal internal structure."
                    },
                    {
                        type: "code",
                        language: "sql",
                        text: "SELECT * FROM users WHERE id = '$id';"
                    },
                    {
                        type: "list",
                        items: [
                            "Attacker injects: ' ",
                            "Database returns syntax error showing table details",
                            "Attackers refine payloads to extract schema information"
                        ]
                    },
                    {
                        type: "heading",
                        text: "6. Union-Based SQL Injection"
                    },
                    {
                        type: "paragraph",
                        text: "Attackers use UNION to append malicious SELECT queries and extract sensitive data."
                    },
                    {
                        type: "list",
                        items: [
                            "Determine the number of columns using ORDER BY",
                            "Match data types and column count",
                            "Inject UNION SELECT statements"
                        ]
                    },
                    {
                        type: "code",
                        language: "sql",
                        text: "' ORDER BY 1 --"
                    },
                    {
                        type: "code",
                        language: "sql",
                        text: "' UNION SELECT username, password FROM users --"
                    },
                    {
                        type: "heading",
                        text: "7. Blind SQL Injection"
                    },
                    {
                        type: "paragraph",
                        text: "Occurs when the database does not show errors. Attackers rely on page behavior, boolean logic, or time delays."
                    },
                    {
                        type: "heading",
                        text: "Boolean-Based"
                    },
                    {
                        type: "code",
                        language: "sql",
                        text: `admin' AND 1=1 --
admin' AND 1=2 --`
                    },
                    {
                        type: "heading",
                        text: "Time-Based"
                    },
                    {
                        type: "code",
                        language: "sql",
                        text: "admin' AND SLEEP(5) --"
                    },
                    {
                        type: "heading",
                        text: "8. Impact of SQL Injection Attacks"
                    },
                    {
                        type: "table",
                        headers: ["Impact Category", "Specific Consequences"],
                        rows: [
                            ["Data Theft", "Unauthorized access to personal or financial data"],
                            ["Data Manipulation", "Attackers modify/delete database records"],
                            ["Privilege Escalation", "Bypass login to gain admin access"],
                            ["Service Disruption", "Slowdowns, crashes, or corrupted data"],
                            ["Financial Loss", "Regulatory fines, downtime costs"]
                        ]
                    },
                    {
                        type: "heading",
                        text: "9. Prevention Techniques"
                    },
                    {
                        type: "table",
                        headers: ["Prevention Method", "Description", "Implementation"],
                        rows: [
                            ["Prepared Statements", "Separate SQL logic from user input", "Parameterized queries"],
                            ["Stored Procedures", "Internal SQL execution", "Business logic in DB"],
                            ["Input Validation", "Whitelist allowed characters", "Regex checks"],
                            ["Least Privilege", "Limit database permissions", "Remove DROP/ALTER rights"],
                            ["Error Handling", "Hide SQL errors from users", "Log errors internally"]
                        ]
                    },
                    {
                        type: "heading",
                        text: "10. Implementation Examples"
                    },
                    {
                        type: "heading",
                        text: "A. Prepared Statements (PHP/MySQLi)"
                    },
                    {
                        type: "code",
                        language: "php",
                        text: `$stmt = $conn->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
$stmt->bind_param("ss", $username, $password);
$stmt->execute();`
                    },
                    {
                        type: "heading",
                        text: "B. Stored Procedure Example"
                    },
                    {
                        type: "code",
                        language: "sql",
                        text: `CREATE PROCEDURE GetUserByUsername(IN uname VARCHAR(50))
BEGIN
   SELECT * FROM users WHERE username = uname;
END;`
                    },
                    {
                        type: "heading",
                        text: "C. Input Validation Example"
                    },
                    {
                        type: "code",
                        language: "python",
                        text: `import re
if not re.match("^[a-zA-Z0-9]+$", username):
    raise ValueError("Invalid username")`
                    },
                    {
                        type: "heading",
                        text: "11. Security Testing Process"
                    },
                    {
                        type: "list",
                        items: [
                            "Identify input fields accepting user data",
                            "Inject test payloads to check for vulnerabilities",
                            "Use automated tools like SQLMap",
                            "Extract data safely in a test environment",
                            "Document findings and remediation steps"
                        ]
                    },
                    {
                        type: "heading",
                        text: "12. Common Attack Payloads"
                    },
                    {
                        type: "table",
                        headers: ["Purpose", "Payload Example", "Effect"],
                        rows: [
                            ["Authentication Bypass", "' OR '1'='1' --", "Login bypass"],
                            ["Test Column Count", "' UNION SELECT 1,2,3 --", "Identify number of columns"],
                            ["Read Database Version", "' AND 1=CONVERT(int, @@version) --", "Extract DB version"],
                            ["Read Files (MySQL)", "' UNION SELECT load_file('/etc/passwd'),2,3 --", "Access server files"]
                        ]
                    },
                    {
                        type: "heading",
                        text: "13. Defense in Depth Strategy"
                    },
                    {
                        type: "table",
                        headers: ["Layer", "Defense Mechanism", "Purpose"],
                        rows: [
                            ["Application", "Input validation + prepared statements", "Primary protection"],
                            ["Database", "Least privilege, stored procedures", "Limit impact"],
                            ["Network", "WAF (Web Application Firewall)", "Block malicious traffic"],
                            ["Monitoring", "Logs + IDS systems", "Detect suspicious activity"]
                        ]
                    },
                    {
                        type: "heading",
                        text: "14. Tools for Testing & Prevention"
                    },
                    {
                        type: "table",
                        headers: ["Tool Category", "Examples", "Purpose"],
                        rows: [
                            ["Vulnerability Scanners", "SQLMap, Acunetix, Nessus", "Find SQLi vulnerabilities"],
                            ["Web Application Firewalls", "ModSecurity, Cloudflare WAF", "Filter malicious requests"],
                            ["Secure Frameworks", "Django, Spring, Rails", "Auto-protect against SQLi"],
                            ["Code Analysis Tools", "SonarQube, Fortify", "Detect insecure code"]
                        ]
                    },
                    {
                        type: "heading",
                        text: "15. Incident Response Steps"
                    },
                    {
                        type: "list",
                        items: [
                            "Contain the attack by blocking the vulnerable endpoint",
                            "Investigate logs to find the exploit path",
                            "Patch vulnerabilities and enforce validation rules",
                            "Restore affected databases from safe backups",
                            "Implement stronger monitoring and alerting"
                        ]
                    },
                    {
                        type: "heading",
                        text: "16. Developer Training & Awareness"
                    },
                    {
                        type: "table",
                        headers: ["Training Aspect", "Content", "Frequency"],
                        rows: [
                            ["Secure Coding", "Input validation, parameter usage", "Ongoing"],
                            ["Code Review", "Check for SQL concatenation", "Per release"],
                            ["Threat Modeling", "Identify injection vectors", "During design"],
                            ["Penetration Testing", "Simulate SQLi attacks", "Quarterly"]
                        ]
                    },
                    {
                        type: "heading",
                        text: "17. Continuous Monitoring"
                    },
                    {
                        type: "table",
                        headers: ["Monitoring Aspect", "Implementation", "Alert Threshold"],
                        rows: [
                            ["Suspicious Queries", "Log all DB queries", "Frequent failures"],
                            ["Input Patterns", "Detect SQL keywords", "High occurrence"],
                            ["Error Rates", "Track SQL error frequency", "Spike in errors"],
                            ["Performance", "Monitor long-running queries", "Slow response time"]
                        ]
                    }
                ]
            }
        ];

        for (const topicData of topicsData) {
            console.log(`Processing topic: ${topicData.name}`);

            // Check if topic exists
            const existingTopic = await Topic.findOne({
                name: topicData.name,
                subjectId: subject._id
            });

            if (existingTopic) {
                console.log(`Topic exists, updating content...`);

                // Update full content
                await FullTopicData.findOneAndUpdate(
                    { topicId: existingTopic._id },
                    {
                        topicId: existingTopic._id,
                        content: topicData.content
                    },
                    { upsert: true }
                );
            } else {
                console.log(`Creating new topic...`);
                // Create topic in Topic collection
                const newTopic = new Topic({
                    name: topicData.name,
                    subjectId: subject._id
                });
                await newTopic.save();

                // Create full content
                const fullContent = new FullTopicData({
                    topicId: newTopic._id,
                    content: topicData.content
                });
                await fullContent.save();
                console.log(`Created topic with ID: ${newTopic._id}`);
            }
        }

        console.log('\n✅ SQL Topics Seeded Successfully!');

    } catch (error) {
        console.error('❌ Error seeding SQL topics:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

seedSQLTopics();
