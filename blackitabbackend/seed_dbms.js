/**
 * ============================================================================
 * DBMS DATABASE SEEDING SCRIPT
 * ============================================================================
 * 
 * This script populates the database with DBMS subject, topics, and content.
 * It's designed to be run manually to initialize or reset the DBMS data.
 * 
 * Usage:
 * node seed_dbms.js
 * 
 * Features:
 * - Progress indicator showing which topic is being processed
 * - Percentage completion display
 * - Total count of topics inserted
 * - Detailed logging of each step
 * 
 * What it does:
 * 1. Connects to MongoDB
 * 2. Creates/finds the DBMS subject
 * 3. Deletes existing DBMS topics and content (fresh start)
 * 4. Inserts new topics into 'topics' collection
 * 5. Inserts full content into 'full_data_of_topics' collection
 * 6. Shows progress for each topic
 * 7. Disconnects from database
 * 
 * Data Structure:
 * - topicsData array contains topic objects
 * - Each topic has: name (required), content (optional)
 * - Topics without content: Only created in 'topics' collection
 * - Topics with content: Created in both 'topics' and 'full_data_of_topics'
 * 
 * Content Block Types:
 * - paragraph: { type: "paragraph", text: "..." }
 * - heading: { type: "heading", text: "..." }
 * - list: { type: "list", title: "...", items: [...] }
 * - numbered_list: { type: "numbered_list", items: [...] }
 * - image: { type: "image", src: "...", alt: "...", caption: "..." }
 * 
 * Why Separate Collections?
 * - 'topics' collection: Lightweight, fast listing (just names and IDs)
 * - 'full_data_of_topics': Heavy content (paragraphs, lists, images)
 * - Improves performance when loading topic lists
 */

// Import Mongoose for database operations
const mongoose = require('mongoose');

// Import database models
const Subject = require('./models/Subject');                    // Subject model (DBMS, OS, etc.)
const Topic = require('./models/Topic');                        // Topic model (lightweight)
const FullTopicData = require('./models/full_data_of_topics');  // Full content model

// Load environment variables from .env file
// This makes process.env.MONGODB_URI available
require('dotenv').config();

/**
 * Helper function to display progress
 * Shows current topic number, total topics, percentage, and topic name
 */
const showProgress = (current, total, topicName) => {
    const percentage = Math.round((current / total) * 100);
    const progressBar = '█'.repeat(Math.floor(percentage / 2)) + '░'.repeat(50 - Math.floor(percentage / 2));
    console.log(`\n[${current}/${total}] ${percentage}% ${progressBar}`);
    console.log(`Processing: "${topicName}"`);
};

/**
 * Main seeding function
 * This async function handles the entire seeding process
 */
const seedDBMS = async () => {
    try {
        // ========================================
        // STEP 1: CONNECT TO DATABASE
        // ========================================
        // Connect to MongoDB using connection string from environment variable
        console.log('\n🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // ========================================
        // STEP 2: CREATE OR FIND SUBJECT
        // ========================================
        // Check if DBMS subject already exists in database
        // findOne returns null if not found
        console.log('\n📚 Checking for DBMS subject...');
        let subject = await Subject.findOne({ name: 'DBMS' });

        if (!subject) {
            // Subject doesn't exist, create new one
            subject = new Subject({
                name: 'DBMS',
                description: 'Database Management System complete syllabus'
            });
            // Save to database and get the created document with _id
            await subject.save();
            console.log('✅ Created Subject: DBMS');
        } else {
            // Subject already exists, use existing one
            // This prevents duplicate subjects
            console.log('✅ Subject DBMS already exists');
        }

        // ========================================
        // STEP 3: DEFINE TOPICS DATA
        // ========================================
        // Array of topic objects
        // Each object has:
        // - name: Topic title (required)
        // - content: Array of content blocks (optional)
        // 
        // Topics without content will only be created in 'topics' collection
        // Topics with content will be created in both collections
        const topicsData = [

            {
                "name": "Introduction of DBMS",
                "content": [
                    {
                        "type": "heading",
                        "text": "Introduction to DBMS (Database Management System)"
                    },
                    {
                        "type": "paragraph",
                        "text": "A DBMS (Database Management System) is software used to store, manage, and retrieve data in an organised way. It enables users to handle large amounts of data easily and securely."
                    },
                    {
                        "type": "heading",
                        "text": "Why DBMS is Important"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Helps users create, update, and search data efficiently.",
                            "Ensures data integrity, consistency, and security.",
                            "Reduces data repetition (redundancy) and inconsistency.",
                            "Supports multiple users simultaneously.",
                            "Manages transactions, backups, and recovery automatically."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "How DBMS Works"
                    },
                    {
                        "type": "paragraph",
                        "text": "A DBMS acts as a bridge between the database and the users or applications. It uses APIs to securely handle data requests so that users do not directly access the database files."
                    },
                    {
                        "type": "heading",
                        "text": "Problems with Traditional File-Based Systems"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Data Redundancy: Same data stored in multiple files.",
                            "Data Inconsistency: Different or outdated copies of data.",
                            "Difficult Access: Users had to manually search for files.",
                            "Poor Security: No control over who can access or change data.",
                            "Single-User Access: Multiple people couldn't use the system at once.",
                            "No Backup/Recovery: Data loss was permanent."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: A university storing Academics, Results, and Hostel data in different files often faced these issues."
                    },
                    {
                        "type": "heading",
                        "text": "Components of DBMS Applications"
                    },
                    {
                        "type": "numbered_list",
                        "items": [
                            "Hardware – Physical devices like servers, disks, RAM, and networking devices.",
                            "Software – DBMS software (MySQL, Oracle, PostgreSQL), operating system, and tools for data management.",
                            "Data – Actual user information and metadata (data about data).",
                            "Procedures – Rules for setup, validation, backups, access control, and reporting.",
                            "Database Access Language – SQL commands used to interact with the database.",
                            "People – DBAs, developers, and end users."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Types of DBMS"
                    },
                    {
                        "type": "numbered_list",
                        "items": [
                            "Relational DBMS (RDBMS) – Stores data in tables; uses SQL. Examples: MySQL, Oracle, PostgreSQL.",
                            "NoSQL DBMS – Non-relational; supports large-scale unstructured data. Examples: MongoDB, Cassandra.",
                            "Object-Oriented DBMS – Stores data as objects. Examples: ObjectDB, db4o.",
                            "Hierarchical DBMS – Tree-structured data. Example: IBM IMS.",
                            "Network DBMS – Graph-like structure allowing many-to-many relationships. Examples: IDS, TurboIMAGE.",
                            "Cloud-Based DBMS – Cloud-hosted databases like Amazon RDS, MongoDB Atlas, and Google BigQuery."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Database Languages"
                    },
                    {
                        "type": "numbered_list",
                        "items": [
                            "DDL (Data Definition Language) – CREATE, ALTER, DROP, TRUNCATE, COMMENT, RENAME.",
                            "DML (Data Manipulation Language) – SELECT, INSERT, UPDATE, DELETE, MERGE, CALL, EXPLAIN PLAN, LOCK TABLE.",
                            "DCL (Data Control Language) – GRANT, REVOKE.",
                            "TCL (Transaction Control Language) – COMMIT, ROLLBACK, SAVEPOINT.",
                            "DQL (Data Query Language) – SELECT (for data retrieval)."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Applications of DBMS"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Banking – Accounts, transactions.",
                            "E-commerce – Orders, customers, products.",
                            "Healthcare – Patient data and medical records.",
                            "Education – Student data, grades, schedules.",
                            "Social Media – Posts, profiles, messages.",
                            "Data Science – Large-scale analytics and predictions."
                        ]
                    }
                ]
            },
            {
                "name": "History of DBMS",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "Database management systems emerged in the 1960s to address the growing complexity of business data. Early pioneers like Charles Bachman developed the Integrated Data Store (IDS), while IBM introduced the Information Management System (IMS). These initial systems utilized hierarchical and network models, organizing information in tree-like structures."
                    },
                    {
                        "type": "paragraph",
                        "text": "The 1970s marked a revolutionary shift when Edgar F. Codd introduced the relational model, fundamentally changing how data was structured and accessed. His vision of organizing data into tables (relations) and using SQL for querying laid the foundation for modern systems like Oracle and MySQL. Today's database landscape continues to evolve, with NoSQL technologies emerging to handle diverse, unstructured data requirements."
                    },
                    {
                        "type": "heading",
                        "text": "Understanding DBMS"
                    },
                    {
                        "type": "paragraph",
                        "text": "A Database Management System serves as specialized software for managing data operations including storage, retrieval, and manipulation. It acts as a critical intermediary between raw data storage and end users, providing tools for creating, modifying, and deleting databases while organizing information into structured tables, records, and fields."
                    },
                    {
                        "type": "paragraph",
                        "text": "Modern DBMS platforms handle diverse operations from basic storage to complex queries, typically leveraging SQL (Structured Query Language) for communication. The primary objective is maintaining large-scale data in an organized, secure, and consistent manner while ensuring data integrity across all operations."
                    },
                    {
                        "type": "paragraph",
                        "text": "Key features include data independence (allowing structural changes without affecting applications), data abstraction (simplifying user interactions by hiding storage complexities), and concurrency control (enabling multiple simultaneous users to access data safely without conflicts)."
                    },
                    {
                        "type": "heading",
                        "text": "Timeline of Data Storage Evolution"
                    },
                    {
                        "type": "heading",
                        "text": "The Early Era: 1950s-1960s"
                    },
                    {
                        "type": "paragraph",
                        "text": "During this period, magnetic tape technology dominated data storage. Organizations automated routine tasks like payroll processing by storing information on tapes. Data operations involved sequential reading from source tapes and writing to destination tapes. Input methods included punched cards, while output was typically directed to printers."
                    },
                    {
                        "type": "heading",
                        "text": "The Disk Revolution: Late 1960s-1970s"
                    },
                    {
                        "type": "paragraph",
                        "text": "Hard disk adoption transformed data processing by enabling random access to information. Unlike tapes, disk storage allowed retrieval from any location within milliseconds, regardless of physical position. This breakthrough enabled the creation of network and hierarchical databases supporting complex structures like lists and trees. Edgar Codd's seminal 1970 paper introduced the relational model and declarative query methods, birthing the relational database era."
                    },
                    {
                        "type": "heading",
                        "text": "Commercial Adoption: 1980s"
                    },
                    {
                        "type": "paragraph",
                        "text": "Initially, relational databases faced skepticism due to performance concerns compared to established network and hierarchical systems. IBM's System R project changed this perception by demonstrating efficient relational database implementation. This research led to SQL/DS, IBM's first commercial relational product. Concurrently, UC Berkeley developed Ingres, which also became a commercial success. Products like IBM DB2, Oracle, Ingres, and DEC Rdb pioneered efficient declarative query processing. By the mid-1980s, relational databases matched their predecessors in performance while offering superior ease of use. They automated low-level tasks that previously required manual procedural coding, freeing developers to focus on logical design rather than performance optimization."
                    },
                    {
                        "type": "heading",
                        "text": "Decision Support Era: Early 1990s"
                    },
                    {
                        "type": "paragraph",
                        "text": "While SQL was originally designed for query-heavy decision support, the 1980s focused on update-intensive transaction processing. The early 1990s saw renewed emphasis on analytical applications and decision support. Data analysis tools experienced significant growth, vendors introduced parallel processing capabilities, and object-relational features began appearing in database products."
                    },
                    {
                        "type": "heading",
                        "text": "Web Integration: Mid-Late 1990s"
                    },
                    {
                        "type": "paragraph",
                        "text": "The World Wide Web's explosive growth drove unprecedented database deployment. Systems needed to handle massive transaction volumes while maintaining continuous availability (24/7 operation with zero downtime). Web-enabled data interfaces became essential, fundamentally changing how databases served information to users worldwide."
                    },
                    {
                        "type": "heading",
                        "text": "Modern Developments: 2000s"
                    },
                    {
                        "type": "paragraph",
                        "text": "The early 2000s introduced XML and XQuery as new database technologies. While XML gained traction for data exchange and complex data types, relational databases remained dominant for enterprise applications. This decade witnessed advances in autonomous administration (auto-admin) to reduce maintenance overhead. Open-source systems like PostgreSQL and MySQL grew substantially. Specialized analytical databases emerged, including column-oriented stores (storing each column separately) and massively parallel systems for big data analysis. Tech giants like Amazon, Facebook, Google, Microsoft, and Yahoo developed novel distributed storage systems, later offering them as cloud services for developers."
                    },
                    {
                        "type": "heading",
                        "text": "Summary"
                    },
                    {
                        "type": "paragraph",
                        "text": "Database management systems have fundamentally transformed how we organize and access information. From early hierarchical models through Codd's revolutionary relational approach, DBMS technology has become indispensable for structured data management. SQL's emergence as the standard query language accelerated widespread adoption across industries. Today, NoSQL and other modern platforms address big data challenges and unstructured information, demonstrating the field's continuous innovation and adaptation to evolving technological needs."
                    }
                ]
            },
            {
                "name": "DBMS Architecture (1, 2, 3 level)",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "DBMS architecture determines how users interact with databases for reading, writing, or modifying information. A thoughtfully designed architecture combined with a well-structured schema (defining tables, fields, and relationships) ensures data consistency, optimizes performance, and maintains security."
                    },
                    {
                        "type": "heading",
                        "text": "Types of DBMS Architecture"
                    },
                    {
                        "type": "paragraph",
                        "text": "Database systems employ different architectural patterns based on application requirements and scale. The three primary architectures are:"
                    },
                    {
                        "type": "numbered_list",
                        "items": [
                            "1-Tier Architecture",
                            "2-Tier Architecture",
                            "3-Tier Architecture"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "1-Tier Architecture"
                    },
                    {
                        "type": "paragraph",
                        "text": "In single-tier architecture, users interact directly with the database on their local system. The client, server, and database components exist within a unified application environment. Users can launch the application, manipulate data, and execute operations without requiring external servers or network connectivity."
                    },
                    {
                        "type": "image",
                        "src": "/images/dbms/1tier-architecture.png",
                        "alt": "1-Tier DBMS Architecture showing integrated user interface, application logic, and database in single system",
                        "caption": "1-Tier Architecture - All components integrated in one system"
                    },
                    {
                        "type": "paragraph",
                        "text": "Microsoft Excel exemplifies this architecture perfectly. The interface, processing logic, and data storage all operate on the same device. Users input data, perform calculations, and save files locally on their computer."
                    },
                    {
                        "type": "paragraph",
                        "text": "This configuration offers simplicity and ease of deployment, making it perfect for personal or standalone applications. It eliminates network dependencies and complex configurations, which explains its popularity for small-scale or individual usage scenarios."
                    },
                    {
                        "type": "heading",
                        "text": "Advantages of 1-Tier Architecture"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Straightforward Setup: Requires only a single machine, making deployment extremely simple.",
                            "Budget-Friendly: No additional hardware investments needed, reducing overall costs.",
                            "Quick Implementation: Can be rapidly deployed, ideal for small-scale projects.",
                            "No Network Dependency: Works offline without internet or network requirements."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Disadvantages of 1-Tier Architecture"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Single-User Limitation: Designed for individual use, not suitable for collaborative work or multiple simultaneous users.",
                            "Security Vulnerabilities: All components on one machine means unauthorized access compromises everything.",
                            "Lack of Central Management: Local storage prevents centralized data management and backup strategies.",
                            "Data Sharing Challenges: Distributing data across multiple users becomes problematic with localized storage."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2-Tier Architecture"
                    },
                    {
                        "type": "paragraph",
                        "text": "Two-tier architecture follows a client-server model where client applications communicate directly with database servers. APIs such as ODBC and JDBC facilitate this interaction. The server handles query processing and transaction management, while clients manage user interfaces and application logic."
                    },
                    {
                        "type": "image",
                        "src": "/images/dbms/2tier-architecture.png",
                        "alt": "2-Tier DBMS Architecture showing client tier with UI and application logic connected to server tier with database",
                        "caption": "2-Tier Architecture - Client-Server Model"
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: Library Management Systems in schools or small organizations demonstrate classic two-tier architecture:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Client Layer (Tier 1): User interface where library staff search for books, process checkouts, or verify due dates through desktop applications.",
                            "Database Layer (Tier 2): Database server maintaining all library records including book catalogs, user profiles, and transaction histories."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "The client layer transmits requests (like book searches) to the database layer, which processes queries and returns results. This separation allows clients to concentrate on user experience while servers manage data operations."
                    },
                    {
                        "type": "heading",
                        "text": "Advantages of 2-Tier Architecture"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Efficient Data Access: Direct database connections enable faster data retrieval.",
                            "Scalability Options: System can expand by adding clients or upgrading server hardware.",
                            "Cost-Effective: More affordable than three-tier or multi-tier architectures.",
                            "Simpler Deployment: Easier to implement compared to more complex architectures.",
                            "Clear Structure: Two-component design is straightforward to understand and maintain."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Disadvantages of 2-Tier Architecture"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Scalability Constraints: Performance degrades as user count increases due to server overload.",
                            "Security Concerns: Direct client-database connections increase vulnerability to attacks and data breaches.",
                            "Tight Integration: Strong coupling between client and server means database changes often require client updates.",
                            "Maintenance Complexity: Managing updates, bug fixes, and feature additions becomes challenging with growing user bases."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "3-Tier Architecture"
                    },
                    {
                        "type": "paragraph",
                        "text": "Three-tier architecture introduces an intermediate layer between clients and databases. Clients don't communicate directly with database servers. Instead, they interact with application servers that handle database communication, query processing, and transaction management. This middle tier processes data partially before exchanging it between servers and clients. This architecture suits large-scale web applications."
                    },
                    {
                        "type": "image",
                        "src": "/images/dbms/3tier-architecture.png",
                        "alt": "3-Tier DBMS Architecture showing presentation tier, application tier, and data tier in vertical flow",
                        "caption": "3-Tier Architecture - Presentation, Application, and Data Layers"
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: E-commerce Platform"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Presentation Tier (User): Customers browse the online store, search products, and add items to shopping carts.",
                            "Application Tier (Processing): System verifies inventory availability, calculates total costs, and applies promotional discounts.",
                            "Data Tier (Database): Product catalogs, shopping cart contents, and order histories are stored for future reference."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Advantages of 3-Tier Architecture"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Superior Scalability: Distributed application servers eliminate the need for individual client-server connections, enhancing system capacity.",
                            "Data Integrity Protection: The intermediate layer helps prevent data corruption and maintains consistency.",
                            "Enhanced Security: Prevents direct client-database interaction, reducing unauthorized data access risks.",
                            "Better Separation of Concerns: Each tier focuses on specific responsibilities, improving code organization and maintainability."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Disadvantages of 3-Tier Architecture"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Increased Complexity: More intricate than two-tier systems with doubled communication points.",
                            "Communication Overhead: Middle layers can complicate interactions between components.",
                            "Latency Issues: Requests passing through additional layers may experience slower response times.",
                            "Higher Costs: Establishing and maintaining three separate tiers demands more hardware, software, and skilled personnel, increasing expenses."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Choosing the Right Architecture"
                    },
                    {
                        "type": "paragraph",
                        "text": "Selecting appropriate DBMS architecture depends on application scale, user count, security requirements, and budget constraints. Single-tier works for personal applications, two-tier suits small to medium organizations, while three-tier is essential for large-scale enterprise and web applications requiring high security and scalability."
                    }
                ]
            },
            {
                "name": "Difference between File System and DBMS",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "File systems and Database Management Systems (DBMS) represent two distinct approaches to data management, each serving different purposes with unique characteristics. File systems provide a method for organizing and storing files in hierarchical structures on storage devices, offering basic operations like reading, writing, and deleting data."
                    },
                    {
                        "type": "paragraph",
                        "text": "In contrast, DBMS represents sophisticated software specifically designed to handle large volumes of structured information. It delivers advanced capabilities including querying, indexing, transaction management, and data integrity enforcement. While file systems excel at straightforward storage needs with minimal organizational requirements, DBMS solutions are optimal for scenarios demanding complex data structures, enhanced security, and sophisticated data relationships."
                    },
                    {
                        "type": "heading",
                        "text": "Understanding File Systems"
                    },
                    {
                        "type": "paragraph",
                        "text": "A file system serves as the organizational framework for storing and retrieving files on storage media such as hard drives or solid-state drives. It structures data into files grouped within directories, which can contain additional subdirectories and files, creating a hierarchical tree structure. File systems handle fundamental operations including file management, naming conventions, and access control."
                    },
                    {
                        "type": "paragraph",
                        "text": "Common Examples: NTFS (New Technology File System) used in Windows, EXT (Extended File System) found in Linux distributions, APFS (Apple File System) for macOS."
                    },
                    {
                        "type": "heading",
                        "text": "Understanding DBMS"
                    },
                    {
                        "type": "paragraph",
                        "text": "Database Management Systems are specialized software platforms designed to efficiently manage collections of interrelated data. They facilitate effective data storage and retrieval while implementing robust security measures to prevent unauthorized access. DBMS platforms enable data queries through SQL (Structured Query Language) and relational algebra, while providing built-in mechanisms for data backup and disaster recovery."
                    },
                    {
                        "type": "paragraph",
                        "text": "Common Examples: Oracle Database, MySQL, Microsoft SQL Server, PostgreSQL, MongoDB."
                    },
                    {
                        "type": "heading",
                        "text": "Key Differences Between File Systems and DBMS"
                    },
                    {
                        "type": "heading",
                        "text": "1. Structure and Purpose"
                    },
                    {
                        "type": "list",
                        "items": [
                            "File System: Organizes files hierarchically within storage devices, focusing on file-level operations.",
                            "DBMS: Comprehensive software managing structured data with relationships, focusing on data-level operations."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2. Data Redundancy"
                    },
                    {
                        "type": "list",
                        "items": [
                            "File System: Duplicate data frequently exists across multiple files, leading to storage waste.",
                            "DBMS: Employs normalization techniques to eliminate redundancy and maintain single sources of truth."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "3. Backup and Recovery"
                    },
                    {
                        "type": "list",
                        "items": [
                            "File System: Lacks built-in backup and recovery mechanisms; relies on external tools or manual processes.",
                            "DBMS: Provides integrated backup, recovery, and restoration tools to protect against data loss."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "4. Query Processing"
                    },
                    {
                        "type": "list",
                        "items": [
                            "File System: Offers no sophisticated query capabilities; requires custom code for data searches.",
                            "DBMS: Features powerful query optimization engines for efficient data retrieval using SQL or similar languages."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "5. Data Consistency"
                    },
                    {
                        "type": "list",
                        "items": [
                            "File System: Lower consistency levels due to lack of coordination between files.",
                            "DBMS: Maintains high consistency through normalization, constraints, and ACID properties (Atomicity, Consistency, Isolation, Durability)."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "6. Complexity"
                    },
                    {
                        "type": "list",
                        "items": [
                            "File System: Simpler architecture with straightforward implementation.",
                            "DBMS: More complex systems requiring specialized knowledge for administration and optimization."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "7. Security"
                    },
                    {
                        "type": "list",
                        "items": [
                            "File System: Basic permission-based security at file and directory levels.",
                            "DBMS: Advanced security features including user authentication, role-based access control, encryption, and audit trails."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "8. Cost"
                    },
                    {
                        "type": "list",
                        "items": [
                            "File System: Minimal or no additional costs beyond operating system.",
                            "DBMS: Higher costs including licensing, hardware requirements, and specialized personnel."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "9. Data Independence"
                    },
                    {
                        "type": "list",
                        "items": [
                            "File System: No data independence; changes to file structure require application modifications.",
                            "DBMS: Supports both logical and physical data independence, allowing structural changes without affecting applications."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "10. Concurrent Access"
                    },
                    {
                        "type": "list",
                        "items": [
                            "File System: Typically limited to single-user access; concurrent access causes conflicts.",
                            "DBMS: Designed for multi-user environments with sophisticated concurrency control mechanisms."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "11. Data Sharing"
                    },
                    {
                        "type": "list",
                        "items": [
                            "File System: Data scattered across multiple files makes sharing difficult and inefficient.",
                            "DBMS: Centralized data repository facilitates easy sharing across applications and users."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "12. Data Abstraction"
                    },
                    {
                        "type": "list",
                        "items": [
                            "File System: Exposes storage details and physical data representation to users.",
                            "DBMS: Hides internal implementation details, providing logical views of data."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "13. Integrity Constraints"
                    },
                    {
                        "type": "list",
                        "items": [
                            "File System: Difficult to enforce data validation rules and constraints.",
                            "DBMS: Easy implementation of constraints like primary keys, foreign keys, unique constraints, and check constraints."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "14. Programming Requirements"
                    },
                    {
                        "type": "list",
                        "items": [
                            "File System: Users must write custom procedures for data management operations.",
                            "DBMS: Provides declarative query languages, reducing programming complexity."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Comparison Summary"
                    },
                    {
                        "type": "paragraph",
                        "text": "File systems excel at managing individual files and directories with basic storage operations. They're ideal for simple data storage needs, personal computing, and scenarios where data relationships aren't critical. Their simplicity and low cost make them suitable for straightforward applications."
                    },
                    {
                        "type": "paragraph",
                        "text": "DBMS platforms are engineered for comprehensive data management involving complex relationships, multiple users, and stringent security requirements. They provide advanced features ensuring data integrity, consistency, and efficient access. DBMS solutions are essential for enterprise applications, web services, and any scenario requiring sophisticated data handling, concurrent access, and robust data protection."
                    },
                    {
                        "type": "heading",
                        "text": "Conclusion"
                    },
                    {
                        "type": "paragraph",
                        "text": "The choice between file systems and DBMS depends on specific application requirements. File systems offer simplicity and efficiency for basic file operations, making them suitable for managing unstructured data with minimal organizational needs. They handle fundamental tasks like creating, storing, retrieving, and deleting files effectively."
                    },
                    {
                        "type": "paragraph",
                        "text": "Conversely, DBMS platforms provide comprehensive solutions for managing large-scale structured data with complex relationships. They ensure data integrity, support concurrent access, enable efficient querying, and maintain security. For applications requiring sophisticated data management, scalability, and reliability, DBMS represents the superior choice despite higher complexity and cost."
                    }
                ]
            },
            {
                "name": "ER Model",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "The Entity-Relationship Model (ER Model) serves as a conceptual framework for database design. This model illustrates the logical architecture of databases, encompassing entities, their properties, and the connections between them."
                    },
                    {
                        "type": "list",
                        "items": [
                            "Entity: Objects or concepts stored as data, such as Student, Course, or Company.",
                            "Attribute: Characteristics describing an entity, like StudentID, CourseName, or EmployeeEmail.",
                            "Relationship: Associations between entities, for example 'a Student enrolls in a Course'."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "ER Model in Database Design"
                    },
                    {
                        "type": "paragraph",
                        "text": "Database design typically follows a systematic approach:"
                    },
                    {
                        "type": "numbered_list",
                        "items": [
                            "Requirements Gathering: Collect functional and data requirements through stakeholder interviews and user consultations.",
                            "Conceptual Design: Create logical database structure using ER modeling - the most widely adopted graphical representation for conceptual database design.",
                            "Physical Design: Focus on implementation details like indexing strategies and performance optimization.",
                            "External Design: Define user views and access patterns for different user groups."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Benefits of ER Diagrams"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Easy Conversion: ER diagrams translate seamlessly into relational database tables.",
                            "Real-World Modeling: They effectively represent real-world objects and their interactions.",
                            "No Technical Prerequisites: Understanding ER diagrams requires no specialized DBMS knowledge.",
                            "Visual Clarity: Complex data structures and relationships become comprehensible through visual representation."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "ER Diagram Symbols"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Rectangle: Represents entity types",
                            "Oval: Represents attributes",
                            "Diamond: Represents relationships",
                            "Lines: Connect entities to relationships and attributes",
                            "Double Rectangle: Represents weak entities",
                            "Double Diamond: Represents identifying relationships",
                            "Underlined Attribute: Indicates primary key"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Understanding Entities"
                    },
                    {
                        "type": "paragraph",
                        "text": "An Entity represents tangible or intangible real-world objects, concepts, or things for which data is maintained in databases. Entities form the fundamental building blocks of database structures, with relational database tables representing these entities."
                    },
                    {
                        "type": "paragraph",
                        "text": "Examples of Entities:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Physical Objects: Person, Vehicle, Employee, Building",
                            "Abstract Concepts: Course, Event, Reservation, Transaction",
                            "Items: Product, Document, Device, Inventory"
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "The entity type establishes the blueprint for entities, while specific instances represent individual entities conforming to that type."
                    },
                    {
                        "type": "heading",
                        "text": "Entity Sets"
                    },
                    {
                        "type": "paragraph",
                        "text": "An entity denotes a single instance of an entity type, whereas an entity set comprises all entities belonging to a specific type. For instance, if E1 represents an individual student entity, the complete collection of all students constitutes the entity set."
                    },
                    {
                        "type": "paragraph",
                        "text": "Important Note: ER diagrams display entity sets (the structure) rather than individual entities (specific data rows), as diagrams represent data models, not actual data instances."
                    },
                    {
                        "type": "heading",
                        "text": "Types of Entities"
                    },
                    {
                        "type": "heading",
                        "text": "1. Strong Entity"
                    },
                    {
                        "type": "paragraph",
                        "text": "A Strong Entity possesses key attributes that uniquely identify each instance independently. It doesn't rely on other entities for identification and maintains a primary key ensuring uniqueness. In ER diagrams, strong entities appear as single rectangles."
                    },
                    {
                        "type": "heading",
                        "text": "2. Weak Entity"
                    },
                    {
                        "type": "paragraph",
                        "text": "A Weak Entity cannot be uniquely identified solely by its own attributes. It depends on a strong entity (called the identifying or owner entity) for complete identification. Weak entities are depicted using double rectangles, and their participation is always total. The relationship connecting a weak entity to its identifying strong entity is called an identifying relationship, shown with a double diamond."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: A company stores information about employee dependents (spouse, children, parents). Dependents cannot exist independently without employees. Therefore, Dependent is a weak entity type, while Employee is the identifying strong entity type."
                    },
                    {
                        "type": "heading",
                        "text": "Attributes in ER Model"
                    },
                    {
                        "type": "paragraph",
                        "text": "Attributes define the properties characterizing entity types. For a Student entity, attributes might include Roll_No, Name, DOB, Age, Address, and Mobile_No. ER diagrams represent attributes as ovals connected to their respective entities."
                    },
                    {
                        "type": "heading",
                        "text": "Types of Attributes"
                    },
                    {
                        "type": "heading",
                        "text": "1. Key Attribute"
                    },
                    {
                        "type": "paragraph",
                        "text": "Key attributes uniquely identify each entity within an entity set. For example, Roll_No serves as a unique identifier for each student. ER diagrams show key attributes as underlined ovals."
                    },
                    {
                        "type": "heading",
                        "text": "2. Composite Attribute"
                    },
                    {
                        "type": "paragraph",
                        "text": "Composite attributes consist of multiple sub-attributes. For instance, an Address attribute might comprise Street, City, State, and Country components. These are represented as ovals containing nested ovals."
                    },
                    {
                        "type": "heading",
                        "text": "3. Multivalued Attribute"
                    },
                    {
                        "type": "paragraph",
                        "text": "Multivalued attributes can hold multiple values for a single entity. Phone_No exemplifies this, as students may have multiple contact numbers. Double ovals represent multivalued attributes in ER diagrams."
                    },
                    {
                        "type": "heading",
                        "text": "4. Derived Attribute"
                    },
                    {
                        "type": "paragraph",
                        "text": "Derived attributes can be calculated from other attributes. Age, for instance, can be derived from Date of Birth (DOB). Dashed ovals indicate derived attributes in ER diagrams."
                    },
                    {
                        "type": "heading",
                        "text": "Relationship Types and Sets"
                    },
                    {
                        "type": "paragraph",
                        "text": "A Relationship Type defines associations between entity types. For example, 'Enrolled in' represents a relationship type between Student and Course entities. ER diagrams use diamonds to represent relationship types, connected to participating entities via lines."
                    },
                    {
                        "type": "paragraph",
                        "text": "A Relationship Set contains all relationships of the same type. For instance, if S1 enrolls in C2, S2 enrolls in C1, and S3 enrolls in C3, these form a relationship set."
                    },
                    {
                        "type": "heading",
                        "text": "Degree of Relationships"
                    },
                    {
                        "type": "paragraph",
                        "text": "The degree indicates how many entity sets participate in a relationship:"
                    },
                    {
                        "type": "heading",
                        "text": "1. Unary (Recursive) Relationship"
                    },
                    {
                        "type": "paragraph",
                        "text": "A single entity set participates in the relationship. Example: Person married to Person (same entity type relates to itself)."
                    },
                    {
                        "type": "heading",
                        "text": "2. Binary Relationship"
                    },
                    {
                        "type": "paragraph",
                        "text": "Two entity sets participate in the relationship. Example: Student enrolls in Course."
                    },
                    {
                        "type": "heading",
                        "text": "3. Ternary Relationship"
                    },
                    {
                        "type": "paragraph",
                        "text": "Three entity sets participate in the relationship. Example: Doctor treats Patient at Hospital."
                    },
                    {
                        "type": "heading",
                        "text": "4. N-ary Relationship"
                    },
                    {
                        "type": "paragraph",
                        "text": "N entity sets participate in the relationship, where N can be any number greater than three."
                    },
                    {
                        "type": "heading",
                        "text": "Cardinality in ER Model"
                    },
                    {
                        "type": "paragraph",
                        "text": "Cardinality specifies the maximum number of relationship instances in which an entity can participate."
                    },
                    {
                        "type": "heading",
                        "text": "1. One-to-One (1:1)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Each entity in both entity sets participates at most once in the relationship. Example: One person holds one passport, and each passport belongs to one person."
                    },
                    {
                        "type": "heading",
                        "text": "2. One-to-Many (1:M)"
                    },
                    {
                        "type": "paragraph",
                        "text": "One entity can associate with multiple entities from another set. Example: One department employs many doctors, but each doctor works in one department."
                    },
                    {
                        "type": "heading",
                        "text": "3. Many-to-One (M:1)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Multiple entities from one set can associate with a single entity from another set. Example: Many surgeries performed by one surgeon, but each surgery has one surgeon."
                    },
                    {
                        "type": "heading",
                        "text": "4. Many-to-Many (M:N)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Entities from both sets can participate multiple times. Example: Employees work on multiple projects, and projects involve multiple employees."
                    },
                    {
                        "type": "heading",
                        "text": "Participation Constraints"
                    },
                    {
                        "type": "paragraph",
                        "text": "Participation constraints define whether entity participation in relationships is mandatory or optional:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Total Participation: Every entity must participate in the relationship. Represented by double lines in ER diagrams. Example: If every student must enroll in at least one course.",
                            "Partial Participation: Entity participation is optional. Represented by single lines. Example: Some courses may have no enrolled students."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "How to Draw ER Diagrams"
                    },
                    {
                        "type": "numbered_list",
                        "items": [
                            "Identify Entities: Determine all entities in your system. Represent them using rectangles with appropriate labels.",
                            "Identify Relationships: Establish connections between entities. Use diamonds to represent relationships. Ensure relationships don't connect directly to each other.",
                            "Add Attributes: Attach properties to entities using ovals. Connect multiple attributes (name, age, etc.) to their respective entities.",
                            "Define Primary Keys: Assign unique identifiers to each entity. Represent primary keys with underlined attributes.",
                            "Specify Cardinality: Indicate relationship cardinality (1:1, 1:M, M:1, M:N) using appropriate notation.",
                            "Define Participation: Mark total participation with double lines and partial participation with single lines.",
                            "Remove Redundancies: Review and eliminate unnecessary or duplicate entities and relationships.",
                            "Review for Clarity: Ensure the diagram clearly communicates entity relationships and is easy to understand."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Summary"
                    },
                    {
                        "type": "paragraph",
                        "text": "The ER Model provides a powerful visual tool for database design, enabling clear representation of data structures and relationships. By understanding entities, attributes, relationships, cardinality, and participation constraints, database designers can create effective conceptual models that translate smoothly into physical database implementations. ER diagrams serve as essential communication tools between stakeholders, developers, and database administrators throughout the development lifecycle."
                    }
                ]
            },
            {
                "name": "Structural Constraints of Relationships",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "Structural constraints in Entity-Relationship modeling define and regulate how entities participate in relationships, providing a framework for designing entity interactions within databases. These constraints establish rules governing the connections between entities, ensuring the database schema accurately reflects real-world scenarios."
                    },
                    {
                        "type": "paragraph",
                        "text": "The two fundamental types of structural constraints are:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Cardinality: Defines the numerical limits of relationship instances (one-to-one, one-to-many, many-to-many)",
                            "Participation: Determines whether all or only some entity instances must engage in relationships (total or partial)"
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Understanding and properly implementing these constraints is crucial for designing robust, efficient, and accurate database systems that correctly model real-world business rules and requirements."
                    },
                    {
                        "type": "heading",
                        "text": "Cardinality Ratios in Relationships"
                    },
                    {
                        "type": "paragraph",
                        "text": "In ER diagrams, entities are depicted as rectangles and relationships as diamonds. The lines connecting these elements display numbers (typically represented as M and N) above them, known as cardinality ratios. These ratios specify the maximum number of entity instances that can associate with each other through a particular relationship."
                    },
                    {
                        "type": "heading",
                        "text": "Types of Cardinality"
                    },
                    {
                        "type": "paragraph",
                        "text": "Four distinct cardinality types exist in ER modeling:"
                    },
                    {
                        "type": "heading",
                        "text": "1. One-to-One (1:1) Cardinality"
                    },
                    {
                        "type": "paragraph",
                        "text": "In one-to-one relationships, each entity instance from both participating entity sets can associate at most once with an entity from the other set. This represents exclusive pairings between entities."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: A person possesses exactly one passport, and each passport belongs to exactly one person. Neither can participate in multiple instances of this relationship."
                    },
                    {
                        "type": "heading",
                        "text": "2. One-to-Many (1:N) Cardinality"
                    },
                    {
                        "type": "paragraph",
                        "text": "One-to-many relationships occur when entities from the first set participate at most once, while entities from the second set can participate multiple times (minimum twice). This creates a hierarchical relationship pattern."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: A department employs multiple employees, but each employee works for only one department. The department can have many associations, while each employee has one."
                    },
                    {
                        "type": "heading",
                        "text": "3. Many-to-One (N:1) Cardinality"
                    },
                    {
                        "type": "paragraph",
                        "text": "Many-to-one relationships exist when entities from the first set can participate multiple times (minimum twice), while entities from the second set participate at most once. This is essentially the inverse of one-to-many."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: Multiple students enroll in one course section, but each enrollment record links to only one course section. Many students associate with one section."
                    },
                    {
                        "type": "heading",
                        "text": "4. Many-to-Many (N:N) Cardinality"
                    },
                    {
                        "type": "paragraph",
                        "text": "Many-to-many relationships allow entities from both sets to participate multiple times (minimum twice each). This creates complex, interconnected relationship patterns."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: Students enroll in multiple courses, and courses have multiple enrolled students. Both entities can participate in numerous relationship instances."
                    },
                    {
                        "type": "heading",
                        "text": "Participation Constraints"
                    },
                    {
                        "type": "paragraph",
                        "text": "Participation constraints specify whether entity involvement in relationships is mandatory or optional. Two types exist:"
                    },
                    {
                        "type": "heading",
                        "text": "Total Participation"
                    },
                    {
                        "type": "paragraph",
                        "text": "Total participation occurs when every entity instance within an entity set must participate in at least one relationship instance. No entity can exist without being involved in the specified relationship. In ER diagrams, total participation is represented by double lines connecting the entity to the relationship."
                    },
                    {
                        "type": "paragraph",
                        "text": "Real-World Examples:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "University System: Every student must enroll in at least one course. Students cannot exist in the system without course enrollment.",
                            "Academic Department: Every professor must teach at least one course. The relationship between Professor and Course shows total participation.",
                            "Employment System: Every employee must be assigned to at least one department. No employee exists without departmental assignment."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Total participation enforces business rules requiring mandatory relationships, ensuring data integrity and completeness."
                    },
                    {
                        "type": "heading",
                        "text": "Partial Participation"
                    },
                    {
                        "type": "paragraph",
                        "text": "Partial participation permits some entity instances to exist without participating in any relationship instance. Not all entities must be involved in the relationship. In ER diagrams, partial participation is indicated by single lines connecting the entity to the relationship."
                    },
                    {
                        "type": "paragraph",
                        "text": "Real-World Examples:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "University System: Some professors may not currently teach any courses (sabbatical, research-only positions). Their participation in the 'Teaches' relationship is partial.",
                            "Library System: Books may or may not be borrowed by members. A book can exist in the library without being checked out, showing partial participation in the 'Borrowed' relationship.",
                            "Hospital System: Some doctors may not have any current patient assignments. Their participation in the 'Treats' relationship is partial."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Partial participation accommodates flexible scenarios where entity existence doesn't mandate relationship involvement, reflecting real-world situations more accurately."
                    },
                    {
                        "type": "heading",
                        "text": "Structural Constraints: Combining Cardinality and Participation"
                    },
                    {
                        "type": "paragraph",
                        "text": "Structural constraints, also known as structural properties of database management systems, combine cardinality ratios and participation constraints into a unified framework. These constraints ensure the DBMS maintains consistency with business requirements and real-world rules."
                    },
                    {
                        "type": "heading",
                        "text": "Min-Max Notation"
                    },
                    {
                        "type": "paragraph",
                        "text": "Structural constraints are expressed using Min-Max notation, represented as a pair of numbers (m, n) appearing on the lines connecting entities to relationships:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "m (minimum): Represents the minimum number of times an entity instance must participate in the relationship",
                            "n (maximum): Represents the maximum number of times an entity instance can participate in the relationship"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Interpreting Min-Max Values"
                    },
                    {
                        "type": "list",
                        "items": [
                            "When m = 0: Indicates partial participation (entity may or may not participate in the relationship)",
                            "When m ≥ 1: Indicates total participation (entity must participate at least once in the relationship)",
                            "When n = 1: Entity can participate at most once (one side of one-to-one or many-to-one)",
                            "When n > 1 or n = *: Entity can participate multiple times (one-to-many or many-to-many)"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Min-Max Notation Examples"
                    },
                    {
                        "type": "paragraph",
                        "text": "Consider these practical examples:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "(1,1): Total participation, exactly one relationship instance - mandatory one-to-one",
                            "(0,1): Partial participation, at most one relationship instance - optional one-to-one",
                            "(1,N): Total participation, one or more relationship instances - mandatory one-to-many",
                            "(0,N): Partial participation, zero or more relationship instances - optional one-to-many",
                            "(1,*): Total participation, unlimited relationship instances - mandatory many-to-many",
                            "(0,*): Partial participation, unlimited relationship instances - optional many-to-many"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Practical Application"
                    },
                    {
                        "type": "paragraph",
                        "text": "Understanding the relationship between entity participation and tuple appearances is essential: the number of times an entity participates in a relationship equals the number of times it appears in the relationship's tuples (rows)."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example Scenario - Library System:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Book Entity: A book may or may not be borrowed by a member, showing partial participation (0,N) in the 'Borrowed By' relationship.",
                            "Member Entity: A member may borrow zero or multiple books, also showing partial participation (0,N).",
                            "This creates a many-to-many relationship with partial participation on both sides."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Importance of Structural Constraints"
                    },
                    {
                        "type": "paragraph",
                        "text": "Structural constraints serve critical functions in database design:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Data Integrity: Enforce business rules at the database level, preventing invalid data states",
                            "Accuracy: Ensure the database model accurately reflects real-world scenarios and requirements",
                            "Consistency: Maintain consistent data relationships across the entire database",
                            "Documentation: Provide clear documentation of business rules and entity relationships",
                            "Validation: Enable automatic validation of data operations against defined constraints"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Summary"
                    },
                    {
                        "type": "paragraph",
                        "text": "Structural constraints form the foundation of accurate database design by combining cardinality ratios and participation constraints. Through Min-Max notation, database designers can precisely specify how entities interact, ensuring the database structure faithfully represents business requirements and real-world relationships. Mastering these concepts is essential for creating robust, efficient, and maintainable database systems."
                    }
                ]
            },
            {
                "name": "Generalization, Specialization, Aggregation",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "When designing databases for large-scale data using the ER model, complexity can become overwhelming. To address this challenge, three abstraction mechanisms were introduced: Generalization, Specialization, and Aggregation. These techniques help manage complexity by hiding implementation details and organizing entities hierarchically."
                    },
                    {
                        "type": "paragraph",
                        "text": "These abstraction mechanisms serve as powerful tools for simplifying database design while maintaining accuracy and completeness in representing real-world scenarios."
                    },
                    {
                        "type": "heading",
                        "text": "Generalization"
                    },
                    {
                        "type": "paragraph",
                        "text": "Generalization involves identifying and extracting shared properties from multiple entities to create a higher-level generalized entity. This bottom-up approach combines two or more entities that share common attributes into a single superclass entity."
                    },
                    {
                        "type": "paragraph",
                        "text": "Key Characteristics:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Bottom-Up Approach: Starts with specific entities and moves toward general entities",
                            "Common Attributes: Identifies shared properties across multiple entities",
                            "Hierarchy Creation: Establishes parent-child relationships between entities",
                            "Reduces Redundancy: Eliminates duplicate attribute definitions"
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: Consider STUDENT and FACULTY entities. Both share common attributes like name and address. Through generalization, we can create a higher-level PERSON entity. Common attributes (P_NAME, P_ADD) become part of PERSON, while specialized attributes (S_FEE for students, F_SALARY for faculty) remain in their respective specialized entities."
                    },
                    {
                        "type": "heading",
                        "text": "Specialization"
                    },
                    {
                        "type": "paragraph",
                        "text": "Specialization represents the opposite of generalization. It divides a higher-level entity into multiple lower-level sub-entities based on distinguishing characteristics. This top-down approach creates specialized entities from a general entity."
                    },
                    {
                        "type": "paragraph",
                        "text": "Key Characteristics:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Top-Down Approach: Starts with general entities and moves toward specific entities",
                            "Distinctive Features: Separates entities based on unique characteristics",
                            "Subclass Creation: Generates specialized subclasses from superclasses",
                            "Attribute Distribution: Common attributes stay in superclass, unique attributes in subclasses"
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: In an Employee Management System, an EMPLOYEE entity can be specialized into DEVELOPER, TESTER, MANAGER, etc. Common attributes (E_NAME, E_SAL, E_ID) remain in the EMPLOYEE superclass, while specialized attributes (TES_TYPE for testers, DEV_LANGUAGE for developers) belong to their respective subclasses."
                    },
                    {
                        "type": "heading",
                        "text": "Inheritance in ER Model"
                    },
                    {
                        "type": "paragraph",
                        "text": "Inheritance forms a critical feature of both generalization and specialization, enabling entities to share and reuse properties across hierarchical levels. During specialization, lower-level entities inherit attributes from higher-level entities. During generalization, combined entities inherit common attributes into the superclass."
                    },
                    {
                        "type": "heading",
                        "text": "Types of Inheritance"
                    },
                    {
                        "type": "heading",
                        "text": "1. Attribute Inheritance"
                    },
                    {
                        "type": "paragraph",
                        "text": "Attribute inheritance allows lower-level entities to automatically acquire attributes from higher-level entities, and vice versa. This eliminates redundant attribute definitions and ensures consistency."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: If Vehicle is a superclass and Car is a subclass, Car automatically inherits attributes like Model, Year, and Color from Vehicle. The Car entity doesn't need to redefine these attributes."
                    },
                    {
                        "type": "heading",
                        "text": "2. Relationship Inheritance"
                    },
                    {
                        "type": "paragraph",
                        "text": "Sub-entities inherit relationships established by their parent entities. If a superclass participates in a relationship, all its subclasses automatically participate in that same relationship."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: If PERSON has a relationship 'Lives At' with ADDRESS, then both STUDENT and FACULTY (as subclasses of PERSON) inherit this relationship and can have addresses."
                    },
                    {
                        "type": "heading",
                        "text": "3. Overriding Inheritance"
                    },
                    {
                        "type": "paragraph",
                        "text": "Sub-entities can override inherited attributes or introduce new attributes and behaviors that differ from the parent entity. This provides flexibility while maintaining the inheritance hierarchy."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: While EMPLOYEE might have a standard calculateSalary method, CONTRACTOR (as a subclass) could override this with a different calculation based on hourly rates."
                    },
                    {
                        "type": "heading",
                        "text": "4. Participation Inheritance"
                    },
                    {
                        "type": "paragraph",
                        "text": "Participation inheritance refers to inheriting participation constraints (total or partial) from superclass to subclass. Subclasses must adhere to the same participation rules established by their parent entity in relationships."
                    },
                    {
                        "type": "paragraph",
                        "text": "Important Note: Participation inheritance applies to participation constraints only, not to the actual relationships themselves. A subclass doesn't automatically acquire new relationships just because its superclass has them; it inherits the rules governing participation in those relationships."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: If Vehicle has a relationship with Manufacturer, and Car is a subclass of Vehicle, Car doesn't automatically create a new relationship with Manufacturer. Instead, it inherits the participation constraint (whether participation is mandatory or optional) that Vehicle has in that relationship."
                    },
                    {
                        "type": "heading",
                        "text": "Aggregation"
                    },
                    {
                        "type": "paragraph",
                        "text": "Standard ER diagrams cannot directly represent relationships between an entity and another relationship. In scenarios requiring such representations, aggregation provides a solution by treating a relationship along with its participating entities as a higher-level entity set."
                    },
                    {
                        "type": "paragraph",
                        "text": "Aggregation serves as an abstraction mechanism that elevates relationships to entity status, enabling them to participate in other relationships."
                    },
                    {
                        "type": "heading",
                        "text": "When to Use Aggregation"
                    },
                    {
                        "type": "list",
                        "items": [
                            "When a relationship needs to participate in another relationship",
                            "When you need to associate additional information with a relationship",
                            "When modeling complex scenarios involving relationships between relationships",
                            "When standard ER modeling proves insufficient for representing certain associations"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Aggregation Example"
                    },
                    {
                        "type": "paragraph",
                        "text": "Consider an Employee Management System where employees work on projects and may require machinery for their work. We need to model:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "EMPLOYEE entity",
                            "PROJECT entity",
                            "MACHINERY entity",
                            "WORKS_FOR relationship between EMPLOYEE and PROJECT",
                            "REQUIRES relationship between (EMPLOYEE working on PROJECT) and MACHINERY"
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Solution: The WORKS_FOR relationship together with its participating entities (EMPLOYEE and PROJECT) is aggregated into a single higher-level entity. Then, a REQUIRES relationship is created between this aggregated entity and MACHINERY. This allows us to specify which machinery is required for specific employee-project combinations."
                    },
                    {
                        "type": "heading",
                        "text": "Representing Aggregation in Relational Schema"
                    },
                    {
                        "type": "paragraph",
                        "text": "Converting aggregation from ER diagrams to relational schemas requires a systematic approach:"
                    },
                    {
                        "type": "heading",
                        "text": "Step 1: Create Schema for the Aggregated Relationship"
                    },
                    {
                        "type": "paragraph",
                        "text": "Treat the base relationship as if it were an entity set. This schema includes:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Primary keys of all participating entities in the base relationship",
                            "Any descriptive attributes belonging to the base relationship itself",
                            "These combined primary keys typically form a composite primary key for the aggregated relationship"
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: For WORKS_FOR relationship between EMPLOYEE and PROJECT:"
                    },
                    {
                        "type": "paragraph",
                        "text": "WORKS_FOR(Employee_ID, Project_ID, Start_Date, Role)"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Employee_ID: Primary key from EMPLOYEE",
                            "Project_ID: Primary key from PROJECT",
                            "Start_Date, Role: Descriptive attributes of the relationship",
                            "Composite Primary Key: (Employee_ID, Project_ID)"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Step 2: Create Schema for the Higher-Level Relationship"
                    },
                    {
                        "type": "paragraph",
                        "text": "Create a schema for the relationship involving the aggregated entity. This schema includes:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "The primary key (composite key) from the aggregated relationship schema",
                            "The primary key of the associated entity it relates to",
                            "Any additional descriptive attributes specific to this higher-level relationship"
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: For REQUIRES relationship between WORKS_FOR and MACHINERY:"
                    },
                    {
                        "type": "paragraph",
                        "text": "REQUIRES(Employee_ID, Project_ID, Machine_ID, Hours_Used, Date_Required)"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Employee_ID, Project_ID: Composite key from WORKS_FOR aggregation",
                            "Machine_ID: Primary key from MACHINERY entity",
                            "Hours_Used, Date_Required: Descriptive attributes of REQUIRES relationship",
                            "Composite Primary Key: (Employee_ID, Project_ID, Machine_ID)"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Benefits of Generalization, Specialization, and Aggregation"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Reduced Complexity: Simplifies large database designs through hierarchical organization",
                            "Improved Maintainability: Changes to common attributes need updating in only one place",
                            "Enhanced Reusability: Inherited attributes and relationships promote code reuse",
                            "Better Organization: Logical grouping of related entities improves understanding",
                            "Flexibility: Supports complex real-world scenarios that simple ER models cannot represent",
                            "Reduced Redundancy: Eliminates duplicate attribute and relationship definitions"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Summary"
                    },
                    {
                        "type": "paragraph",
                        "text": "Generalization, Specialization, and Aggregation represent essential abstraction mechanisms in ER modeling. Generalization combines similar entities bottom-up, Specialization divides entities top-down, and Aggregation treats relationships as entities. Together with inheritance mechanisms, these techniques enable database designers to create sophisticated, maintainable, and accurate database schemas that effectively model complex real-world scenarios while managing complexity."
                    }
                ]
            },
            {
                "name": "Relational Model & Codd Rules",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "The Relational Model is a fundamental concept in Database Management Systems (DBMS) that organizes data into tables, also known as relations. This model simplifies data storage, retrieval, and management by using rows and columns. Codd's Rules, introduced by Dr. Edgar F. Codd, define the principles a database must follow to qualify as a true relational database."
                    },
                    {
                        "type": "paragraph",
                        "text": "These rules ensure data consistency, integrity, and ease of access, making them essential for efficient database design and management. The relational model's key features include simplicity, linking capabilities, normalization, and powerful data processing through relational algebra and calculus."
                    },
                    {
                        "type": "heading",
                        "text": "Key Features of Relational Model"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Simplicity: Provides simplicity in implementation and simplifies operations on data",
                            "Linking: Uses primary and foreign keys to interlink tables and establish relationships",
                            "Normalization: Utilizes normalization theory for designing non-redundant and efficient data models",
                            "Data Processing: Employs Relational Algebra and Relational Calculus for data manipulation",
                            "SQL Support: Primarily uses SQL (Structured Query Language) for managing and querying data"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "What is Relational Model?"
                    },
                    {
                        "type": "paragraph",
                        "text": "The Relational Model is a key concept in Database Management Systems that organizes data in a structured and efficient way. It represents data and their relationships using tables. Each table has multiple columns, each with a unique name. These tables are also called relations. The relational model is widely used because it simplifies database management and ensures data accuracy."
                    },
                    {
                        "type": "paragraph",
                        "text": "Some of the most well-known Relational databases include MySQL, PostgreSQL, MariaDB, Microsoft SQL Server, and Oracle Database. These systems implement the relational model principles and provide robust platforms for data management."
                    },
                    {
                        "type": "heading",
                        "text": "Important Terminologies"
                    },
                    {
                        "type": "paragraph",
                        "text": "Understanding the following terminologies is essential for working with the relational model:"
                    },
                    {
                        "type": "heading",
                        "text": "Relations (Tables)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Relations are the basic structure in which data is stored. Each relation is made up of rows and columns. For example, a STUDENT table stores data about students using rows and columns."
                    },
                    {
                        "type": "heading",
                        "text": "Relational Schema"
                    },
                    {
                        "type": "paragraph",
                        "text": "Schema represents the structure of a relation. For example, the Relational Schema of STUDENT relation can be represented as: STUDENT(StudentID, Name, Age, Course)."
                    },
                    {
                        "type": "heading",
                        "text": "Relational Instance"
                    },
                    {
                        "type": "paragraph",
                        "text": "The set of values present in a relationship at a particular instance of time is known as a relational instance. It represents the actual data stored in the table at any given moment."
                    },
                    {
                        "type": "heading",
                        "text": "Attribute"
                    },
                    {
                        "type": "paragraph",
                        "text": "Each relation is defined in terms of properties, each of which is known as an attribute. Each column in a table represents an attribute of the data. For example, StudentID, Name, Age, and Course are attributes in a STUDENT table."
                    },
                    {
                        "type": "heading",
                        "text": "Domain of an Attribute"
                    },
                    {
                        "type": "paragraph",
                        "text": "The possible values an attribute can take in a relation is called its domain. For example, the domain of the Age column includes valid ages like 21, 22, 23, etc. The domain of the Course column includes valid courses like 'Computer Science,' 'Mathematics,' and 'Physics.'"
                    },
                    {
                        "type": "heading",
                        "text": "Tuple"
                    },
                    {
                        "type": "paragraph",
                        "text": "Each row of a relation is known as a tuple. A tuple represents a single record in the table. For example, if a STUDENT relation has 4 rows, it contains 4 tuples."
                    },
                    {
                        "type": "heading",
                        "text": "Cardinality"
                    },
                    {
                        "type": "paragraph",
                        "text": "Cardinality refers to the number of tuples (rows) in a relation. It represents the total number of records in a table. For example, if a table has 100 rows, its cardinality is 100."
                    },
                    {
                        "type": "heading",
                        "text": "Degree (Arity)"
                    },
                    {
                        "type": "paragraph",
                        "text": "The degree of a relation refers to the total number of attributes a relation has. It is also known as Arity. For example, if a table has 4 columns (StudentID, Name, Age, Course), its degree is 4."
                    },
                    {
                        "type": "heading",
                        "text": "Primary Key"
                    },
                    {
                        "type": "paragraph",
                        "text": "The primary key is an attribute or a set of attributes that help to uniquely identify the tuples (records) in the relational table. Each table must have a primary key to ensure data integrity."
                    },
                    {
                        "type": "heading",
                        "text": "NULL Values"
                    },
                    {
                        "type": "paragraph",
                        "text": "Values of some attributes for some tuples may be unknown, missing, or undefined, which are represented by NULL. Two NULL values in a relationship are considered different from each other."
                    },
                    {
                        "type": "heading",
                        "text": "RDBMS Vendors"
                    },
                    {
                        "type": "paragraph",
                        "text": "Several vendors offer Relational Database Management Systems (RDBMS). Here are some of the most popular ones:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Oracle: Oracle Database is one of the most widely used RDBMS products, known for robustness, scalability, and reliability. Used by large enterprises for data warehousing and transaction processing.",
                            "Microsoft: Microsoft SQL Server is popular in Windows environments, offering data mining, business intelligence, and reporting services.",
                            "IBM: IBM DB2 is used in enterprise environments, offering high availability, disaster recovery, and scalability features.",
                            "MySQL: An open-source RDBMS used by small to medium-sized businesses, known for ease of use, flexibility, and low cost.",
                            "PostgreSQL: A popular open-source RDBMS known for scalability, reliability, and support for complex transactions.",
                            "SAP: SAP HANA is an in-memory RDBMS designed for high-performance analytics and real-time reporting."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Relational Algebra"
                    },
                    {
                        "type": "paragraph",
                        "text": "Relational Algebra is a procedural language consisting of a set of operators that can be performed on relations. It forms the basis for many high-level data sub-languages like SQL and QBE. Relational algebra has mainly 9 types of operators:"
                    },
                    {
                        "type": "heading",
                        "text": "1. UNION (∪)"
                    },
                    {
                        "type": "paragraph",
                        "text": "For two relations A and B, UNION displays all values (tuples) from both relations while avoiding duplicates."
                    },
                    {
                        "type": "paragraph",
                        "text": "Syntax: A UNION B or A ∪ B"
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: A = {clerk, manager, salesman}, B = {president, clerk, manager}. Result: A UNION B = {clerk, manager, salesman, president}"
                    },
                    {
                        "type": "heading",
                        "text": "2. INTERSECTION (∩)"
                    },
                    {
                        "type": "paragraph",
                        "text": "For two relations A and B, INTERSECTION displays common elements present in both relations."
                    },
                    {
                        "type": "paragraph",
                        "text": "Syntax: A INTERSECT B or A ∩ B"
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: A = {clerk, manager, salesman}, B = {president, clerk, manager}. Result: A INTERSECT B = {clerk, manager}"
                    },
                    {
                        "type": "heading",
                        "text": "3. DIFFERENCE (─)"
                    },
                    {
                        "type": "paragraph",
                        "text": "For two relations A and B, DIFFERENCE displays elements in relation A that are not in relation B."
                    },
                    {
                        "type": "paragraph",
                        "text": "Syntax: A MINUS B or A ─ B"
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: A = {clerk, manager, salesman}, B = {president, clerk, manager}. Result: A MINUS B = {salesman}"
                    },
                    {
                        "type": "heading",
                        "text": "4. CARTESIAN PRODUCT (×)"
                    },
                    {
                        "type": "paragraph",
                        "text": "For two relations A and B, CARTESIAN PRODUCT creates a new relation consisting of all pairwise combinations of elements from A and B. If A has 'm' elements and B has 'n' elements, the result will have 'm × n' tuples."
                    },
                    {
                        "type": "paragraph",
                        "text": "Syntax: A TIMES B or A × B"
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: A = {clerk, manager, salesman}, B = {president, clerk, manager}. Result includes pairs like (clerk, president), (clerk, clerk), (manager, president), etc."
                    },
                    {
                        "type": "heading",
                        "text": "5. SELECTION (σ)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Selection operation chooses the subset of tuples from the relation that satisfies a given condition. It is denoted by σ (sigma)."
                    },
                    {
                        "type": "paragraph",
                        "text": "Syntax: σ_condition(relation_name)"
                    },
                    {
                        "type": "paragraph",
                        "text": "The selection condition is a Boolean expression using logical connectives and comparison operators (<, >, =, >=, <=, !=)."
                    },
                    {
                        "type": "heading",
                        "text": "6. PROJECTION (π)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Projection displays specified columns from a relation. It is denoted by π (pi). It selects specific attributes from tuples."
                    },
                    {
                        "type": "paragraph",
                        "text": "Syntax: π(col1, col2, ...)(relation_name)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: π(sno, sname, total)(MARKS) - selects only sno, sname, and total columns from MARKS relation."
                    },
                    {
                        "type": "heading",
                        "text": "7. JOIN (⋈)"
                    },
                    {
                        "type": "paragraph",
                        "text": "JOIN combines two or more relations based on a related column. It can be divided into four main types:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Inner Join: Returns records with matching values in both tables",
                            "Outer Join: Returns all records when there is a match in either table",
                            "Left Outer Join: Returns all records from the left table and matched records from the right",
                            "Right Outer Join: Returns all records from the right table and matched records from the left"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "8. DIVIDE (÷)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Division divides tuples from one relation by another relation."
                    },
                    {
                        "type": "paragraph",
                        "text": "Syntax: A DIVIDE B or A ÷ B"
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: A = {clerk, manager, salesman}, B = {clerk, manager}. Result: A DIVIDE B = {salesman}"
                    },
                    {
                        "type": "heading",
                        "text": "9. RENAME (ρ)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Rename gives another name to a relation or renames specified columns."
                    },
                    {
                        "type": "paragraph",
                        "text": "Syntax: ρ(NEW_NAME, OLD_NAME)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: ρ(MARKS, STUDENT) changes the 'STUDENT' relation to 'MARKS' relation."
                    },
                    {
                        "type": "heading",
                        "text": "Features of Relational Model and Codd's Rules"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Tables/Relations: The basic building block is the table or relation, representing a collection of related data with columns (attributes) and rows (tuples).",
                            "Primary Keys: Each row must have a unique identifier (primary key) ensuring uniqueness and easy access.",
                            "Foreign Keys: Used to link tables together and enforce referential integrity, ensuring data consistency across tables.",
                            "Normalization: The process of organizing data into tables and eliminating redundancy to ensure consistency and maintainability.",
                            "Codd's Rules: A set of 12 rules defining the characteristics of a true relational DBMS, ensuring consistency, reliability, and ease of use.",
                            "ACID Properties: Atomicity, Consistency, Isolation, Durability - properties ensuring reliable transaction processing."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Advantages of Relational Algebra"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Simplicity: Provides a simple and easy-to-understand set of operators based on mathematical concepts.",
                            "Formality: Offers a standardized and rigorous way of expressing queries, making them easier to write and debug.",
                            "Abstraction: Provides high-level abstraction of database structure, allowing focus on logical structure rather than physical storage.",
                            "Portability: Independent of any specific DBMS, allowing queries to be easily ported between different systems.",
                            "Efficiency: Optimized for performance, enabling quick execution with minimal resources.",
                            "Extensibility: Provides a flexible framework that can be extended with new operators and functions."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Disadvantages of Relational Algebra"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Limited Expressiveness: Has a limited set of operators, making it difficult to express certain complex queries.",
                            "Lack of Flexibility: Designed for relational databases, may not be suitable for other data storage systems.",
                            "Performance Limitations: May not handle large or complex datasets efficiently, queries can become slow.",
                            "Limited Data Types: Designed for simple data types (integers, strings, dates), not well-suited for complex data like multimedia.",
                            "Lack of Integration: Often requires additional programming effort to integrate with other systems and tools."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Codd's Twelve Rules of Relational Database"
                    },
                    {
                        "type": "paragraph",
                        "text": "Codd's Rules were proposed by Dr. E.F. Codd to define the characteristics that a database must satisfy to be considered a true Relational Database Management System (RDBMS). These rules set basic guidelines to ensure data is stored and managed in a clear, consistent, and reliable way. However, it is rare to find any product that has fulfilled all the rules of Codd. Most systems generally follow 8-9 rules."
                    },
                    {
                        "type": "paragraph",
                        "text": "E.F. Codd proposed 13 rules, popularly known as Codd's 12 rules (Rule 0 through Rule 12):"
                    },
                    {
                        "type": "heading",
                        "text": "Rule 0: Foundation Rule"
                    },
                    {
                        "type": "paragraph",
                        "text": "For any system that is advertised as, or claimed to be, a relational database management system, that system must be able to manage databases entirely through its relational capabilities. This is the fundamental rule that establishes the foundation for all other rules."
                    },
                    {
                        "type": "heading",
                        "text": "Rule 1: Information Rule"
                    },
                    {
                        "type": "paragraph",
                        "text": "All information in a relational database is represented explicitly at the logical level in exactly one way - by values in tables. Data stored in the Relational model must be a value of some cell of a table. Every piece of data must be accessible through a combination of table name, primary key, and column name."
                    },
                    {
                        "type": "heading",
                        "text": "Rule 2: Guaranteed Access Rule"
                    },
                    {
                        "type": "paragraph",
                        "text": "Every data element must be logically accessible by resorting to a combination of table name, primary key value, and column name. Each and every datum (atomic value) is guaranteed to be accessible by using a combination of the table name, primary key, and attribute name."
                    },
                    {
                        "type": "heading",
                        "text": "Rule 3: Systematic Treatment of NULL Values"
                    },
                    {
                        "type": "paragraph",
                        "text": "NULL values in the database must be supported for representing missing, unknown, or not applicable information. The DBMS must have a systematic way of handling NULL values, distinct from default values, zero, or empty strings. NULL values must be independent of data type."
                    },
                    {
                        "type": "heading",
                        "text": "Rule 4: Active Online Catalog (Data Dictionary)"
                    },
                    {
                        "type": "paragraph",
                        "text": "The database description (metadata) must be stored in the same way as regular data, so authorized users can query it using the same query language. The structure of the database must be stored in an online catalog that can be queried by authorized users using the relational language."
                    },
                    {
                        "type": "heading",
                        "text": "Rule 5: Comprehensive Data Sub-language Rule"
                    },
                    {
                        "type": "paragraph",
                        "text": "A relational database must support at least one relational language that has a well-defined syntax and is comprehensive. The language must support data definition, data manipulation, security and integrity constraints, and transaction management operations. SQL is the most common example of such a language."
                    },
                    {
                        "type": "heading",
                        "text": "Rule 6: View Updating Rule"
                    },
                    {
                        "type": "paragraph",
                        "text": "All views that are theoretically updatable must be updatable by the system. Different views created for various purposes should be automatically updatable by the system. Any view that can be updated theoretically must be updatable through the DBMS."
                    },
                    {
                        "type": "heading",
                        "text": "Rule 7: High-level Insert, Update, and Delete"
                    },
                    {
                        "type": "paragraph",
                        "text": "The database must support set-at-a-time insert, update, and delete operations. The relational model should support insert, delete, and update operations at each level of relations. Set operations like Union, Intersection, and Difference should also be supported."
                    },
                    {
                        "type": "heading",
                        "text": "Rule 8: Physical Data Independence"
                    },
                    {
                        "type": "paragraph",
                        "text": "Application programs and terminal activities remain logically unimpaired when physical access methods or storage structures are changed. Any modification in the physical location or storage structure of a table should not require modification at the application level."
                    },
                    {
                        "type": "heading",
                        "text": "Rule 9: Logical Data Independence"
                    },
                    {
                        "type": "paragraph",
                        "text": "Application programs and terminal activities remain logically unimpaired when information-preserving changes are made to the base tables. Any modification in the logical or conceptual schema of a table should not require modification at the application level. For example, merging two tables into one should not affect applications accessing them, though this is difficult to achieve."
                    },
                    {
                        "type": "heading",
                        "text": "Rule 10: Integrity Independence"
                    },
                    {
                        "type": "paragraph",
                        "text": "Integrity constraints specific to a particular relational database must be definable in the relational data sub-language and storable in the catalog. Integrity constraints must be specified separately from application programs and stored in the catalog. It must be possible to change such constraints without affecting existing applications."
                    },
                    {
                        "type": "heading",
                        "text": "Rule 11: Distribution Independence"
                    },
                    {
                        "type": "paragraph",
                        "text": "The distribution of data across different locations should be invisible to users. The end-user should not be aware of whether the database is distributed or not. Distribution of data over various locations should not be visible to end-users. Users should interact with the database as if it were stored in a single location."
                    },
                    {
                        "type": "heading",
                        "text": "Rule 12: Non-Subversion Rule"
                    },
                    {
                        "type": "paragraph",
                        "text": "If the system provides a low-level (record-at-a-time) interface, that interface cannot be used to bypass integrity rules or constraints. Low-level access to data should not be able to bypass the integrity rules and constraints defined in the higher-level relational language."
                    },
                    {
                        "type": "heading",
                        "text": "Conclusion"
                    },
                    {
                        "type": "paragraph",
                        "text": "The relational model, evolved by Dr. E.F. Codd, brought a revolution in handling data by demonstrating how data could be stored in two-dimensional tables for easier manipulation and interaction. Codd designed twelve rules that set guidelines to maintain integrity, consistency, and scalability in RDBMS."
                    },
                    {
                        "type": "paragraph",
                        "text": "While few commercial products follow these rules entirely, they remain core to database design principles. Relational databases continue to be the most widely used for their ease, simplicity, and powerful querying capabilities. As technology has evolved, Codd's principles remain guiding factors in developing scalable, secure, and efficient data management systems, forming a core ingredient of modern database solutions."
                    }
                ]
            },
            {
                "name": "Keys in Relational Model",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "In the context of a relational database, keys are one of the basic requirements of a relational database model. Keys are fundamental components that ensure data integrity, uniqueness, and efficient access. They are widely used to identify tuples (rows) uniquely in tables and to establish relationships among various columns and tables within a relational database."
                    },
                    {
                        "type": "heading",
                        "text": "Why do we require Keys in a DBMS?"
                    },
                    {
                        "type": "paragraph",
                        "text": "Keys are important in a Database Management System (DBMS) for several critical reasons:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Uniqueness: Keys ensure that each record in a table is unique and can be identified distinctly.",
                            "Data Integrity: Keys prevent data duplication and maintain the consistency of the data.",
                            "Efficient Data Retrieval: By defining relationships between tables, keys enable faster querying and better data organization.",
                            "Without keys, it would be extremely difficult to manage large datasets and queries would become inefficient and prone to errors."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Types of Database Keys"
                    },
                    {
                        "type": "heading",
                        "text": "1. Super Key"
                    },
                    {
                        "type": "paragraph",
                        "text": "The set of one or more attributes (columns) that can uniquely identify a tuple (record) is known as Super Key. It may include extra attributes that aren't important for uniqueness but still uniquely identify the row."
                    },
                    {
                        "type": "list",
                        "items": [
                            "A super key is a group of single or multiple keys that uniquely identifies rows in a table.",
                            "It supports NULL values in rows.",
                            "A super key can contain extra attributes that aren't necessary for uniqueness.",
                            "For example, if the 'STUD_NO' column can uniquely identify a student, adding 'SNAME' to it will still form a valid super key, though it's unnecessary."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: Consider the STUDENT table below. A super key could be a combination of STUD_NO and PHONE, as this combination uniquely identifies a student."
                    },
                    {
                        "type": "table",
                        "headers": ["STUD_NO", "SNAME", "ADDRESS", "PHONE"],
                        "rows": [
                            ["1", "Shyam", "Delhi", "123456789"],
                            ["2", "Rakesh", "Kolkata", "223365796"],
                            ["3", "Suraj", "Delhi", "175468965"]
                        ],
                        "caption": "STUDENT Table"
                    },
                    {
                        "type": "heading",
                        "text": "2. Candidate Key"
                    },
                    {
                        "type": "paragraph",
                        "text": "The minimal set of attributes that can uniquely identify a tuple is known as a candidate key. A candidate key is a minimal super key, meaning it can uniquely identify a record but contains no extra attributes."
                    },
                    {
                        "type": "list",
                        "items": [
                            "It is a super key with no repeated data.",
                            "The minimal set of attributes that can uniquely identify a record.",
                            "A candidate key must contain unique values, ensuring that no two rows have the same value in the candidate key's columns.",
                            "Every table must have at least a single candidate key.",
                            "A table can have multiple candidate keys but only one primary key."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: For the STUDENT table below, STUD_NO can be a candidate key, as it uniquely identifies each record."
                    },
                    {
                        "type": "table",
                        "headers": ["STUD_NO", "SNAME", "ADDRESS", "PHONE"],
                        "rows": [
                            ["1", "Shyam", "Delhi", "123456789"],
                            ["2", "Rakesh", "Kolkata", "223365796"],
                            ["3", "Suraj", "Delhi", "175468965"]
                        ],
                        "caption": "STUDENT Table"
                    },
                    {
                        "type": "paragraph",
                        "text": "Composite Candidate Key Example: In the STUDENT_COURSE table below, {STUD_NO, COURSE_NO} can be a candidate key."
                    },
                    {
                        "type": "table",
                        "headers": ["STUD_NO", "TEACHER_NO", "COURSE_NO"],
                        "rows": [
                            ["1", "001", "C001"],
                            ["2", "056", "C005"]
                        ],
                        "caption": "STUDENT_COURSE Table"
                    },
                    {
                        "type": "heading",
                        "text": "3. Primary Key"
                    },
                    {
                        "type": "paragraph",
                        "text": "There can be more than one candidate key in a relation, out of which one can be chosen as the primary key. For example, STUD_NO as well as STUD_PHONE are candidate keys for the STUDENT relation, but STUD_NO can be chosen as the primary key (only one out of many candidate keys)."
                    },
                    {
                        "type": "list",
                        "items": [
                            "A primary key is a unique key, meaning it can uniquely identify each record (tuple) in a table.",
                            "It must have unique values and cannot contain any duplicate values.",
                            "A primary key cannot be NULL, as it needs to provide a valid, unique identifier for every record.",
                            "A primary key does not have to consist of a single column. In some cases, a composite primary key (made of multiple columns) can be used.",
                            "Databases typically store rows ordered in memory according to primary key for fast access of records."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: In the STUDENT table below, STUD_NO is the primary key."
                    },
                    {
                        "type": "code",
                        "text": "STUDENT(STUD_NO, SNAME, ADDRESS, PHONE)\nPrimary Key: STUD_NO"
                    },
                    {
                        "type": "table",
                        "headers": ["STUD_NO", "SNAME", "ADDRESS", "PHONE"],
                        "rows": [
                            ["1", "Shyam", "Delhi", "123456789"],
                            ["2", "Rakesh", "Kolkata", "223365796"],
                            ["3", "Suraj", "Delhi", "175468965"]
                        ],
                        "caption": "STUDENT Table with STUD_NO as Primary Key"
                    },
                    {
                        "type": "heading",
                        "text": "4. Alternate Key"
                    },
                    {
                        "type": "paragraph",
                        "text": "An alternate key is any candidate key in a table that is not chosen as the primary key. In other words, all the keys that are not selected as the primary key are considered alternate keys."
                    },
                    {
                        "type": "list",
                        "items": [
                            "An alternate key is also referred to as a secondary key because it can uniquely identify records in a table, just like the primary key.",
                            "An alternate key can consist of one or more columns (fields) that can uniquely identify a record, but it is not the primary key."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: In the STUDENT table, both STUD_NO and PHONE are candidate keys. If STUD_NO is chosen as the primary key, then PHONE would be considered an alternate key."
                    },
                    {
                        "type": "heading",
                        "text": "5. Foreign Key"
                    },
                    {
                        "type": "paragraph",
                        "text": "A foreign key is an attribute in one table that refers to the primary key in another table. The table that contains the foreign key is called the referencing table, and the table that is referenced is called the referenced table."
                    },
                    {
                        "type": "list",
                        "items": [
                            "A foreign key in one table points to the primary key in another table, establishing a relationship between them.",
                            "It helps connect two or more tables, enabling you to create relationships between them.",
                            "This is important for maintaining data integrity and preventing data redundancy.",
                            "They act as a cross-reference between the tables.",
                            "Unlike the Primary Key, Foreign Key can be NULL as well as may contain duplicate tuples."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: Consider the STUDENT_COURSE table below. Here, STUD_NO in the STUDENT_COURSE table is a foreign key that references the STUD_NO primary key in the STUDENT table."
                    },
                    {
                        "type": "table",
                        "headers": ["STUD_NO", "TEACHER_NO", "COURSE_NO"],
                        "rows": [
                            ["1", "005", "C001"],
                            ["2", "056", "C005"],
                            ["1", "078", "C002"]
                        ],
                        "caption": "STUDENT_COURSE Table (STUD_NO is Foreign Key)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: STUD_NO in the STUDENT_COURSE relation is not unique. It has been repeated for the first and third tuples. However, the STUD_NO in STUDENT relation is a primary key and it needs to be always unique and it cannot be null."
                    },
                    {
                        "type": "heading",
                        "text": "6. Composite Key"
                    },
                    {
                        "type": "paragraph",
                        "text": "Sometimes, a table might not have a single column/attribute that uniquely identifies all the records of a table. To uniquely identify rows of a table, a combination of two or more columns/attributes can be used."
                    },
                    {
                        "type": "list",
                        "items": [
                            "It acts as a primary key if there is no primary key in a table.",
                            "Two or more attributes are used together to make a composite key.",
                            "Different combinations of attributes may give different accuracy in terms of identifying the rows uniquely."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: In the STUDENT_COURSE table, {STUD_NO, COURSE_NO} can form a composite key to uniquely identify each record."
                    },
                    {
                        "type": "code",
                        "text": "STUDENT_COURSE(STUD_NO, TEACHER_NO, COURSE_NO)\nComposite Key: {STUD_NO, COURSE_NO}"
                    },
                    {
                        "type": "heading",
                        "text": "Relationship Between Different Keys"
                    },
                    {
                        "type": "paragraph",
                        "text": "Understanding the relationship between different types of keys is crucial for database design:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Super Key ⊇ Candidate Key ⊇ Primary Key: Every primary key is a candidate key, and every candidate key is a super key.",
                            "Candidate Keys = Primary Key + Alternate Keys: All candidate keys together consist of one primary key and remaining alternate keys.",
                            "Foreign Key creates relationships: Foreign keys establish connections between tables by referencing primary keys in other tables.",
                            "Composite Key can be any type: A composite key can be a super key, candidate key, primary key, or alternate key depending on its properties."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Summary"
                    },
                    {
                        "type": "paragraph",
                        "text": "Keys are essential elements in relational databases that ensure data integrity, uniqueness, and efficient data retrieval. Each type of key serves a specific purpose:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Super Key: Any combination of attributes that uniquely identifies a record (may include extra attributes).",
                            "Candidate Key: Minimal super key with no unnecessary attributes.",
                            "Primary Key: The chosen candidate key that serves as the main unique identifier.",
                            "Alternate Key: Candidate keys that were not selected as the primary key.",
                            "Foreign Key: Attribute that references the primary key in another table to establish relationships.",
                            "Composite Key: Combination of two or more attributes used together to uniquely identify records."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Proper use of keys is fundamental to creating well-designed, efficient, and maintainable relational databases. They form the backbone of data organization and relationship management in DBMS."
                    }
                ]
            },
            {
                "name": "Mapping ER to Relational Model",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "Converting an Entity-Relationship (ER) diagram to a Relational Model is a crucial step in database design. The ER model represents the conceptual structure of a database, while the Relational Model is a physical representation that can be directly implemented using a Relational Database Management System (RDBMS) like Oracle or MySQL."
                    },
                    {
                        "type": "paragraph",
                        "text": "This mapping process involves converting entities, relationships, and attributes from the ER diagram into tables with proper keys and constraints. Different types of relationships and participation constraints require different mapping strategies."
                    },
                    {
                        "type": "heading",
                        "text": "Case 1: Binary Relationship with 1:1 Cardinality and Total Participation"
                    },
                    {
                        "type": "paragraph",
                        "text": "Scenario: A person has 0 or 1 passport number and Passport is always owned by 1 person. This is a 1:1 cardinality with full participation constraint from Passport entity."
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial Approach: Convert each entity and relationship to separate tables."
                    },
                    {
                        "type": "list",
                        "items": [
                            "Person table corresponds to Person Entity with key as Per-Id",
                            "Passport table corresponds to Passport Entity with key as Pass-No",
                            "Has table represents relationship between Person and Passport"
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial Three Tables:"
                    },
                    {
                        "type": "table",
                        "headers": ["Per-Id", "Other Person Attributes"],
                        "rows": [
                            ["PR1", "-"],
                            ["PR2", "-"],
                            ["PR3", "-"]
                        ],
                        "caption": "Person Table"
                    },
                    {
                        "type": "table",
                        "headers": ["Per-Id", "Pass-No"],
                        "rows": [
                            ["PR1", "PS1"],
                            ["PR2", "PS2"]
                        ],
                        "caption": "Has Table (Relationship)"
                    },
                    {
                        "type": "table",
                        "headers": ["Pass-No", "Other Passport Attributes"],
                        "rows": [
                            ["PS1", "-"],
                            ["PS2", "-"]
                        ],
                        "caption": "Passport Table"
                    },
                    {
                        "type": "paragraph",
                        "text": "Optimization: Since each Per-Id and Pass-No has only one entry in the Has table, we can merge all three tables into one."
                    },
                    {
                        "type": "paragraph",
                        "text": "Final Merged Table:"
                    },
                    {
                        "type": "table",
                        "headers": ["Per-Id", "Other Person Attributes", "Pass-No", "Other Passport Attributes"],
                        "rows": [
                            ["PR1", "-", "PS1", "-"],
                            ["PR2", "-", "PS2", "-"],
                            ["PR3", "-", "NULL", "NULL"]
                        ],
                        "caption": "Person-Passport Merged Table (Per-Id is Primary Key)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: Per-Id is the primary key as it will be unique and not null. Pass-No can't be the key because for some persons, it can be NULL."
                    },
                    {
                        "type": "heading",
                        "text": "Case 2: Binary Relationship with 1:1 Cardinality and Partial Participation"
                    },
                    {
                        "type": "paragraph",
                        "text": "Scenario: A male marries 0 or 1 female and vice versa. This is 1:1 cardinality with partial participation constraint from both entities."
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial Three Tables:"
                    },
                    {
                        "type": "table",
                        "headers": ["M-Id", "Other Male Attributes"],
                        "rows": [
                            ["M1", "-"],
                            ["M2", "-"],
                            ["M3", "-"]
                        ],
                        "caption": "Male Table"
                    },
                    {
                        "type": "table",
                        "headers": ["M-Id", "F-Id"],
                        "rows": [
                            ["M1", "F2"],
                            ["M2", "F1"]
                        ],
                        "caption": "Marry Table (Relationship)"
                    },
                    {
                        "type": "table",
                        "headers": ["F-Id", "Other Female Attributes"],
                        "rows": [
                            ["F1", "-"],
                            ["F2", "-"],
                            ["F3", "-"]
                        ],
                        "caption": "Female Table"
                    },
                    {
                        "type": "paragraph",
                        "text": "Analysis: Some males and some females do not marry. If we merge all 3 tables into 1, for some M-Id, F-Id will be NULL, and vice versa. There is no attribute which is always not NULL."
                    },
                    {
                        "type": "paragraph",
                        "text": "Solution: Convert into 2 tables instead of merging all three."
                    },
                    {
                        "type": "table",
                        "headers": ["M-Id", "Other Male Attributes", "F-Id"],
                        "rows": [
                            ["M1", "-", "F2"],
                            ["M2", "-", "F1"],
                            ["M3", "-", "NULL"]
                        ],
                        "caption": "Male-Marry Table (M-Id is Primary Key)"
                    },
                    {
                        "type": "table",
                        "headers": ["F-Id", "Other Female Attributes"],
                        "rows": [
                            ["F1", "-"],
                            ["F2", "-"],
                            ["F3", "-"]
                        ],
                        "caption": "Female Table (F-Id is Primary Key)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Important Note: Binary relationship with 1:1 cardinality will require 2 tables if there is partial participation of both entities. If at least 1 entity has total participation, only 1 table is required."
                    },
                    {
                        "type": "heading",
                        "text": "Case 3: Binary Relationship with N:1 Cardinality"
                    },
                    {
                        "type": "paragraph",
                        "text": "Scenario: Every student can enroll in only one elective course, but an elective course can have more than one student enrolled."
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial Three Tables:"
                    },
                    {
                        "type": "table",
                        "headers": ["S-Id", "Other Student Attributes"],
                        "rows": [
                            ["S1", "-"],
                            ["S2", "-"],
                            ["S3", "-"],
                            ["S4", "-"]
                        ],
                        "caption": "Student Table"
                    },
                    {
                        "type": "table",
                        "headers": ["S-Id", "E-Id"],
                        "rows": [
                            ["S1", "E1"],
                            ["S2", "E2"],
                            ["S3", "E1"],
                            ["S4", "E1"]
                        ],
                        "caption": "Enrolls Table (Relationship)"
                    },
                    {
                        "type": "table",
                        "headers": ["E-Id", "Other Elective Course Attributes"],
                        "rows": [
                            ["E1", "-"],
                            ["E2", "-"],
                            ["E3", "-"]
                        ],
                        "caption": "Elective_Course Table"
                    },
                    {
                        "type": "paragraph",
                        "text": "Optimization: S-Id is not repeating in the Enrolls table, so it can be considered as the key. Since both Student and Enrolls tables have the same key (S-Id), we can merge them into a single table."
                    },
                    {
                        "type": "paragraph",
                        "text": "Final Tables:"
                    },
                    {
                        "type": "table",
                        "headers": ["S-Id", "Other Student Attributes", "E-Id"],
                        "rows": [
                            ["S1", "-", "E1"],
                            ["S2", "-", "E2"],
                            ["S3", "-", "E1"],
                            ["S4", "-", "E1"]
                        ],
                        "caption": "Student-Enrolls Merged Table (S-Id is Primary Key, E-Id is Foreign Key)"
                    },
                    {
                        "type": "table",
                        "headers": ["E-Id", "Other Elective Course Attributes"],
                        "rows": [
                            ["E1", "-"],
                            ["E2", "-"],
                            ["E3", "-"]
                        ],
                        "caption": "Elective_Course Table (E-Id is Primary Key)"
                    },
                    {
                        "type": "heading",
                        "text": "Case 4: Binary Relationship with M:N Cardinality"
                    },
                    {
                        "type": "paragraph",
                        "text": "Scenario: Every student can enroll in more than 1 compulsory course, and a compulsory course can have more than 1 student enrolled."
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial Three Tables:"
                    },
                    {
                        "type": "table",
                        "headers": ["S-Id", "Other Student Attributes"],
                        "rows": [
                            ["S1", "-"],
                            ["S2", "-"],
                            ["S3", "-"],
                            ["S4", "-"]
                        ],
                        "caption": "Student Table"
                    },
                    {
                        "type": "table",
                        "headers": ["S-Id", "C-Id"],
                        "rows": [
                            ["S1", "C1"],
                            ["S1", "C2"],
                            ["S3", "C1"],
                            ["S3", "C3"],
                            ["S4", "C2"],
                            ["S4", "C3"]
                        ],
                        "caption": "Enrolls Table (Relationship)"
                    },
                    {
                        "type": "table",
                        "headers": ["C-Id", "Other Compulsory Course Attributes"],
                        "rows": [
                            ["C1", "-"],
                            ["C2", "-"],
                            ["C3", "-"],
                            ["C4", "-"]
                        ],
                        "caption": "Compulsory_Courses Table"
                    },
                    {
                        "type": "paragraph",
                        "text": "Analysis: Both S-Id and C-Id are repeating in the Enrolls table. However, their combination is unique, so {S-Id, C-Id} can be considered as a composite key."
                    },
                    {
                        "type": "paragraph",
                        "text": "Important Note: All tables have different keys, so these cannot be merged. We need to maintain all 3 tables."
                    },
                    {
                        "type": "paragraph",
                        "text": "Final Tables (No Merging):"
                    },
                    {
                        "type": "table",
                        "headers": ["S-Id", "Other Student Attributes"],
                        "rows": [
                            ["S1", "-"],
                            ["S2", "-"],
                            ["S3", "-"],
                            ["S4", "-"]
                        ],
                        "caption": "Student Table (S-Id is Primary Key)"
                    },
                    {
                        "type": "table",
                        "headers": ["S-Id", "C-Id"],
                        "rows": [
                            ["S1", "C1"],
                            ["S1", "C2"],
                            ["S3", "C1"],
                            ["S3", "C3"],
                            ["S4", "C2"],
                            ["S4", "C3"]
                        ],
                        "caption": "Enrolls Table ({S-Id, C-Id} is Composite Primary Key)"
                    },
                    {
                        "type": "table",
                        "headers": ["C-Id", "Other Compulsory Course Attributes"],
                        "rows": [
                            ["C1", "-"],
                            ["C2", "-"],
                            ["C3", "-"],
                            ["C4", "-"]
                        ],
                        "caption": "Compulsory_Courses Table (C-Id is Primary Key)"
                    },
                    {
                        "type": "heading",
                        "text": "Case 5: Binary Relationship with Weak Entity"
                    },
                    {
                        "type": "paragraph",
                        "text": "Scenario: An employee can have many dependents, and one dependent can depend on one employee. A dependent does not have any existence without an employee (e.g., you as a child can be dependent of your father in his company)."
                    },
                    {
                        "type": "paragraph",
                        "text": "Key Characteristics of Weak Entity:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Weak entity does not have a key of its own",
                            "Its participation is always total",
                            "Its key is a combination of the identifying entity's key (E-Id) and its partial key (D-Name)"
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Initial Three Tables:"
                    },
                    {
                        "type": "table",
                        "headers": ["E-Id", "Other Employee Attributes"],
                        "rows": [
                            ["E1", "-"],
                            ["E2", "-"],
                            ["E3", "-"]
                        ],
                        "caption": "Employee Table"
                    },
                    {
                        "type": "table",
                        "headers": ["E-Id", "D-Name"],
                        "rows": [
                            ["E1", "RAM"],
                            ["E1", "SRINI"],
                            ["E2", "RAM"],
                            ["E3", "ASHISH"]
                        ],
                        "caption": "Has Table (Relationship)"
                    },
                    {
                        "type": "table",
                        "headers": ["D-Name", "E-Id", "Other Dependents Attributes"],
                        "rows": [
                            ["RAM", "E1", "-"],
                            ["SRINI", "E1", "-"],
                            ["RAM", "E2", "-"],
                            ["ASHISH", "E3", "-"]
                        ],
                        "caption": "Dependents Table (Weak Entity)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Optimization: The key for both Has table and Dependents table is {E-Id, D-Name}. Since they have the same key, we can merge these two tables into one."
                    },
                    {
                        "type": "paragraph",
                        "text": "Final Tables:"
                    },
                    {
                        "type": "table",
                        "headers": ["E-Id", "Other Employee Attributes"],
                        "rows": [
                            ["E1", "-"],
                            ["E2", "-"],
                            ["E3", "-"]
                        ],
                        "caption": "Employee Table (E-Id is Primary Key)"
                    },
                    {
                        "type": "table",
                        "headers": ["D-Name", "E-Id", "Other Dependents Attributes"],
                        "rows": [
                            ["RAM", "E1", "-"],
                            ["SRINI", "E1", "-"],
                            ["RAM", "E2", "-"],
                            ["ASHISH", "E3", "-"]
                        ],
                        "caption": "Dependents Table ({D-Name, E-Id} is Composite Primary Key)"
                    },
                    {
                        "type": "heading",
                        "text": "Summary of Mapping Rules"
                    },
                    {
                        "type": "paragraph",
                        "text": "Here are the key rules for mapping ER diagrams to relational models:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "1:1 with Total Participation: Can be merged into 1 table",
                            "1:1 with Partial Participation (both): Requires 2 tables",
                            "N:1 Relationship: Can be merged into 2 tables (merge N-side entity with relationship)",
                            "M:N Relationship: Requires 3 separate tables (cannot merge)",
                            "Weak Entity: Merge weak entity with its identifying relationship (2 tables total)"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "General Mapping Guidelines"
                    },
                    {
                        "type": "numbered_list",
                        "items": [
                            "Each entity becomes a table with its attributes as columns",
                            "Primary key of the entity becomes the primary key of the table",
                            "Each relationship becomes a table with foreign keys referencing related entities",
                            "For 1:1 relationships with total participation, merge tables to reduce redundancy",
                            "For N:1 relationships, add foreign key to the N-side table",
                            "For M:N relationships, create a separate junction table with composite key",
                            "Weak entities are merged with their identifying relationship",
                            "Multivalued attributes require separate tables",
                            "Composite attributes can be flattened or kept as separate columns"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Conclusion"
                    },
                    {
                        "type": "paragraph",
                        "text": "Mapping ER diagrams to relational models is a systematic process that depends on the type of relationships and participation constraints. Understanding these mapping rules is essential for creating efficient and normalized database schemas. The goal is to minimize redundancy while maintaining data integrity and ensuring efficient query performance."
                    }
                ]
            },
            {
                "name": "Strategies for Schema design in DBMS",
                "content": [
                    {
                        "type": "heading",
                        "text": "Strategies for Schema Design"
                    },
                    {
                        "type": "paragraph",
                        "text": "There are various strategies that are considered while designing a schema. Most of these strategies follow an incremental approach that is, they must start with some schema constructs derived from the requirements and then they incrementally modify, refine or build on them."
                    },
                    {
                        "type": "heading",
                        "text": "What is Schema Design?"
                    },
                    {
                        "type": "paragraph",
                        "text": "Schema design is the process of creating a logical and organized structure for a database, which involves defining tables, columns, relationships, constraints and other elements that will govern how data is stored and accessed. Effective schema design is important for creating a robust, scalable and efficient database system. Here are some strategies for schema design in DBMS."
                    },
                    {
                        "type": "heading",
                        "text": "1. Top-Down Strategy"
                    },
                    {
                        "type": "paragraph",
                        "text": "In this strategy, we basically start with a schema that contains a high level of abstraction and then apply successive top-down refinement."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: we may specify only a few level entity types and then we specify their attributes and split them into lower-level entity types and relationships. The process of specialization to refine an entity type into a subclass is also an example of this strategy."
                    },
                    {
                        "type": "heading",
                        "text": "2. Bottom-Up Strategy"
                    },
                    {
                        "type": "paragraph",
                        "text": "In this type of strategy, we basically start with basic abstraction and then go on adding to this abstraction."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: we may start with attributes and group these into entity types and relationships. We can also add a new relationship among entity types as the design goes ahead. The basic example is the process of generalizing entity types into the higher-level generalized superclass."
                    },
                    {
                        "type": "heading",
                        "text": "3. Inside-Out Strategy"
                    },
                    {
                        "type": "paragraph",
                        "text": "This is a special case of a bottom-up strategy when attention is basically focused on a central set of concepts that are most evident. Modeling then basically spreads outward by considering new concepts in the vicinity of existing ones. We could specify a few clearly evident entity types in the schema and continue by adding other entity types and relationships that are related to each other."
                    },
                    {
                        "type": "heading",
                        "text": "4. Mixed Strategy"
                    },
                    {
                        "type": "paragraph",
                        "text": "Instead of using any particular strategy throughout the design, the requirements are partitioned according to a top-down strategy and part of the schema is designed for each partition according to a bottom-up strategy after that various schema are combined."
                    },
                    {
                        "type": "heading",
                        "text": "Way to Create Database"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Identify the purpose and scope of the database: Before designing a database schema, it is important to define the purpose and scope of the database. This will help you determine what kind of data the database needs to store, how it will be used and what types of queries will be performed on the data.",
                            "Normalize the database: Normalization is the process of organizing data into tables and applying rules to ensure data is stored in a consistent and efficient manner. By reducing data redundancy and ensuring data integrity, normalization helps to eliminate anomalies and improve the overall quality of the database.",
                            "Use data types appropriately: Choosing the right data type for each column is important for efficient data storage and retrieval. For example, using numeric data types for numeric data can improve calculation performance, while using date/time data types can help with date/time calculations and sorting.",
                            "Establish relationships between tables: Establishing relationships between tables can help to eliminate data redundancy and improve data consistency. For example, a foreign key can be used to link a record in one table to a record in another table, ensuring that data is consistent across both tables.",
                            "Use constraints to ensure data integrity: Constraints can be used to enforce rules on the data in a database, ensuring that data is accurate and consistent. For example, a primary key constraint can ensure that each record in a table has a unique identifier, while a check constraint can ensure that data meets certain conditions before it is inserted into a table.",
                            "Optimize for performance: Schema design can have a significant impact on database performance. Optimizing indexes, partitioning data and using appropriate data types can all improve query performance and reduce database overhead."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Overall, effective schema design requires a thorough understanding of the data being stored and how it will be used, as well as an understanding of best practices for database design and optimization. By following these strategies, you can create a robust and efficient database schema that meets your needs and supports your business goals."
                    },
                    {
                        "type": "heading",
                        "text": "Features of Different Strategies for Schema Design"
                    },
                    {
                        "type": "heading",
                        "text": "1. Normalization"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Divides large tables into smaller, related tables to minimize data redundancy and ensure data consistency",
                            "Reduces the need for multiple updates to maintain consistency",
                            "Eliminates data anomalies, such as update, insertion and deletion anomalies",
                            "Results in a more complex schema with more tables and relationships",
                            "May negatively impact query performance due to the increased number of joins required"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2. Denormalization"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Adds redundant data to improve query performance by reducing the number of joins required",
                            "Simplifies data access by storing all data in one place",
                            "Can result in data inconsistency if not properly managed",
                            "Increases storage requirements due to the duplicated data",
                            "Simplifies queries by reducing the number of joins required, which can result in faster query execution"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "3. Vertical Partitioning"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Splits a table into smaller tables based on columns to improve query performance",
                            "Reduces I/O operations by only reading relevant columns from disk",
                            "Simplifies data access by storing data in tables with fewer columns",
                            "Can result in a more complex schema with more tables and relationships",
                            "Can negatively impact query performance if a query requires columns from multiple tables"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "4. Horizontal Partitioning"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Splits a table into smaller tables based on rows to improve query performance and scalability",
                            "Simplifies data management by breaking down large tables into smaller, more manageable pieces",
                            "Increases query performance by reducing the amount of data that needs to be scanned",
                            "Can result in a more complex schema with more tables and relationships",
                            "Can negatively impact query performance if a query requires data from multiple partitions"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Constraints in DBMS"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Primary Key Constraint: Ensures that each record in a table is unique. Example: A 'StudentID' column in a 'Students' table where each student has a unique ID.",
                            "Foreign Key Constraint: Ensures that a value in one table must match a value in another table. Example: An 'OrderID' in an 'OrderDetails' table must match an 'OrderID' in an 'Orders' table.",
                            "Unique Constraint: Ensures that all values in a column are different. Example: An 'Email' column in a 'Users' table where each email address must be unique.",
                            "Not Null Constraint: Ensures that a column cannot have a null (empty) value. Example: A 'LastName' column in an 'Employees' table where every employee must have a last name.",
                            "Check Constraint: Ensures that all values in a column satisfy a specific condition. Example: An 'Age' column in a 'Persons' table where the age must be greater than 18.",
                            "Default Constraint: Provides a default value for a column if no value is specified. Example: A 'Status' column in an 'Orders' table where the default status is 'Pending'."
                        ]
                    }
                ]
            },
            {
                "name": "Introduction of Relational Algebra in DBMS",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "Relational Algebra is a formal language used to query and manipulate relational databases, consisting of a set of operations like selection, projection, union, and join. It provides a mathematical framework for querying databases, ensuring efficient data retrieval and manipulation."
                    },
                    {
                        "type": "list",
                        "items": [
                            "Relational algebra serves as the mathematical foundation for query SQL.",
                            "SQL queries are based on relational algebra operations, enabling users to retrieve data effectively.",
                            "Note: Relational algebra simplifies the process of querying databases and makes it easier to understand and optimize query execution for better performance. It is essential for learning SQL"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Key Concepts in Relational Algebra"
                    },
                    {
                        "type": "paragraph",
                        "text": "Before explaining relational algebra operations, let's define some fundamental concepts:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Relations: In relational algebra, a relation is a table that consists of rows and columns, representing data in a structured format. Each relation has a unique name and is made up of tuples.",
                            "Tuples: A tuple is a single row in a relation, which contains a set of values for each attribute. It represents a single data entry or record in a relational table.",
                            "Attributes: Attributes are the columns in a relation, each representing a specific characteristic or property of the data. For example, in a 'Students' relation, attributes could be 'Name', 'Age', and 'Grade'.",
                            "Domains: A domain is the set of possible values that an attribute can have. It defines the type of data that can be stored in each column of a relation, such as integers, strings, or dates."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Basic Operators in Relational Algebra"
                    },
                    {
                        "type": "paragraph",
                        "text": "Relational algebra consists of various basic operators that help us to fetch and manipulate data from relational tables in the database to perform certain operations on relational data. Basic operators are fundamental operations that include selection (σ), projection (π), union (U), set difference (−), Cartesian product (×), and rename (ρ)."
                    },
                    {
                        "type": "heading",
                        "text": "1. Selection (σ)"
                    },
                    {
                        "type": "paragraph",
                        "text": "The Selection Operation is basically used to filter out rows from a given table based on certain given condition. It basically allows us to retrieve only those rows that match the condition as per condition passed during SQL Query."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: If we have a relation R with attributes A, B, and C, and we want to select tuples where C > 3, we write: σ(c>3)(R)"
                    },
                    {
                        "type": "table",
                        "headers": ["A", "B", "C"],
                        "rows": [
                            ["1", "2", "4"],
                            ["2", "2", "3"],
                            ["3", "2", "3"],
                            ["4", "3", "4"]
                        ],
                        "caption": "Original Relation R"
                    },
                    {
                        "type": "paragraph",
                        "text": "Output (Tuples where C > 3):"
                    },
                    {
                        "type": "table",
                        "headers": ["A", "B", "C"],
                        "rows": [
                            ["1", "2", "4"],
                            ["4", "3", "4"]
                        ],
                        "caption": "Result of Selection"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: The selection operation only filters rows but does not display or change their order. The projection operator is used for displaying specific columns."
                    },
                    {
                        "type": "heading",
                        "text": "2. Projection (π)"
                    },
                    {
                        "type": "paragraph",
                        "text": "While Selection operation works on rows, similarly projection operation of relational algebra works on columns. It basically allows us to pick specific columns from a given relational table based on the given condition and ignoring all the other remaining columns."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: Suppose we want columns B and C from Relation R. π(B,C)(R) will show following columns."
                    },
                    {
                        "type": "table",
                        "headers": ["B", "C"],
                        "rows": [
                            ["2", "4"],
                            ["2", "3"],
                            ["3", "4"]
                        ],
                        "caption": "Result of Projection"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: By Default, projection operation removes duplicate values."
                    },
                    {
                        "type": "heading",
                        "text": "3. Union (U)"
                    },
                    {
                        "type": "paragraph",
                        "text": "The Union Operator is basically used to combine the results of two queries into a single result. The only condition is that both queries must return same number of columns with same data types. Union operation in relational algebra is the same as union operation in set theory."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: Consider the following table of Students having different optional subjects in their course."
                    },
                    {
                        "type": "table",
                        "headers": ["Student_Name", "Roll_Number"],
                        "rows": [
                            ["Ram", "01"],
                            ["Mohan", "02"],
                            ["Vivek", "13"],
                            ["Geeta", "17"]
                        ],
                        "caption": "Relation FRENCH"
                    },
                    {
                        "type": "table",
                        "headers": ["Student_Name", "Roll_Number"],
                        "rows": [
                            ["Vivek", "13"],
                            ["Geeta", "17"],
                            ["Shyam", "21"],
                            ["Rohan", "25"]
                        ],
                        "caption": "Relation GERMAN"
                    },
                    {
                        "type": "paragraph",
                        "text": "If FRENCH and GERMAN relations represent student names in two subjects, we can combine their student names as follows: π(Student_Name)(FRENCH) U π(Student_Name)(GERMAN)"
                    },
                    {
                        "type": "table",
                        "headers": ["Student_Name"],
                        "rows": [
                            ["Ram"],
                            ["Mohan"],
                            ["Vivek"],
                            ["Geeta"],
                            ["Shyam"],
                            ["Rohan"]
                        ],
                        "caption": "Result of Union"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: The only constraint in the union of two relations is that both relations must have the same set of Attributes."
                    },
                    {
                        "type": "heading",
                        "text": "4. Set Difference (-)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Set difference basically provides the rows that are present in one table, but not in another tables. Set Difference in relational algebra is the same set difference operation as in set theory."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: To find students enrolled only in FRENCH but not in GERMAN, we write: π(Student_Name)(FRENCH) - π(Student_Name)(GERMAN)"
                    },
                    {
                        "type": "table",
                        "headers": ["Student_Name"],
                        "rows": [
                            ["Ram"],
                            ["Mohan"]
                        ],
                        "caption": "Result of Set Difference"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: The only constraint in the Set Difference between two relations is that both relations must have the same set of Attributes."
                    },
                    {
                        "type": "heading",
                        "text": "5. Rename (ρ)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Rename operator basically allows you to give a temporary name to a specific relational table or to its columns. It is very useful when we want to avoid ambiguity, especially in complex Queries. Rename is a unary operation used for renaming attributes of a relation."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: We can rename an attribute B in relation R to D. ρ(D/B)R will rename the attribute 'B' of the relation by 'D'."
                    },
                    {
                        "type": "table",
                        "headers": ["A", "D", "C"],
                        "rows": [
                            ["1", "2", "4"],
                            ["2", "2", "3"],
                            ["3", "2", "3"],
                            ["4", "3", "4"]
                        ],
                        "caption": "Result of Rename"
                    },
                    {
                        "type": "heading",
                        "text": "6. Cartesian Product (X)"
                    },
                    {
                        "type": "paragraph",
                        "text": "The Cartesian product combines every row of one table with every row of another table, producing all the possible combination. It's mostly used as a precursor to more complex operation like joins. Let’s say A and B, so the cross product between A X B will result in all the attributes of A followed by each attribute of B. Each record of A will pair with every record of B."
                    },
                    {
                        "type": "table",
                        "headers": ["Name", "Age", "Sex"],
                        "rows": [
                            ["Ram", "14", "M"],
                            ["Sona", "15", "F"],
                            ["Kim", "20", "M"]
                        ],
                        "caption": "Relation A"
                    },
                    {
                        "type": "table",
                        "headers": ["ID", "Course"],
                        "rows": [
                            ["1", "DS"],
                            ["2", "DBMS"]
                        ],
                        "caption": "Relation B"
                    },
                    {
                        "type": "paragraph",
                        "text": "Output: If relation A has 3 rows and relation B has 2 rows, the Cartesian product A × B will result in 6 rows."
                    },
                    {
                        "type": "table",
                        "headers": ["Name", "Age", "Sex", "ID", "Course"],
                        "rows": [
                            ["Ram", "14", "M", "1", "DS"],
                            ["Ram", "14", "M", "2", "DBMS"],
                            ["Sona", "15", "F", "1", "DS"],
                            ["Sona", "15", "F", "2", "DBMS"],
                            ["Kim", "20", "M", "1", "DS"],
                            ["Kim", "20", "M", "2", "DBMS"]
                        ],
                        "caption": "Result of Cartesian Product"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: If A has 'n' tuples and B has 'm' tuples then A X B will have 'n*m' tuples."
                    },
                    {
                        "type": "heading",
                        "text": "Derived Operators in Relational Algebra"
                    },
                    {
                        "type": "paragraph",
                        "text": "Derived operators are built using basic operators and include operations like join, intersection, and division. These operators help perform more complex queries by combining basic operations to meet specific data retrieval needs."
                    },
                    {
                        "type": "heading",
                        "text": "1. Join Operators"
                    },
                    {
                        "type": "paragraph",
                        "text": "Join operations in relational algebra combine data from two or more relations based on a related attribute, allowing for more complex queries and data retrieval. Different types of joins include:"
                    },
                    {
                        "type": "heading",
                        "text": "1.1 Inner Join"
                    },
                    {
                        "type": "paragraph",
                        "text": "An inner join combines rows from two relations based on a matching condition and only returns rows where there is a match in both relations. If a record in one relation doesn't have a corresponding match in the other, it is excluded from the result. This is the most common type of join."
                    },
                    {
                        "type": "list",
                        "items": [
                            "Conditional Join: A conditional join is an inner join where the matching condition can involve any comparison operator like equals (=), greater than (>), etc. Example: Joining Employees and Departments on DepartmentID where Salary > 50000.",
                            "Equi Join: An equi join is a type of conditional join where the condition is specifically equality (=) between columns from both relations. Example: Joining Customers and Orders on CustomerID.",
                            "Natural Join: A natural join automatically combines relations based on columns with the same name and type, removing duplicate columns in the result. Example: Joining Students and Enrollments where StudentID is common."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "1.2 Outer Join"
                    },
                    {
                        "type": "paragraph",
                        "text": "An outer join returns all rows from one relation, and the matching rows from the other relation. If there is no match, the result will still include all rows from the outer relation with NULL values in the columns from the unmatched relation."
                    },
                    {
                        "type": "list",
                        "items": [
                            "Left Outer Join: Returns all rows from the left relation and the matching rows from the right relation. If no match, right relation attributes are NULL.",
                            "Right Outer Join: Returns all rows from the right relation and the matching rows from the left relation. If no match, left relation columns are NULL.",
                            "Full Outer Join: Returns all rows when there is a match in either the left or right relation. If no match, NULL values are included for the missing side."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2. Set Intersection (∩)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Set Intersection basically allows to fetches only those rows of data that are common between two sets of relational tables. Set Intersection in relational algebra is the same set intersection operation in set theory."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: From the previously defined FRENCH and GERMAN relations, the Set Intersection is used as follows: π(Student_Name)(FRENCH) ∩ π(Student_Name)(GERMAN)"
                    },
                    {
                        "type": "table",
                        "headers": ["Student_Name"],
                        "rows": [
                            ["Vivek"],
                            ["Geeta"]
                        ],
                        "caption": "Result of Set Intersection"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation: The only constraint in the Set Difference between two relations is that both relations must have the same set of Attributes."
                    },
                    {
                        "type": "heading",
                        "text": "3. Division (÷)"
                    },
                    {
                        "type": "paragraph",
                        "text": "The Division Operator is used to find tuples in one relation that are related to all tuples in another relation. It’s typically used for 'for all' queries."
                    },
                    {
                        "type": "table",
                        "headers": ["Student_ID", "Course_ID"],
                        "rows": [
                            ["101", "C1"],
                            ["101", "C2"],
                            ["102", "C1"],
                            ["103", "C1"],
                            ["103", "C2"]
                        ],
                        "caption": "Student_Course (Dividend Table)"
                    },
                    {
                        "type": "table",
                        "headers": ["Course_ID"],
                        "rows": [
                            ["C1"],
                            ["C2"]
                        ],
                        "caption": "Course (Divisor Table)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: Query is to find students who are enrolled in all courses listed in the Course table. In this case, students must be enrolled in both C1 and C2. Student_Course(Student_ID, Course_ID) ÷ Course(Course_ID)"
                    },
                    {
                        "type": "table",
                        "headers": ["Student_ID"],
                        "rows": [
                            ["101"],
                            ["103"]
                        ],
                        "caption": "Result of Division"
                    },
                    {
                        "type": "heading",
                        "text": "Relational Calculus"
                    },
                    {
                        "type": "paragraph",
                        "text": "Relational calculus is a non-procedural query language used in the context of relational algebra. It focuses on what data to retrieve, rather than how to retrieve it, making it different from relational algebra, which is procedural. In relational calculus, queries are expressed using logical formulas that describe the desired result, without specifying the exact steps to get there."
                    },
                    {
                        "type": "list",
                        "items": [
                            "Tuple Relational Calculus (TRC)",
                            "Domain Relational Calculus (DRC)"
                        ]
                    }
                ]
            },
            {
                "name": "SQL Joins (Inner, Left, Right, Full)",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "SQL joins are fundamental tools for combining data from multiple tables in relational databases."
                    },
                    {
                        "type": "paragraph",
                        "text": "For example, consider two tables where one table (say Student) has student information with id as a key and other table (say Marks) has information about marks of every student id. Now to display the marks of every student with name, we need to join the two tables."
                    },
                    {
                        "type": "paragraph",
                        "text": "Please remember, we store data into multiple tables as part of database normalization to avoid anomalies and redundancies."
                    },
                    {
                        "type": "heading",
                        "text": "Types of SQL Joins"
                    },
                    {
                        "type": "paragraph",
                        "text": "Let us visualize how each join type operates:"
                    },
                    {
                        "type": "heading",
                        "text": "1. SQL INNER JOIN"
                    },
                    {
                        "type": "paragraph",
                        "text": "The INNER JOIN keyword selects all rows from both the tables as long as the condition is satisfied. This keyword will create the result set by combining all rows from both the tables where the condition satisfies i.e value of the common field will be the same."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "code": "SELECT table1.column1,table1.column2,table2.column1,.... FROM table1  INNER JOIN\n table2 ON  table1.matching_column = table2.matching_column;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: We can also write JOIN instead of INNER JOIN. JOIN is same as INNER JOIN."
                    },
                    {
                        "type": "heading",
                        "text": "Example of INNER JOIN"
                    },
                    {
                        "type": "paragraph",
                        "text": "Consider the two tables, Student and StudentCourse, which share a common column ROLL_NO. Using SQL JOINS, we can combine data from these tables based on their relationship, allowing us to retrieve meaningful information like student details along with their enrolled courses."
                    },
                    {
                        "type": "table",
                        "headers": ["ROLL_NO", "NAME", "ADDRESS", "PHONE", "AGE"],
                        "rows": [
                            ["1", "HARSH", "DELHI", "XXXXXXXXXX", "18"],
                            ["2", "PRATIK", "BIHAR", "XXXXXXXXXX", "19"],
                            ["3", "RIYANKA", "SILIGURI", "XXXXXXXXXX", "20"],
                            ["4", "DEEP", "RAMNAGAR", "XXXXXXXXXX", "18"],
                            ["5", "ANITA", "MUMBAI", "XXXXXXXXXX", "21"]
                        ],
                        "caption": "Student Table"
                    },
                    {
                        "type": "table",
                        "headers": ["COURSE_ID", "ROLL_NO"],
                        "rows": [
                            ["1", "1"],
                            ["2", "2"],
                            ["3", "3"],
                            ["6", "7"]
                        ],
                        "caption": "StudentCourse Table"
                    },
                    {
                        "type": "paragraph",
                        "text": "Let's look at the example of INNER JOIN clause, and understand it's working. This query will show the names and age of students enrolled in different courses."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "code": "SELECT StudentCourse.COURSE_ID, Student.NAME, Student.AGE FROM Student\nINNER JOIN StudentCourse\nON Student.ROLL_NO = StudentCourse.ROLL_NO;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["COURSE_ID", "NAME", "AGE"],
                        "rows": [
                            ["1", "HARSH", "18"],
                            ["2", "PRATIK", "19"],
                            ["3", "RIYANKA", "20"]
                        ],
                        "caption": "Result of Inner Join"
                    },
                    {
                        "type": "heading",
                        "text": "2. SQL LEFT JOIN"
                    },
                    {
                        "type": "paragraph",
                        "text": "A LEFT JOIN returns all rows from the left table, along with matching rows from the right table. If there is no match, NULL values are returned for columns from the right table. LEFT JOIN is also known as LEFT OUTER JOIN."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "code": "SELECT table1.column1,table1.column2,table2.column1,....\nFROM table1 \nLEFT JOIN table2\nON table1.matching_column = table2.matching_column;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: We can also use LEFT OUTER JOIN instead of LEFT JOIN, both are the same."
                    },
                    {
                        "type": "heading",
                        "text": "LEFT JOIN Example"
                    },
                    {
                        "type": "paragraph",
                        "text": "In this example, the LEFT JOIN retrieves all rows from the Student table and the matching rows from the StudentCourse table based on the ROLL_NO column."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "code": "SELECT Student.NAME,StudentCourse.COURSE_ID \nFROM Student\nLEFT JOIN StudentCourse \nON StudentCourse.ROLL_NO = Student.ROLL_NO;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["NAME", "COURSE_ID"],
                        "rows": [
                            ["HARSH", "1"],
                            ["PRATIK", "2"],
                            ["RIYANKA", "3"],
                            ["DEEP", "NULL"],
                            ["ANITA", "NULL"]
                        ],
                        "caption": "Result of Left Join"
                    },
                    {
                        "type": "heading",
                        "text": "3. SQL RIGHT JOIN"
                    },
                    {
                        "type": "paragraph",
                        "text": "RIGHT JOIN returns all the rows of the table on the right side of the join and matching rows for the table on the left side of the join. It is very similar to LEFT JOIN for the rows for which there is no matching row on the left side, the result-set will contain null. RIGHT JOIN is also known as RIGHT OUTER JOIN."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "code": "SELECT table1.column1,table1.column2,table2.column1,....\nFROM table1 \nRIGHT JOIN table2\nON table1.matching_column = table2.matching_column;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: We can also use RIGHT OUTER JOIN instead of RIGHT JOIN, both are the same"
                    },
                    {
                        "type": "heading",
                        "text": "RIGHT JOIN Example"
                    },
                    {
                        "type": "paragraph",
                        "text": "In this example, the RIGHT JOIN retrieves all rows from the StudentCourse table and the matching rows from the Student table based on the ROLL_NO column."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "code": "SELECT Student.NAME,StudentCourse.COURSE_ID \nFROM Student\nRIGHT JOIN StudentCourse \nON StudentCourse.ROLL_NO = Student.ROLL_NO;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["NAME", "COURSE_ID"],
                        "rows": [
                            ["HARSH", "1"],
                            ["PRATIK", "2"],
                            ["RIYANKA", "3"],
                            ["NULL", "6"]
                        ],
                        "caption": "Result of Right Join"
                    },
                    {
                        "type": "heading",
                        "text": "4. SQL FULL JOIN"
                    },
                    {
                        "type": "paragraph",
                        "text": "FULL JOIN creates the result-set by combining results of both LEFT JOIN and RIGHT JOIN. The result-set will contain all the rows from both tables. For the rows for which there is no matching, the result-set will contain NULL values."
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "code": "SELECT table1.column1,table1.column2,table2.column1,....\nFROM table1 \nFULL JOIN table2\nON table1.matching_column = table2.matching_column;"
                    },
                    {
                        "type": "heading",
                        "text": "FULL JOIN Example"
                    },
                    {
                        "type": "paragraph",
                        "text": "This example demonstrates the use of a FULL JOIN, which combines the results of both LEFT JOIN and RIGHT JOIN. The query retrieves all rows from the Student and StudentCourse tables. If a record in one table does not have a matching record in the other table, the result set will include that record with NULL values for the missing fields"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "code": "SELECT Student.NAME,StudentCourse.COURSE_ID \nFROM Student\nFULL JOIN StudentCourse \nON StudentCourse.ROLL_NO = Student.ROLL_NO;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["NAME", "COURSE_ID"],
                        "rows": [
                            ["HARSH", "1"],
                            ["PRATIK", "2"],
                            ["RIYANKA", "3"],
                            ["DEEP", "NULL"],
                            ["ANITA", "NULL"],
                            ["NULL", "6"]
                        ],
                        "caption": "Result of Full Join"
                    },
                    {
                        "type": "heading",
                        "text": "5. SQL Natural Join"
                    },
                    {
                        "type": "paragraph",
                        "text": "A Natural Join is a type of INNER JOIN that automatically joins two tables based on columns with the same name and data type. It returns only the rows where the values in the common columns match."
                    },
                    {
                        "type": "list",
                        "items": [
                            "It returns rows where the values in these common columns are the same in both tables.",
                            "Common columns appear only once in the result, even if they exist in both tables.",
                            "Unlike a CROSS JOIN, which creates all possible combinations of rows, a Natural Join only includes rows with matching values"
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: Look at the two tables below: Employee and Department"
                    },
                    {
                        "type": "table",
                        "headers": ["Emp_id", "Emp_name", "Dept_id"],
                        "rows": [
                            ["1", "Ram", "10"],
                            ["2", "Jon", "30"],
                            ["3", "Bob", "50"]
                        ],
                        "caption": "Employee Table"
                    },
                    {
                        "type": "table",
                        "headers": ["Dept_id", "Dept_name"],
                        "rows": [
                            ["10", "IT"],
                            ["30", "HR"],
                            ["40", "TIS"]
                        ],
                        "caption": "Department Table"
                    },
                    {
                        "type": "paragraph",
                        "text": "Find all Employees and their respective departments. (Employee) ⨝ (Department)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Output:"
                    },
                    {
                        "type": "table",
                        "headers": ["Emp_id", "Emp_name", "Dept_id", "Dept_name"],
                        "rows": [
                            ["1", "Ram", "10", "IT"],
                            ["2", "Jon", "30", "HR"]
                        ],
                        "caption": "Result of Natural Join"
                    }
                ]
            },
            {
                "name": "Join operation vs Nested Query",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "Relational databases often store data in multiple tables to reduce redundancy and improve efficiency through normalization. However, meaningful information is often spread across these tables. To retrieve and process such data, SQL provides two key mechanisms - Joins and Nested Queries (Subqueries)."
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: While both achieve similar objectives - combining and filtering data - they differ in performance, readability and use cases. Understanding their differences is crucial for writing efficient and maintainable SQL queries."
                    },
                    {
                        "type": "heading",
                        "text": "Why Joins and Subqueries Are Used"
                    },
                    {
                        "type": "heading",
                        "text": "1. Joins"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Combine data from multiple tables based on a common column (key).",
                            "Provide a single result set containing data from all related tables.",
                            "Ideal when relationships between tables are well-defined and indexed."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2. Nested Queries (Subqueries)"
                    },
                    {
                        "type": "list",
                        "items": [
                            "A query embedded inside another query.",
                            "The inner query runs first and its result is used by the outer query.",
                            "Useful for filtering, calculating aggregated values or applying conditions that cannot be easily expressed with joins."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Performance Comparison"
                    },
                    {
                        "type": "table",
                        "headers": ["Aspect", "Joins", "Subqueries"],
                        "rows": [
                            ["Local Database", "Performance similar to subqueries", "Performance similar to joins"],
                            ["Distributed Database", "Slower if full tables need to be fetched", "Preferable; only necessary data is fetched per node"],
                            ["Implementation in MySQL", "Returns indexed results; faster for large data sets", "Inner query re-evaluated for each row; can be inefficient"],
                            ["Optimizer Support", "Well-supported and optimized in most RDBMS", "Some optimizers can convert subqueries to joins internally"],
                            ["Predictability", "More predictable performance", "Performance can vary depending on query and database engine"]
                        ],
                        "caption": "Performance Comparison: Joins vs Subqueries"
                    },
                    {
                        "type": "heading",
                        "text": "Readability and Design"
                    },
                    {
                        "type": "heading",
                        "text": "1. Joins"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Can be cryptic with multiple tables.",
                            "Typically more performant for large datasets.",
                            "Better for relational queries involving multiple tables with indexes."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2. Nested Queries (Subqueries)"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Easier to read, understand and maintain.",
                            "Supports a bottom-up design: inner query defines the dataset, outer query applies further conditions."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Join Operation"
                    },
                    {
                        "type": "paragraph",
                        "text": "Join combines rows from two or more tables based on a related column. The most common types are:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "INNER JOIN: Returns rows with matching values in both tables.",
                            "LEFT (OUTER) JOIN: Returns all rows from the left table, with matching rows from the right table if available.",
                            "RIGHT (OUTER) JOIN: Returns all rows from the right table, with matching rows from the left table if available.",
                            "FULL (OUTER) JOIN: Returns all rows from both tables, with NULLs where there is no match."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "For example, let's say we have two tables, Table1 and Table2, with the following data:"
                    },
                    {
                        "type": "table",
                        "headers": ["ID", "Name"],
                        "rows": [
                            ["1", "John"],
                            ["2", "Sarah"],
                            ["3", "David"]
                        ],
                        "caption": "Table 1"
                    },
                    {
                        "type": "table",
                        "headers": ["ID", "Address"],
                        "rows": [
                            ["1", "123 Main St."],
                            ["2", "456 Elm St."],
                            ["4", "789 Oak St."]
                        ],
                        "caption": "Table 2"
                    },
                    {
                        "type": "paragraph",
                        "text": "SQL Query (INNER JOIN):"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "code": "SELECT Table1.Name, Table2.Address\nFROM Table1\nINNER JOIN Table2\nON Table1.ID = Table2.ID;"
                    },
                    {
                        "type": "paragraph",
                        "text": "Result:"
                    },
                    {
                        "type": "table",
                        "headers": ["Name", "Address"],
                        "rows": [
                            ["John", "123 Main St."],
                            ["Sarah", "456 Elm St."]
                        ],
                        "caption": "Result of INNER JOIN"
                    },
                    {
                        "type": "heading",
                        "text": "Nested Query"
                    },
                    {
                        "type": "paragraph",
                        "text": "A subquery is a query embedded within another query. The inner query executes first and its result is used by the outer query."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: Retrieve names of people who have an address in Table2:"
                    },
                    {
                        "type": "paragraph",
                        "text": "Query:"
                    },
                    {
                        "type": "code",
                        "language": "sql",
                        "code": "SELECT Name\nFROM Table1\nWHERE ID IN (SELECT ID FROM Table2)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Result:"
                    },
                    {
                        "type": "table",
                        "headers": ["Name"],
                        "rows": [
                            ["John"],
                            ["Sarah"]
                        ],
                        "caption": "Result of Nested Query"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "The inner query SELECT ID FROM Table2 returns IDs {1,2,4}.",
                            "The outer query retrieves names from Table1 where ID is in {1,2,4}."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "When to Use Joins vs Subqueries"
                    },
                    {
                        "type": "heading",
                        "text": "1. Use Joins:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "When combining multiple tables based on relationships.",
                            "When performance is critical for large datasets.",
                            "When the RDBMS has optimized join algorithms."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2. Use Subqueries:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "When filtering based on calculated values or conditions from another query.",
                            "For queries that are easier to read in a nested structure.",
                            "When only a subset of data is required from distributed nodes."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Rule of Thumb: Joins are generally faster for large datasets, but subqueries offer flexibility for complex conditions and smaller datasets."
                    }
                ]
            },
            {
                "name": "Tuple Relational Calculus (TRC)",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "Tuple Relational Calculus (TRC) is a non-procedural query language used to retrieve data from relational databases by describing the properties of the required data (not how to fetch it). It is based on first-order predicate logic and uses tuple variables to represent rows of tables."
                    },
                    {
                        "type": "heading",
                        "text": "Syntax"
                    },
                    {
                        "type": "paragraph",
                        "text": "The basic syntax of TRC is as follows:"
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "{ t | P(t) }"
                    },
                    {
                        "type": "list",
                        "items": [
                            "t: Tuple variable (row placeholder)",
                            "P(t): Predicate condition to satisfy",
                            "{}: Denotes a set of result tuples"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Logical Operators in TRC"
                    },
                    {
                        "type": "list",
                        "items": [
                            "∧: AND",
                            "∨: OR",
                            "¬: NOT"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Quantifiers"
                    },
                    {
                        "type": "list",
                        "items": [
                            "∃ t ∈ r (Q(t)) → There exists a tuple t in relation r satisfying predicate Q(t)",
                            "∀ t ∈ r (Q(t)) → For all tuples t in relation r, predicate Q(t) holds"
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "For example, let's say we have a table called 'Employees' with the following attributes: Employee ID, Name, Salary, Department ID."
                    },
                    {
                        "type": "paragraph",
                        "text": "To retrieve the names of all employees who earn more than $50,000 per year, we can use the following TRC query:"
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "{ t | Employees(t) ∧ t.Salary > 50000 }"
                    },
                    {
                        "type": "paragraph",
                        "text": "Explanation:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Employees(t) means t is a tuple from the Employees table.",
                            "∧ (AND) is used to add a condition on salary.",
                            "The result is a set of tuples where each employee earns more than $50,000.",
                            "TRC is non-procedural - it specifies what data to retrieve, not how to retrieve it."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "While expressive, TRC is more abstract and mainly used in academic or theoretical contexts, not practical database systems."
                    },
                    {
                        "type": "heading",
                        "text": "Tuple Relational Query"
                    },
                    {
                        "type": "paragraph",
                        "text": "In Tuple Calculus, a query is expressed as {t| P(t)} where:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "t represents the resulting tuples.",
                            "P(t) is a predicate (a condition that must be true for t to be included in the result).",
                            "P(t) may have various conditions logically combined with OR (∨), AND (∧), NOT(¬)."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "It also uses quantifiers:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "∃ t ∈ r (Q(t)) = 'there exists' a tuple in t in relation r such that predicate Q(t) is true.",
                            "∀ t ∈ r (Q(t)) = Q(t) is true 'for all' tuples in relation r."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Domain Relational Calculus (DRC)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Domain Relational Calculus is similar to Tuple Relational Calculus, where it makes a list of the attributes that are to be chosen from the relations as per the conditions."
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "{<a1,a2,a3,.....an> | P(a1,a2,a3,.....an)}"
                    },
                    {
                        "type": "paragraph",
                        "text": "where a1,a2,...an are the attributes of the relation and P is the condition."
                    },
                    {
                        "type": "heading",
                        "text": "Tuple Relational Calculus Examples"
                    },
                    {
                        "type": "paragraph",
                        "text": "Consider the following database tables:"
                    },
                    {
                        "type": "table",
                        "headers": ["Customer name", "Street", "City"],
                        "rows": [
                            ["Saurabh", "A7", "Patiala"],
                            ["Mehak", "B6", "Jalandhar"],
                            ["Sumiti", "D9", "Ludhiana"],
                            ["Ria", "A5", "Patiala"]
                        ],
                        "caption": "Table Customer"
                    },
                    {
                        "type": "table",
                        "headers": ["Branch name", "Branch City"],
                        "rows": [
                            ["ABC", "Patiala"],
                            ["DEF", "Ludhiana"],
                            ["GHI", "Jalandhar"]
                        ],
                        "caption": "Table Branch"
                    },
                    {
                        "type": "table",
                        "headers": ["Account number", "Branch name", "Balance"],
                        "rows": [
                            ["1111", "ABC", "50000"],
                            ["1112", "DEF", "10000"],
                            ["1113", "GHI", "9000"],
                            ["1114", "ABC", "7000"]
                        ],
                        "caption": "Table Account"
                    },
                    {
                        "type": "table",
                        "headers": ["Loan number", "Branch name", "Amount"],
                        "rows": [
                            ["L33", "ABC", "10000"],
                            ["L35", "DEF", "15000"],
                            ["L49", "GHI", "9000"],
                            ["L98", "DEF", "65000"]
                        ],
                        "caption": "Table Loan"
                    },
                    {
                        "type": "table",
                        "headers": ["Customer name", "Loan number"],
                        "rows": [
                            ["Saurabh", "L33"],
                            ["Mehak", "L49"],
                            ["Ria", "L98"]
                        ],
                        "caption": "Table Borrower"
                    },
                    {
                        "type": "table",
                        "headers": ["Customer name", "Account number"],
                        "rows": [
                            ["Saurabh", "1111"],
                            ["Mehak", "1113"],
                            ["Suniti", "1114"]
                        ],
                        "caption": "Table Depositor"
                    },
                    {
                        "type": "heading",
                        "text": "Example 1: Find the loan number, branch, and amount of loans greater than or equal to 10000 amount"
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "{t| t ∈ loan  ∧ t[amount]>=10000}"
                    },
                    {
                        "type": "paragraph",
                        "text": "Resulting relation:"
                    },
                    {
                        "type": "table",
                        "headers": ["Loan number", "Branch name", "Amount"],
                        "rows": [
                            ["L33", "ABC", "10000"],
                            ["L35", "DEF", "15000"],
                            ["L98", "DEF", "65000"]
                        ],
                        "caption": "Result"
                    },
                    {
                        "type": "paragraph",
                        "text": "In the above query, t[amount] is known as a tuple variable."
                    },
                    {
                        "type": "heading",
                        "text": "Example 2: Find the loan number for each loan of an amount greater or equal to 10000"
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "{t| ∃ s ∈ loan(t[loan number] = s[loan number]\n                   ∧ s[amount]>=10000)}"
                    },
                    {
                        "type": "paragraph",
                        "text": "Resulting relation:"
                    },
                    {
                        "type": "table",
                        "headers": ["Loan number"],
                        "rows": [
                            ["L33"],
                            ["L35"],
                            ["L98"]
                        ],
                        "caption": "Result"
                    },
                    {
                        "type": "heading",
                        "text": "Example 3: Find the names of all customers who have a loan and an account at the bank"
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "{t | ∃ s ∈ borrower( t[customer-name] = s[customer-name])\n∧  ∃ u ∈ depositor( t[customer-name] = u[customer-name])}"
                    },
                    {
                        "type": "paragraph",
                        "text": "Resulting relation:"
                    },
                    {
                        "type": "table",
                        "headers": ["Customer name"],
                        "rows": [
                            ["Saurabh"],
                            ["Mehak"]
                        ],
                        "caption": "Result"
                    },
                    {
                        "type": "heading",
                        "text": "Example 4: Find the names of all customers having a loan at the 'ABC' branch"
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "{t | ∃ s ∈ borrower(t[customer-name] = s[customer-name]\n   ∧ ∃ u ∈  loan(u[branch-name] = \"ABC\" ∧ u[loan-number] = s[loan-number]))}"
                    },
                    {
                        "type": "paragraph",
                        "text": "Resulting relation:"
                    },
                    {
                        "type": "table",
                        "headers": ["Customer name"],
                        "rows": [
                            ["Saurabh"]
                        ],
                        "caption": "Result"
                    },
                    {
                        "type": "heading",
                        "text": "Key Concepts"
                    },
                    {
                        "type": "list",
                        "items": [
                            "TRC does not specify execution steps, only the condition of result.",
                            "It focuses on what to retrieve, not how.",
                            "Based on variables, predicates, and quantifiers.",
                            "More theoretical, often used in database theory, formal methods, and GATE questions."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Comparison: TRC vs Relational Algebra"
                    },
                    {
                        "type": "table",
                        "headers": ["Feature", "TRC", "Relational Algebra"],
                        "rows": [
                            ["Type", "Non-procedural", "Procedural"],
                            ["Focus", "What to retrieve", "How to retrieve"],
                            ["Expression Style", "Logical expressions", "Set-based operators"],
                            ["Execution", "Abstract, not directly executable", "Directly convertible to query"],
                            ["Use in DBMS", "Theoretical foundation", "Basis for query execution"]
                        ],
                        "caption": "TRC vs Relational Algebra"
                    },
                    {
                        "type": "heading",
                        "text": "Important Points to Remember"
                    },
                    {
                        "type": "list",
                        "items": [
                            "TRC is declarative: Describes result conditions, not how to get them.",
                            "Uses tuple variables referring to rows.",
                            "Allows quantifiers and logic operators for flexible querying.",
                            "Similar to mathematical set notation.",
                            "Does not include built-in operators like SQL or Relational Algebra.",
                            "Each TRC query defines a set of tuples satisfying given predicates.",
                            "Safer queries (domain-independent) always produce meaningful results regardless of database size or content."
                        ]
                    }
                ]
            },
            {
                "name": "Domain Relational Calculus (DRC)",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "Domain Relational Calculus (DRC) is a formal query language for relational databases. It describes queries by specifying a set of conditions or formulas that the data must satisfy. These conditions are written using domain variables and predicates, and it returns a relation that satisfies the specified conditions."
                    },
                    {
                        "type": "paragraph",
                        "text": "A general form of a DRC query is written as:"
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "{ < x1, x2, x3, ..., xn > | P (x1, x2, x3, ..., xn ) }"
                    },
                    {
                        "type": "paragraph",
                        "text": "where, <x1, x2, x3, ..., xn> represents resulting domains variables and P (x1, x2, x3, ..., xn) represents the condition or formula equivalent to the Predicate calculus."
                    },
                    {
                        "type": "paragraph",
                        "text": "The query returns a relation where each tuple consists of values for the domain variables x1, x2, …, xn such that the predicate P is true."
                    },
                    {
                        "type": "heading",
                        "text": "Key Characteristics of DRC"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Non-procedural: Specifies what data to retrieve without describing the steps for retrieval.",
                            "Based on Predicate Calculus: Utilizes logical expressions (predicates) to describe the query.",
                            "Relational Database Queries: Primarily used for querying relational databases."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Components of Domain Relational Calculus (DRC)"
                    },
                    {
                        "type": "heading",
                        "text": "1. Domain Variables"
                    },
                    {
                        "type": "paragraph",
                        "text": "Domain variables represent the attributes (fields) that will appear in the resulting relation of the query. These variables are the placeholders that will hold the actual values in the result."
                    },
                    {
                        "type": "heading",
                        "text": "2. Predicate"
                    },
                    {
                        "type": "paragraph",
                        "text": "A predicate is a logical condition or formula that the data must satisfy. It is expressed using comparison operators, connectives, and quantifiers."
                    },
                    {
                        "type": "list",
                        "items": [
                            "Comparison operators: =, >, <, >=, <=, !=.",
                            "Connectives: AND, OR, NOT.",
                            "Quantifiers: FOR ALL, EXISTS."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "3. Quantifiers"
                    },
                    {
                        "type": "paragraph",
                        "text": "Quantifiers are used to express the scope of a query:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Existential quantifier (∃): Denotes that there exists at least one instance that satisfies a condition.",
                            "Universal quantifier (∀): Denotes that all instances in the domain satisfy a condition."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "4. Domains and Relations"
                    },
                    {
                        "type": "paragraph",
                        "text": "A domain refers to a specific set of values (like integers, strings) that a variable can take. A relation is a table in the database, and the tuples in the relation represent data that matches the query conditions."
                    },
                    {
                        "type": "heading",
                        "text": "Writing Queries in Domain Relational Calculus (DRC)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Writing a query in DRC involves describing the desired result by specifying the domain variables and predicates that define the conditions the data must meet. Below are examples:"
                    },
                    {
                        "type": "table",
                        "headers": ["Customer Name", "Street", "City"],
                        "rows": [
                            ["Debomit", "Kadamtala", "Alipurduar"],
                            ["Sayantan", "Udaypur", "Balurghat"],
                            ["Soumya", "Nutanchati", "Bankura"],
                            ["Ritu", "Juhu", "Mumbai"]
                        ],
                        "caption": "Table 1: Customer"
                    },
                    {
                        "type": "table",
                        "headers": ["Loan Number", "Branch Name", "Amount"],
                        "rows": [
                            ["L01", "Main", "200"],
                            ["L03", "Main", "150"],
                            ["L10", "Sub", "90"],
                            ["L08", "Main", "60"]
                        ],
                        "caption": "Table 2: Loan"
                    },
                    {
                        "type": "table",
                        "headers": ["Customer Name", "Loan Number"],
                        "rows": [
                            ["Ritu", "L01"],
                            ["Debomit", "L08"],
                            ["Soumya", "L03"]
                        ],
                        "caption": "Table 3: Borrower"
                    },
                    {
                        "type": "heading",
                        "text": "Example 1: Finding Loans with Amount >= 100"
                    },
                    {
                        "type": "paragraph",
                        "text": "To find all loans with an amount greater than or equal to 100, we use the following query in DRC:"
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "{≺l, b, a≻ | ≺l, b, a≻ ∈ loan ∧ (a ≥ 100)}"
                    },
                    {
                        "type": "paragraph",
                        "text": "Resulting relation:"
                    },
                    {
                        "type": "table",
                        "headers": ["Loan Number", "Branch Name", "Amount"],
                        "rows": [
                            ["L01", "Main", "200"],
                            ["L03", "Main", "150"]
                        ],
                        "caption": "Result"
                    },
                    {
                        "type": "paragraph",
                        "text": "This query specifies that the result will contain the loan number (l), branch name (b), and amount (a) from the loan relation where the amount is greater than or equal to 100."
                    },
                    {
                        "type": "heading",
                        "text": "Example 2: Finding Loan Numbers >= 150"
                    },
                    {
                        "type": "paragraph",
                        "text": "To find loan numbers where the amount is greater than or equal to 150, we write:"
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "{≺l≻ | ∃ b, a (≺l, b, a≻ ∈ loan ∧ (a ≥ 150))}"
                    },
                    {
                        "type": "paragraph",
                        "text": "Resulting Relation:"
                    },
                    {
                        "type": "table",
                        "headers": ["Loan Number"],
                        "rows": [
                            ["L01"],
                            ["L03"]
                        ],
                        "caption": "Result"
                    },
                    {
                        "type": "heading",
                        "text": "Example 3: Finding Customers with Loans from 'Main' Branch"
                    },
                    {
                        "type": "paragraph",
                        "text": "To find the names of customers who have a loan at the 'Main' branch, along with their loan amounts:"
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "{≺c, a≻ | ∃ l (≺c, l≻ ∈ borrower ∧ ∃ b (≺l, b, a≻ ∈ loan ∧ (b = \"Main\")))}"
                    },
                    {
                        "type": "paragraph",
                        "text": "Resulting relation:"
                    },
                    {
                        "type": "table",
                        "headers": ["Customer Name", "Amount"],
                        "rows": [
                            ["Ritu", "200"],
                            ["Debomit", "60"],
                            ["Soumya", "150"]
                        ],
                        "caption": "Result"
                    },
                    {
                        "type": "heading",
                        "text": "Advantages of Domain Relational Calculus (DRC)"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Declarative Nature: DRC allows the user to describe what data they need without having to specify how to retrieve it. This makes it easier to write queries and understand them.",
                            "Mathematical Foundation: Being based on predicate logic, DRC provides a solid theoretical foundation for relational databases.",
                            "Non-Procedural: Unlike procedural query languages, DRC focuses on describing the result, not the procedure to get it.",
                            "Flexible and Powerful: It supports complex queries involving multiple relations, predicates, and conditions."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Limitations of Domain Relational Calculus (DRC)"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Complexity: DRC can be difficult to use for complex queries due to its reliance on logical formulas. It requires a good understanding of predicate calculus.",
                            "No Specification of Query Execution: Since it is non-procedural, DRC does not specify how queries should be executed, which can sometimes lead to inefficiencies in query execution.",
                            "Lack of Optimization: Unlike SQL, DRC does not provide built-in optimization mechanisms, meaning that users must rely on the DBMS for query optimization.",
                            "Less User-Friendly: As a formal query language, DRC is not as user-friendly as SQL, which is more widely used and has a simpler syntax."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "DRC vs TRC (Tuple Relational Calculus) Comparison"
                    },
                    {
                        "type": "table",
                        "headers": ["Aspect", "Domain Relational Calculus", "Tuple Relational Calculus"],
                        "rows": [
                            ["Query Focus", "Focuses on domain variables (attributes)", "Focuses on tuple variables (rows)"],
                            ["Syntax", "Describes queries using domain variables and predicates", "Describes queries using tuple variables and predicates"],
                            ["Usage", "More abstract; deals with individual attributes", "Deals with entire rows (tuples) in a relation"],
                            ["Query Writing Style", "Less intuitive; requires logical expressions involving attributes", "More intuitive; uses variables representing tuples"],
                            ["Complexity", "Can be more complex due to the abstraction of variables", "Simpler to understand and write compared to DRC"]
                        ],
                        "caption": "DRC vs TRC Comparison"
                    },
                    {
                        "type": "paragraph",
                        "text": "While both DRC and TRC are non-procedural query languages that allow users to query relational databases, DRC focuses on individual attributes (domain variables), while TRC focuses on tuples (rows). TRC is more widely used because it is more intuitive and easier to understand."
                    }
                ]
            },
            {
                "name": "Attribute Closure in DBMS",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "Functional dependency and attribute closure are essential for maintaining data integrity and building effective, organized and normalized databases. Attribute closure of an attribute set can be defined as set of attributes which can be functionally determined from it."
                    },
                    {
                        "type": "heading",
                        "text": "How to find attribute closure of an attribute set?"
                    },
                    {
                        "type": "paragraph",
                        "text": "To find attribute closure of an attribute set:"
                    },
                    {
                        "type": "numbered_list",
                        "items": [
                            "Add elements of attribute set to the result set.",
                            "Recursively add elements to the result set which can be functionally determined from the elements of the result set."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Using FD set of table 1, attribute closure can be determined as:"
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "(STUD_NO)+ = {STUD_NO, STUD_NAME, STUD_PHONE, STUD_STATE, STUD_COUNTRY, STUD_AGE}\n(STUD_STATE)+ = {STUD_STATE, STUD_COUNTRY}"
                    },
                    {
                        "type": "heading",
                        "text": "Important Points About Attribute Closure"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Helps to identify all possible attributes that can be derived from a set of given attributes.",
                            "Helps in database design by showing how attributes and tables are related, which can improve query performance.",
                            "Can be computationally expensive, especially for large datasets.",
                            "Become complex to manage as the number of attributes and tables increases."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "How to Find Candidate Keys and Super Keys Using Attribute Closure?"
                    },
                    {
                        "type": "list",
                        "items": [
                            "If attribute closure of an attribute set contains all attributes of relation, the attribute set will be super key of the relation.",
                            "If no subset of this attribute set can functionally determine all attributes of the relation, the set will be candidate key as well."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "For Example, using FD set of table 1:"
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "(STUD_NO, STUD_NAME)+ = {STUD_NO, STUD_NAME, STUD_PHONE, STUD_STATE, STUD_COUNTRY, STUD_AGE}\n\n(STUD_NO)+ = {STUD_NO, STUD_NAME, STUD_PHONE, STUD_STATE, STUD_COUNTRY, STUD_AGE}"
                    },
                    {
                        "type": "paragraph",
                        "text": "(STUD_NO, STUD_NAME) will be super key but not candidate key because its subset (STUD_NO)+ is equal to all attributes of the relation. So, STUD_NO will be a candidate key."
                    },
                    {
                        "type": "heading",
                        "text": "Prime and Non-Prime Attributes"
                    },
                    {
                        "type": "paragraph",
                        "text": "Attributes which are parts of any candidate key of relation are called as prime attribute, others are non-prime attributes. For Example, STUD_NO in STUDENT relation is prime attribute, others are non-prime attribute."
                    },
                    {
                        "type": "heading",
                        "text": "GATE Questions"
                    },
                    {
                        "type": "heading",
                        "text": "Q.1: Finding Key for Relation (GATE-CS-2014)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Consider the relation scheme R = {E, F, G, H, I, J, K, L, M, N} and the set of functional dependencies {{E, F} -> {G}, {F} -> {I, J}, {E, H} -> {K, L}, K -> {M}, L -> {N}} on R. What is the key for R?"
                    },
                    {
                        "type": "list",
                        "items": [
                            "A. {E, F}",
                            "B. {E, F, H}",
                            "C. {E, F, H, K, L}",
                            "D. {E}"
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Solution: Finding attribute closure of all given options, we get:"
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "{E,F}+ = {EFGIJ}\n{E,F,H}+ = {EFHGIJKLMN}\n{E,F,H,K,L}+ = {EFHGIJKLMN}\n{E}+ = {E}"
                    },
                    {
                        "type": "paragraph",
                        "text": "{EFH}+ and {EFHKL}+ results in set of all attributes, but EFH is minimal. So it will be candidate key. So correct option is (B)."
                    },
                    {
                        "type": "heading",
                        "text": "Q.2: How to check whether an FD can be derived from a given FD set?"
                    },
                    {
                        "type": "paragraph",
                        "text": "Solution: To check whether an FD A->B can be derived from an FD set F:"
                    },
                    {
                        "type": "numbered_list",
                        "items": [
                            "Find (A)+ using FD set F.",
                            "If B is subset of (A)+, then A->B is true else not true."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Q.3: Checking Implied Functional Dependencies (GATE IT 2005)"
                    },
                    {
                        "type": "paragraph",
                        "text": "In a schema with attributes A, B, C, D and E following set of functional dependencies are given {A -> B, A -> C, CD -> E, B -> D, E -> A}. Which of the following functional dependencies is NOT implied by the above set?"
                    },
                    {
                        "type": "list",
                        "items": [
                            "A. CD -> AC",
                            "B. BD -> CD",
                            "C. BC -> CD",
                            "D. AC -> BC"
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Solution: Using FD set given in question,"
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "(CD)+ = {CDEAB} which means CD -> AC also holds true.\n(BD)+ = {BD} which means BD -> CD can't hold true."
                    },
                    {
                        "type": "paragraph",
                        "text": "So this FD is not implied in FD set. So (B) is the required option. Others can be checked in the same way."
                    },
                    {
                        "type": "heading",
                        "text": "Q.4: Finding Candidate Keys (GATE 2005)"
                    },
                    {
                        "type": "paragraph",
                        "text": "Consider a relation scheme R = (A, B, C, D, E, H) on which the following functional dependencies hold: {A->B, BC->D, E->C, D->A}. What are the candidate keys of R?"
                    },
                    {
                        "type": "list",
                        "items": [
                            "(a) AE, BE",
                            "(b) AE, BE, DE",
                            "(c) AEH, BEH, BCH",
                            "(d) AEH, BEH, DEH"
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Solution:"
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "(AE)+ = {ABECD} which is not set of all attributes. So AE is not a candidate key.\nHence option A and B are wrong.\n\n(AEH)+ = {ABCDEH}\n(BEH)+ = {BEHCDA}\n(BCH)+ = {BCHDA} which is not set of all attributes. So BCH is not a candidate key.\nHence option C is wrong."
                    },
                    {
                        "type": "paragraph",
                        "text": "So correct answer is D."
                    }
                ]
            },
            {
                "name": "Armstrong's Axioms in Functional Dependency",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "Armstrong's Axioms refer to a set of inference rules, introduced by William W. Armstrong, that are used to test the logical implication of functional dependencies. Given a set of functional dependencies F, the closure of F (denoted as F+) is the set of all functional dependencies logically implied by F. Armstrong's Axioms, when applied repeatedly, help generate the closure of functional dependencies."
                    },
                    {
                        "type": "paragraph",
                        "text": "These axioms are fundamental in determining functional dependencies in databases and are used to derive conclusions about the relationships between attributes."
                    },
                    {
                        "type": "heading",
                        "text": "Axioms"
                    },
                    {
                        "type": "heading",
                        "text": "Axiom of Reflexivity"
                    },
                    {
                        "type": "paragraph",
                        "text": "If A is a set of attributes and B is a subset of A, then A holds B. If B⊆A then A→B. This property is trivial property."
                    },
                    {
                        "type": "heading",
                        "text": "Axiom of Augmentation"
                    },
                    {
                        "type": "paragraph",
                        "text": "If A→B holds and Y is the attribute set, then AY→BY also holds. That is adding attributes to dependencies, does not change the basic dependencies. If A→B, then AC→BC for any C."
                    },
                    {
                        "type": "heading",
                        "text": "Axiom of Transitivity"
                    },
                    {
                        "type": "paragraph",
                        "text": "Same as the transitive rule in algebra, if A→B holds and B→C holds, then A→C also holds. A→B is called A functionally which determines B. If X→Y and Y→Z, then X→Z."
                    },
                    {
                        "type": "heading",
                        "text": "Example"
                    },
                    {
                        "type": "paragraph",
                        "text": "Let's assume the following functional dependencies:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "{A} → {B}",
                            "{B} → {C}",
                            "{A, C} → {D}"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "1. Reflexivity"
                    },
                    {
                        "type": "paragraph",
                        "text": "Since any set of attributes determines its subset, we can immediately infer the following:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "{A} → {A} (A set always determines itself).",
                            "{B} → {B}.",
                            "{A, C} → {A}."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "2. Augmentation"
                    },
                    {
                        "type": "paragraph",
                        "text": "If we know that {A} → {B}, we can add the same attribute (or set of attributes) to both sides:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "From {A} → {B}, we can augment both sides with {C}: {A, C} → {B, C}.",
                            "From {B} → {C}, we can augment both sides with {A}: {A, B} → {C, B}."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "3. Transitivity"
                    },
                    {
                        "type": "paragraph",
                        "text": "If we know {A} → {B} and {B} → {C}, we can infer that:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "{A} → {C} (Using transitivity: {A} → {B} and {B} → {C})."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Although Armstrong's axioms are sound and complete, there are additional rules for functional dependencies that are derived from them. These rules are introduced to simplify operations and make the process easier."
                    },
                    {
                        "type": "heading",
                        "text": "Secondary Rules"
                    },
                    {
                        "type": "paragraph",
                        "text": "These rules can be derived from the above axioms."
                    },
                    {
                        "type": "list",
                        "items": [
                            "Union: If A→B holds and A→C holds, then A→BC holds. If X→Y and X→Z then X→YZ.",
                            "Composition: If A→B and X→Y hold, then AX→BY holds.",
                            "Decomposition: If A→BC holds then A→B and A→C hold. If X→YZ then X→Y and X→Z.",
                            "Pseudo Transitivity: If A→B holds and BC→D holds, then AC→D holds. If X→Y and YZ→W then XZ→W."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example of Secondary Rules"
                    },
                    {
                        "type": "paragraph",
                        "text": "Let's assume we have the following functional dependencies in a relation schema:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "{A} → {B}",
                            "{A} → {C}",
                            "{X} → {Y}",
                            "{Y, Z} → {W}"
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Now, let's apply the Secondary Rules to derive new functional dependencies."
                    },
                    {
                        "type": "heading",
                        "text": "1. Union Rule"
                    },
                    {
                        "type": "paragraph",
                        "text": "If A → B and A → C, then by the Union Rule, we can infer: A → BC. This means if A determines both B and C, it also determines their combination, BC."
                    },
                    {
                        "type": "heading",
                        "text": "2. Composition Rule"
                    },
                    {
                        "type": "paragraph",
                        "text": "If A → B and X → Y hold, then by the Composition Rule, we can infer: AX → BY"
                    },
                    {
                        "type": "heading",
                        "text": "3. Decomposition Rule"
                    },
                    {
                        "type": "paragraph",
                        "text": "If A → BC holds, then by the Decomposition Rule, we can infer: A → B and A → C"
                    },
                    {
                        "type": "heading",
                        "text": "4. Pseudo Transitivity Rule"
                    },
                    {
                        "type": "paragraph",
                        "text": "If A → B and BC → D hold, then by the Pseudo Transitivity Rule, we can infer: AC → D"
                    },
                    {
                        "type": "heading",
                        "text": "Armstrong Relation"
                    },
                    {
                        "type": "paragraph",
                        "text": "Armstrong Relation can be stated as a relation that is able to satisfy all functional dependencies in the F+ Closure. In the given set of dependencies, the size of the minimum Armstrong Relation is an exponential function of the number of attributes present in the dependency under consideration."
                    },
                    {
                        "type": "heading",
                        "text": "Why Armstrong Axioms Are Considered Sound and Complete?"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Soundness: Armstrong's axioms are sound because any functional dependency inferred using them will always be valid and hold true in every relation state that satisfies the original set of dependencies.",
                            "Completeness: Armstrong's axioms are complete because applying them repeatedly will generate all possible functional dependencies that can be derived from the original set, ensuring no dependencies are missed."
                        ]
                    }
                ]
            },
            {
                "name": "Canonical Cover of Functional Dependencies",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "Managing a large set of functional dependencies can result in unnecessary computational overhead. This is where the canonical cover becomes useful. A canonical cover is a set of functional dependencies that is equivalent to a given set of functional dependencies but is minimal in terms of the number of dependencies. Canonical Cover of functional dependency is also called minimal set of functional dependency or irreducible form of functional dependency."
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: An attribute in a functional dependency is considered extraneous if it can be removed without altering the closure of the set of functional dependencies."
                    },
                    {
                        "type": "heading",
                        "text": "Steps to find Canonical Cover"
                    },
                    {
                        "type": "paragraph",
                        "text": "The process of finding the canonical cover of a set of functional dependencies involves the following steps:"
                    },
                    {
                        "type": "heading",
                        "text": "Step 1: Combine Functional Dependencies with the Same Left-Hand Side"
                    },
                    {
                        "type": "paragraph",
                        "text": "If two or more functional dependencies in F have the same left-hand side, combine them into a single functional dependency by taking the union of their right-hand sides. Example: A -> B and A -> C become A -> BC."
                    },
                    {
                        "type": "heading",
                        "text": "Step 2: Eliminate Extraneous Attributes"
                    },
                    {
                        "type": "paragraph",
                        "text": "An attribute is extraneous if removing it does not change the closure of the functional dependency set. There are two scenarios:"
                    },
                    {
                        "type": "paragraph",
                        "text": "Extraneous Attributes on the Left-Hand Side: For X -> Y, check if any attribute in X can be removed without affecting the closure."
                    },
                    {
                        "type": "paragraph",
                        "text": "To check:"
                    },
                    {
                        "type": "numbered_list",
                        "items": [
                            "Remove an attribute A from X to form X′.",
                            "Compute the closure of F with X′ -> Y instead of X -> Y.",
                            "If the closure remains unchanged, A is extraneous."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Extraneous Attributes on the Right-Hand Side: For X -> Y, check if any attribute in Y can be removed without affecting the closure."
                    },
                    {
                        "type": "paragraph",
                        "text": "To check:"
                    },
                    {
                        "type": "numbered_list",
                        "items": [
                            "Remove an attribute B from Y.",
                            "Compute the closure of F with X -> Y′, where Y′ is Y without B.",
                            "If the closure remains unchanged, B is extraneous."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Step 3: Decompose Functional Dependencies"
                    },
                    {
                        "type": "paragraph",
                        "text": "If the right-hand side of a functional dependency has multiple attributes (e.g., X -> AB), decompose it into multiple functional dependencies, each with a single attribute on the right-hand side. Example: X -> AB becomes X -> A and X -> B."
                    },
                    {
                        "type": "heading",
                        "text": "Step 4: Check for Redundant Dependencies"
                    },
                    {
                        "type": "paragraph",
                        "text": "A functional dependency FD in F is redundant if it can be removed without changing the closure of F."
                    },
                    {
                        "type": "paragraph",
                        "text": "To check:"
                    },
                    {
                        "type": "numbered_list",
                        "items": [
                            "Temporarily remove FD from F.",
                            "Compute the closure of the remaining set.",
                            "If the closure is the same as the closure of the original set, FD is redundant and can be removed."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Step 5: Verify the Final Canonical Cover"
                    },
                    {
                        "type": "paragraph",
                        "text": "Ensure that each functional dependency is in its simplest form:"
                    },
                    {
                        "type": "numbered_list",
                        "items": [
                            "The left-hand side has no extraneous attributes.",
                            "The right-hand side contains only one attribute."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Check that the closure of the canonical cover is the same as the closure of the original set F."
                    },
                    {
                        "type": "heading",
                        "text": "Illustrative Examples"
                    },
                    {
                        "type": "heading",
                        "text": "Example 1"
                    },
                    {
                        "type": "paragraph",
                        "text": "Consider a set of Functional dependencies: F = {A -> BC, B -> C, AB -> C}. Here are the steps to find the canonical cover:"
                    },
                    {
                        "type": "paragraph",
                        "text": "Step 1: Combine Functional Dependencies with the Same Left-Hand Side - No two functional dependencies in F have the same left-hand side, so no changes are needed at this stage."
                    },
                    {
                        "type": "paragraph",
                        "text": "Step 2: Eliminate Extraneous Attributes"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Check A -> BC: The left-hand side A has no extraneous attributes because it's a single attribute. Check the right-hand side for extraneous attributes: Split A -> BC into A -> B and A -> C. Now, F = {A -> B, A -> C, B -> C, AB -> C}.",
                            "Check B -> C: The left-hand side B has no extraneous attributes (it's a single attribute). No changes are needed.",
                            "Check AB -> C: First, check if A or B is extraneous. We can reach C without using AB -> C with other functional dependencies; therefore, we remove AB -> C. Finally, we have {A -> B, A -> C, B -> C}."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Step 3: Decompose Functional Dependencies - All functional dependencies in F = {A -> B, A -> C, B -> C} have single attributes on the right-hand side. Thus, no decomposition is needed."
                    },
                    {
                        "type": "paragraph",
                        "text": "Step 4: Check for Redundant Dependencies - Check A -> C: For example, A -> C can be reached with A -> B and B -> C. Therefore, A -> C is redundant and can be removed. Now F = {A -> B, B -> C}."
                    },
                    {
                        "type": "paragraph",
                        "text": "Step 5: The final canonical cover is Fc = {A -> B, B -> C}. This is the simplified set of functional dependencies that has the same closure as the original set F."
                    },
                    {
                        "type": "heading",
                        "text": "Example 2"
                    },
                    {
                        "type": "paragraph",
                        "text": "Given F = {A -> BC, B -> C, A -> B, AB -> C}"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Step 1 Reduction: There are two functional dependencies with the same attributes on the left: A -> BC, A -> B are already in their simplest form.",
                            "Step 2 Elimination: In A -> BC, C is extraneous because A -> C can be derived from A -> B and B -> C. Thus, we reduce it to A -> B.",
                            "Step 3 Minimization: No redundant dependencies remain. Hence, the canonical cover is Fc = {A -> B, B -> C}"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Example 3"
                    },
                    {
                        "type": "paragraph",
                        "text": "Given F = {A -> BC, CD -> E, B -> D, E -> A}"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Step 1 Reduction: Each left-hand side of the functional dependencies is unique and cannot be combined further.",
                            "Step 2 Elimination: None of the attributes on the left or right sides of any functional dependency are extraneous.",
                            "Step 3 Minimization: No dependencies are redundant. Hence, the canonical cover is F = {A -> BC, CD -> E, B -> D, E -> A}."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "How to Check Whether a Set of FDs F Canonically Covers Another Set of FDs G?"
                    },
                    {
                        "type": "paragraph",
                        "text": "To verify whether a set of functional dependencies (F) canonically covers another set of functional dependencies (G), follow these steps:"
                    },
                    {
                        "type": "heading",
                        "text": "Step 1: Compute the Closure of Each Set"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Compute the closure of F: Use the attributes and dependencies in F to determine all the attribute sets that can be functionally determined.",
                            "Compute the closure of G: Similarly, calculate the attribute closures using the dependencies in G."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Step 2: Compare the Closures"
                    },
                    {
                        "type": "paragraph",
                        "text": "For F to canonically cover G, the following conditions must hold:"
                    },
                    {
                        "type": "numbered_list",
                        "items": [
                            "The closure of F must be equivalent to the closure of G.",
                            "That is, for every functional dependency in G, it must be derivable from F and vice versa."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Step 3: Derive Dependencies in G from F"
                    },
                    {
                        "type": "paragraph",
                        "text": "For each functional dependency in G (e.g., X -> Y):"
                    },
                    {
                        "type": "numbered_list",
                        "items": [
                            "Compute X+ (closure of X) under F.",
                            "Verify that Y ⊆ X+.",
                            "If this is true for all functional dependencies in G, F covers G."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Step 4: Derive Dependencies in F from G"
                    },
                    {
                        "type": "paragraph",
                        "text": "To ensure F and G are equivalent, for each dependency in F (e.g., X -> Y):"
                    },
                    {
                        "type": "numbered_list",
                        "items": [
                            "Compute X+ (closure of X) under G.",
                            "Check that Y ⊆ X+. If all dependencies in F can be derived from G, the two sets are equivalent."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Step 5: Verify Minimality (Optional)"
                    },
                    {
                        "type": "paragraph",
                        "text": "If F is already minimal (e.g., no extraneous attributes or redundant dependencies) and it satisfies the above steps, then F is a canonical cover of G."
                    },
                    {
                        "type": "heading",
                        "text": "Example: Verification"
                    },
                    {
                        "type": "paragraph",
                        "text": "Let F = {A -> B, B -> C} and G = {A -> BC}."
                    },
                    {
                        "type": "list",
                        "items": [
                            "Compute Closure of F: A+ = {A, B, C} (using A -> B and B -> C).",
                            "Compute Closure of G: A+ = {A, B, C} (using A -> BC).",
                            "Compare F with G: (1) G can be derived from F: A -> BC is equivalent to A -> B and B -> C. (2) F can be derived from G: A -> B and B -> C are derivable from A -> BC."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Since F and G have the same closure and F is minimal, F canonically covers G."
                    },
                    {
                        "type": "heading",
                        "text": "Features of the Canonical Cover"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Minimal: The canonical cover is the smallest set of dependencies that can be derived from a given set of dependencies, i.e., it has the minimum number of dependencies required to represent the same set of constraints.",
                            "Lossless: The canonical cover preserves all the functional dependencies of the original set of dependencies, i.e., it does not lose any information.",
                            "Deterministic: The canonical cover is deterministic, i.e., it does not contain any redundant or extraneous dependencies.",
                            "Reduces Data Redundancy: The canonical cover helps to reduce data redundancy by eliminating unnecessary dependencies that can be inferred from other dependencies.",
                            "Improves Query Performance: The canonical cover helps to improve query performance by reducing the number of joins and redundant data in the database.",
                            "Facilitates Database Maintenance: The canonical cover makes it easier to modify, update and delete data in the database by reducing the number of dependencies that need to be considered."
                        ]
                    }
                ]
            },
            {
                "name": "Normal Forms in DBMS",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "Normal forms are a set of progressive rules (or design checkpoints) for relational schemas that reduce redundancy and prevent data anomalies. Each normal form - 1NF, 2NF, 3NF, BCNF, 4NF, 5NF - is stricter than the previous one: meeting a higher normal form implies the lower ones are satisfied. Think of them as layers of cleanliness for your tables: the deeper you go, the fewer redundancy and integrity problems you'll have."
                    },
                    {
                        "type": "heading",
                        "text": "Benefits of using Normal Forms"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Reduce duplicate data and wasted storage.",
                            "Prevent insert, update, and delete anomalies.",
                            "Improve data consistency and integrity.",
                            "Make the schema easier to maintain and evolve."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "The hierarchy of database normal forms shows each inner circle representing a stricter level of normalization, starting from 1NF (basic structure) to 5NF (most refined). As you move inward, data redundancy reduces and data integrity improves. Each level builds upon the previous one to ensure a cleaner and more efficient database design."
                    },
                    {
                        "type": "heading",
                        "text": "1. First Normal Form (1NF): Eliminating Duplicate Records"
                    },
                    {
                        "type": "paragraph",
                        "text": "A table is in 1NF if it satisfies the following conditions:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "All columns contain atomic values (i.e., indivisible values).",
                            "Each row is unique (i.e., no duplicate rows).",
                            "Each column has a unique name.",
                            "The order in which data is stored does not matter."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Example of 1NF Violation: If a table has a column 'Phone Numbers' that stores multiple phone numbers in a single cell, it violates 1NF. To bring it into 1NF, you need to separate phone numbers into individual rows."
                    },
                    {
                        "type": "heading",
                        "text": "2. Second Normal Form (2NF): Eliminating Partial Dependency"
                    },
                    {
                        "type": "paragraph",
                        "text": "A relation is in 2NF if it satisfies the conditions of 1NF and additionally, no partial dependency exists, meaning every non-prime attribute (non-key attribute) must depend on the entire primary key, not just a part of it."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: For a composite key (StudentID, CourseID), if the 'StudentName' depends only on 'StudentID' and not on the entire key, it violates 2NF. To normalize, move StudentName into a separate table where it depends only on 'StudentID'."
                    },
                    {
                        "type": "heading",
                        "text": "3. Third Normal Form (3NF): Eliminating Transitive Dependency"
                    },
                    {
                        "type": "paragraph",
                        "text": "A relation is in 3NF if it satisfies 2NF and additionally, there are no transitive dependencies. In simpler terms, non-prime attributes should not depend on other non-prime attributes."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: Consider a table with (StudentID, CourseID, Instructor). If Instructor depends on 'CourseID', and 'CourseID' depends on 'StudentID', then Instructor indirectly depends on 'StudentID', which violates 3NF. To resolve this, place Instructor in a separate table linked by 'CourseID'."
                    },
                    {
                        "type": "heading",
                        "text": "4. Boyce-Codd Normal Form (BCNF): The Strongest Form of 3NF"
                    },
                    {
                        "type": "paragraph",
                        "text": "BCNF is a stricter version of 3NF where for every non-trivial functional dependency (X → Y), X must be a superkey (a unique identifier for a record in the table)."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: If a table has a dependency (StudentID, CourseID) → Instructor, but neither 'StudentID' nor 'CourseID' is a superkey, then it violates BCNF. To bring it into BCNF, decompose the table so that each determinant is a candidate key."
                    },
                    {
                        "type": "heading",
                        "text": "5. Fourth Normal Form (4NF): Removing Multi-Valued Dependencies"
                    },
                    {
                        "type": "paragraph",
                        "text": "A table is in 4NF if it is in BCNF and has no multi-valued dependencies. A multi-valued dependency occurs when one attribute determines another, and both attributes are independent of all other attributes in the table."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: Consider a table where (StudentID, Language, Hobby) are attributes. If a student can have multiple hobbies and languages, a multi-valued dependency exists. To resolve this, split the table into separate tables for Languages and Hobbies."
                    },
                    {
                        "type": "heading",
                        "text": "6. Fifth Normal Form (5NF): Eliminating Join Dependency"
                    },
                    {
                        "type": "paragraph",
                        "text": "5NF is achieved when a table is in 4NF and all join dependencies are removed. This form ensures that every table is fully decomposed into smaller tables that are logically connected without losing information."
                    },
                    {
                        "type": "paragraph",
                        "text": "Example: If a table contains (StudentID, Course, Instructor) and there is a dependency where all combinations of these columns are needed for a specific relationship, you would split them into smaller tables to remove redundancy."
                    },
                    {
                        "type": "heading",
                        "text": "Common Challenges of Over-Normalization"
                    },
                    {
                        "type": "paragraph",
                        "text": "While normalization is a powerful tool for optimizing databases, it's important not to over-normalize your data. Excessive normalization can lead to:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Complex Queries: Too many tables may result in multiple joins, making queries slow and difficult to manage.",
                            "Performance Overhead: Additional processing required for joins in overly normalized databases may hurt performance, especially in large-scale systems."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "In many cases, denormalization (combining tables to reduce the need for complex joins) is used for performance optimization in specific applications, such as reporting systems."
                    },
                    {
                        "type": "heading",
                        "text": "When to Use Normalization and Denormalization"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Normalization is best suited for transactional systems where data integrity is paramount, such as banking systems and enterprise applications.",
                            "Denormalization is ideal for read-heavy applications like data warehousing and reporting systems where performance and query speed are more critical than data integrity."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Applications of Normal Forms in DBMS"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Ensures Data Consistency: Prevents data anomalies by ensuring each piece of data is stored in one place, reducing inconsistencies.",
                            "Reduces Data Redundancy: Minimizes repetitive data, saving storage space and avoiding errors in data updates or deletions.",
                            "Improves Query Performance: Simplifies queries by breaking large tables into smaller, more manageable ones, leading to faster data retrieval.",
                            "Enhances Data Integrity: Ensures that data is accurate and reliable by adhering to defined relationships and constraints between tables.",
                            "Easier Database Maintenance: Simplifies updates, deletions, and modifications by ensuring that changes only need to be made in one place, reducing the risk of errors.",
                            "Facilitates Scalability: Makes it easier to modify, expand, or scale the database structure as business requirements grow.",
                            "Supports Better Data Modeling: Helps in designing databases that are logically structured, with clear relationships between tables, making it easier to understand and manage.",
                            "Reduces Update Anomalies: Prevents issues like insertion, deletion, or modification anomalies that can arise from redundant data.",
                            "Improves Data Integrity and Security: By reducing unnecessary data duplication, normal forms help ensure sensitive information is securely and correctly maintained.",
                            "Optimizes Storage Efficiency: By organizing data into smaller tables, storage is used more efficiently, reducing the overhead for large databases."
                        ]
                    }
                ]
            },
            {
                "name": "The Problem of Redundancy in Database",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "Redundancy means having multiple copies of the same data in the database. This problem arises when a database is not normalized. Suppose a table of student details attributes is: student ID, student name, college name, college rank, and course opted."
                    },
                    {
                        "type": "table",
                        "headers": ["Student_ID", "Name", "Contact", "College", "Course", "Rank"],
                        "rows": [
                            ["100", "Himanshu", "7300934851", "GEU", "B. Tech", "1"],
                            ["101", "Ankit", "7900734858", "GEU", "B. Tech", "1"],
                            ["102", "Ayush", "7300936759", "GEU", "B. Tech", "1"],
                            ["103", "Ravi", "7300901556", "GEU", "B. Tech", "1"]
                        ],
                        "caption": "Student Details Table with Redundancy"
                    },
                    {
                        "type": "heading",
                        "text": "Anomalies"
                    },
                    {
                        "type": "paragraph",
                        "text": "It can be observed that values of attribute college name, college rank, and course are being repeated which can lead to problems. Major problems caused due to redundancy are called anomalies. The following types of anomalies are caused due to redundancy:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Insertion anomaly",
                            "Deletion anomaly",
                            "Updation anomaly"
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "1. Insertion Anomaly"
                    },
                    {
                        "type": "paragraph",
                        "text": "In Insertion anomaly, if a student detail has to be inserted whose course is not being decided yet then insertion will not be possible till the time course is decided for the student."
                    },
                    {
                        "type": "table",
                        "headers": ["Student_ID", "Name", "Contact", "College", "Course", "Rank"],
                        "rows": [
                            ["100", "Himanshu", "7300934851", "GEU", "", "1"]
                        ],
                        "caption": "Example of Insertion Anomaly"
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: This problem happens when the insertion of a data record is not possible without adding some additional unrelated data to the record."
                    },
                    {
                        "type": "heading",
                        "text": "2. Deletion Anomaly"
                    },
                    {
                        "type": "paragraph",
                        "text": "In Deletion anomaly, if the details of students in this table are deleted then the details of the college will also get deleted which should not occur by common sense. This anomaly happens when the deletion of a data record results in losing some unrelated information that was stored as part of the record that was deleted from a table."
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: It is not possible to delete some information without losing some other information in the table as well."
                    },
                    {
                        "type": "heading",
                        "text": "3. Updation Anomaly"
                    },
                    {
                        "type": "paragraph",
                        "text": "In Updation anomaly, suppose the rank of the college changes then changes will have to be all over the database which will be time-consuming and computationally costly. All places should be updated. If updation does not occur at all places then the database will be in an inconsistent state."
                    },
                    {
                        "type": "table",
                        "headers": ["Student_ID", "Name", "Contact", "College", "Course", "Rank"],
                        "rows": [
                            ["100", "Himanshu", "7300934851", "GEU", "B. Tech", "1"],
                            ["101", "Ankit", "7900734858", "GEU", "B. Tech", "1"],
                            ["102", "Ayush", "7300936759", "GEU", "B. Tech", "1"],
                            ["103", "Ravi", "7300901556", "GEU", "B. Tech", "1"]
                        ],
                        "caption": "Example showing need for multiple updates"
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: Redundancy in a database occurs when the same data is stored in multiple places. Redundancy can cause various problems such as data inconsistencies, higher storage requirements, and slower data retrieval."
                    },
                    {
                        "type": "heading",
                        "text": "Problems Caused Due to Redundancy"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Data Inconsistency and Integrity Issues: Multiple copies of the same data can become inconsistent if all are not updated simultaneously, leading to inaccurate or unreliable information.",
                            "Increased Storage Requirements: Redundant data consumes extra storage space, increasing storage costs and reducing system efficiency.",
                            "Update Anomalies and Performance Problems: Any change to redundant data must be made in multiple places, slowing down operations and increasing the chance of update errors.",
                            "Maintenance Complexity: Managing, updating, and synchronizing multiple data copies makes maintenance more time-consuming and error-prone.",
                            "Security and Privacy Risks: More copies of the same data create more points of vulnerability, increasing the risk of unauthorized access or data breaches.",
                            "Data Duplication and Wastage: Repeated storage of identical data leads to unnecessary duplication, wasting both space and administrative effort.",
                            "Usability and Accessibility Issues: Users may face confusion in identifying the correct or latest version of data, reducing productivity and trust in the system."
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: To prevent redundancy in a database, Normalization is used, which is the process of organizing data in a database to eliminate redundancy and improve data integrity."
                    }
                ]
            },
            {
                "name": "Lossless Join and Dependency Preserving Decomposition",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "Decomposition of a relation is done when a relation in a relational model is not in appropriate normal form. Relation R is decomposed into two or more relations if decomposition is lossless join as well as dependency preserving."
                    },
                    {
                        "type": "heading",
                        "text": "Lossless Join Decomposition"
                    },
                    {
                        "type": "paragraph",
                        "text": "If we decompose a relation R into relations R1 and R2:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Decomposition is lossy if R1 ⋈ R2 ⊃ R",
                            "Decomposition is lossless if R1 ⋈ R2 = R"
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "To check for lossless join decomposition using the FD set, the following conditions must hold:"
                    },
                    {
                        "type": "heading",
                        "text": "1. The Union of Attributes of R1 and R2 must be equal to the attribute of R"
                    },
                    {
                        "type": "paragraph",
                        "text": "Each attribute of R must be either in R1 or in R2."
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "Att(R1) U Att(R2) = Att(R)"
                    },
                    {
                        "type": "heading",
                        "text": "2. The intersection of Attributes of R1 and R2 must not be NULL"
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "Att(R1) ∩ Att(R2) ≠ Φ"
                    },
                    {
                        "type": "heading",
                        "text": "3. The common attribute must be a key for at least one relation (R1 or R2)"
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "Att(R1) ∩ Att(R2) -> Att(R1) or Att(R1) ∩ Att(R2) -> Att(R2)"
                    },
                    {
                        "type": "paragraph",
                        "text": "For Example, a relation R (A, B, C, D) with FD set {A->BC} is decomposed into R1(ABC) and R2(AD) which is a lossless join decomposition as:"
                    },
                    {
                        "type": "list",
                        "items": [
                            "First condition holds true as Att(R1) U Att(R2) = (ABC) U (AD) = (ABCD) = Att(R).",
                            "Second condition holds true as Att(R1) ∩ Att(R2) = (ABC) ∩ (AD) ≠ Φ",
                            "The third condition holds as Att(R1) ∩ Att(R2) = A is a key of R1(ABC) because A->BC is given."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Dependency Preserving Decomposition"
                    },
                    {
                        "type": "paragraph",
                        "text": "If we decompose a relation R into relations R1 and R2, all dependencies of R either must be a part of R1 or R2 or must be derivable from a combination of functional dependency of R1 and R2."
                    },
                    {
                        "type": "paragraph",
                        "text": "For Example, a relation R (A, B, C, D) with FD set {A->BC} is decomposed into R1(ABC) and R2(AD) which is dependency preserving because FD A->BC is a part of R1(ABC)."
                    },
                    {
                        "type": "heading",
                        "text": "Advantages of Lossless Join and Dependency Preserving Decomposition"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Improved Data Integrity: Lossless join and dependency preserving decomposition help to maintain the data integrity of the original relation by ensuring that all dependencies are preserved.",
                            "Reduced Data Redundancy: These techniques help to reduce data redundancy by breaking down a relation into smaller, more manageable relations.",
                            "Improved Query Performance: By breaking down a relation into smaller, more focused relations, query performance can be improved.",
                            "Easier Maintenance and Updates: The smaller, more focused relations are easier to maintain and update than the original relation, making it easier to modify the database schema and update the data.",
                            "Better Flexibility: Lossless join and dependency preserving decomposition can improve the flexibility of the database system by allowing for easier modification of the schema."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Disadvantages of Lossless Join and Dependency Preserving Decomposition"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Increased Complexity: Lossless join and dependency-preserving decomposition can increase the complexity of the database system, making it harder to understand and manage.",
                            "Costly: Decomposing relations can be costly, especially if the database is large and complex. This can require additional resources, such as hardware and personnel.",
                            "Reduced Performance: Although query performance can be improved in some cases, in others, lossless join and dependency-preserving decomposition can result in reduced query performance due to the need for additional join operations.",
                            "Limited Scalability: These techniques may not scale well in larger databases, as the number of smaller, focused relations can become unwieldy."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "GATE Question"
                    },
                    {
                        "type": "paragraph",
                        "text": "Consider a schema R(A, B, C, D) and functional dependencies A->B and C->D. Then the decomposition of R into R1(AB) and R2(CD) is [GATE-CS-2001]"
                    },
                    {
                        "type": "list",
                        "items": [
                            "(A) dependency preserving and lossless join",
                            "(B) lossless join but not dependency preserving",
                            "(C) dependency preserving but not lossless join",
                            "(D) not dependency preserving and not lossless join"
                        ]
                    },
                    {
                        "type": "paragraph",
                        "text": "Answer:"
                    },
                    {
                        "type": "paragraph",
                        "text": "For lossless join decomposition, these three conditions must hold:"
                    },
                    {
                        "type": "code",
                        "language": "text",
                        "code": "Att(R1) U Att(R2) = ABCD = Att(R)\nAtt(R1) ∩ Att(R2) = Φ, which violates the condition of lossless join decomposition.\nHence the decomposition is not lossless."
                    },
                    {
                        "type": "paragraph",
                        "text": "For dependency preserving decomposition, A->B can be ensured in R1(AB) and C->D can be ensured in R2(CD). Hence it is dependency preserving decomposition. So, the correct option is C."
                    }
                ]
            },
            {
                "name": "Denormalization in Databases",
                "content": [
                    {
                        "type": "paragraph",
                        "text": "Denormalization is a database optimization technique where redundant data is intentionally added to one or more tables to reduce the need for complex joins and improve query performance. It is not the opposite of normalization, but rather an optimization applied after normalization."
                    },
                    {
                        "type": "paragraph",
                        "text": "In a normalized database, data is stored in separate tables to minimize redundancy. For example, storing teacher details in a Teachers table and course details in a Courses table, linked by teacherID. While this maintains data integrity, frequent joins between large tables can slow performance."
                    },
                    {
                        "type": "paragraph",
                        "text": "Note: Denormalization strikes a balance by allowing some redundancy to achieve faster data retrieval and better performance, at the cost of slightly more maintenance effort when updating data."
                    },
                    {
                        "type": "heading",
                        "text": "Step 1: Unnormalized Table"
                    },
                    {
                        "type": "paragraph",
                        "text": "This is the starting point where all the data is stored in a single table."
                    },
                    {
                        "type": "paragraph",
                        "text": "What's wrong with it?"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Redundancy: For example, 'Alice' and 'Math' are repeated multiple times. Similarly, 'Mr. Smith' is stored twice for the same class.",
                            "Update Anomalies: If 'Mr. Smith' changes to 'Mr. Brown,' we have to update multiple rows. Missing one row could lead to inconsistencies.",
                            "Inefficient Storage: Repeated information takes up unnecessary space."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Step 2: Normalized Structure"
                    },
                    {
                        "type": "paragraph",
                        "text": "To eliminate redundancy and avoid anomalies, we split the data into smaller, related tables. This process is called normalization. Each table now focuses on a specific aspect, such as students, classes or subjects."
                    },
                    {
                        "type": "paragraph",
                        "text": "Why is this better?"
                    },
                    {
                        "type": "list",
                        "items": [
                            "No Redundancy: 'Mr. Smith' appears only once in the Classes Table, even if multiple subjects are associated with the class.",
                            "Easier Updates: If 'Mr. Smith' changes to 'Mr. Brown,' you only update the Classes Table and it automatically reflects everywhere.",
                            "Efficient Storage: Repeated data is eliminated, saving space."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Step 3: Denormalized Table"
                    },
                    {
                        "type": "paragraph",
                        "text": "In some cases, normalization can make querying complex and slow because you need to join multiple tables to get the required information. To optimize performance, we can denormalize the data by combining related tables into a single table."
                    },
                    {
                        "type": "paragraph",
                        "text": "What's happening here?"
                    },
                    {
                        "type": "list",
                        "items": [
                            "All related information (student name, class name, teacher and subject) is stored in a single table.",
                            "This simplifies querying because you don't need to join multiple tables."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Denormalization v/s Normalization"
                    },
                    {
                        "type": "paragraph",
                        "text": "Normalization and Denormalization both are the method which use in database but it works opposite to each other. One side normalization is used for reduce or removing the redundancy which means there will be no duplicate data or entries in the same table and also optimizes for data integrity and efficient storage."
                    },
                    {
                        "type": "paragraph",
                        "text": "While, Denormalization is used for add the redundancy into normalized table so that enhance the functionality and minimize the running time of database queries (like joins operation) and optimizes for performance and query simplicity. In a system that demands scalability, like that of any major tech company, we almost always use elements of both normalized and denormalized databases."
                    },
                    {
                        "type": "heading",
                        "text": "Advantages of Denormalization"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Improved Query Performance: Denormalization can improve query performance by reducing the number of joins required to retrieve data.",
                            "Reduced Complexity: By combining related data into fewer tables, denormalization can simplify the database schema and make it easier to manage.",
                            "Easier Maintenance and Updates: Denormalization can make it easier to update and maintain the database by reducing the number of tables.",
                            "Improved Read Performance: Denormalization can improve read performance by making it easier to access data.",
                            "Better Scalability: Denormalization can improve the scalability of a database system by reducing the number of tables and improving the overall performance."
                        ]
                    },
                    {
                        "type": "heading",
                        "text": "Disadvantages of Denormalization"
                    },
                    {
                        "type": "list",
                        "items": [
                            "Reduced Data Integrity: By adding redundant data, denormalization can reduce data integrity and increase the risk of inconsistencies.",
                            "Increased Complexity: While denormalization can simplify the database schema in some cases, it can also increase complexity by introducing redundant data.",
                            "Increased Storage Requirements: By adding redundant data, denormalization can increase storage requirements and increase the cost of maintaining the database.",
                            "Increased Update and Maintenance Complexity: Denormalization can increase the complexity of updating and maintaining the database by introducing redundant data.",
                            "Limited Flexibility: Denormalization can reduce the flexibility of a database system by introducing redundant data and making it harder to modify the schema."
                        ]
                    }
                ]
            },
            {
                "name": "ACID Properties"
            },
            {
                "name": "Types of Schedules"
            },
            {
                "name": "Concurrency Control"
            },
            {
                "name": "Graph Based Concurrency Control"
            },
            {
                "name": "Multiple Granularity Locking"
            },
            {
                "name": "Database Recovery Techniques"
            },
            {
                "name": "Deadlock in DBMS"
            },
            {
                "name": "Advanced DBMS"
            },
            {
                "name": "Indexing in Databases"
            },
            {
                "name": "B Tree"
            },
            {
                "name": "B+ Tree"
            },
            {
                "name": "Bitmap Indexing"
            },
            {
                "name": "Inverted Index"
            },
            {
                "name": "Clustered & Non-Clustered Indexes"
            },
            {
                "name": "File Organization in DBMS"
            },
            {
                "name": "Practice Questions"
            },
            {
                "name": "Last Minute Notes"
            },
            {
                "name": "DBMS Interview Questions (Set 1)"
            },
            {
                "name": "DBMS Interview Questions (Set 2)"
            },
            {
                "name": "GATE Previous Year Questions"
            }
        ];

        // ========================================
        // STEP 4: CLEAR EXISTING DATA
        // ========================================
        // Delete all existing topics for this subject
        // This ensures a fresh start and prevents duplicates
        console.log('\n🗑️  Clearing existing data...');
        const deletedTopics = await Topic.deleteMany({ subjectId: subject._id });
        console.log(`   Deleted ${deletedTopics.deletedCount} existing topics`);

        // Delete ALL full topic data
        // CAUTION: This clears content for ALL subjects, not just DBMS
        // In production, should filter by topic IDs to only delete DBMS content
        const deletedContent = await FullTopicData.deleteMany({});
        console.log(`   Deleted ${deletedContent.deletedCount} existing content entries`);

        console.log('✅ Cleared existing topics and content for DBMS');

        // ========================================
        // STEP 5: INSERT TOPICS AND CONTENT
        // ========================================
        console.log(`\n📝 Inserting ${topicsData.length} topics...`);
        console.log('='.repeat(60));

        // Counter for tracking how many topics were inserted
        let insertedCount = 0;
        let contentCount = 0;
        const totalTopics = topicsData.length;

        // Loop through each topic in the topicsData array
        for (const tData of topicsData) {
            // Show progress for current topic
            showProgress(insertedCount + 1, totalTopics, tData.name);

            // ----------------------------------------
            // 5a. Create Topic (Lightweight Entry)
            // ----------------------------------------
            // Create new topic document with name and subject reference
            // This goes into 'topics' collection
            const newTopic = new Topic({
                name: tData.name,           // Topic name from data
                subjectId: subject._id      // Link to DBMS subject
            });

            // Save topic to database and get saved document with _id
            // We need the _id to link full content to this topic
            const savedTopic = await newTopic.save();
            console.log(`   ✓ Created topic in database`);

            // ----------------------------------------
            // 5b. Create Full Content (If Exists)
            // ----------------------------------------
            // Only create full content entry if topic has content property
            if (tData.content) {
                // Create full content document
                // This goes into 'full_data_of_topics' collection
                const fullData = new FullTopicData({
                    topicId: savedTopic._id,    // Link to topic we just created
                    title: tData.name,           // Duplicate name for convenience
                    content: tData.content,      // Array of content blocks
                    lastUpdated: tData.lastUpdated || new Date().toISOString(),
                    createdAt: new Date()        // Timestamp of creation
                });

                // Save full content to database
                await fullData.save();
                console.log(`   ✓ Created full content (${tData.content.length} blocks)`);
                contentCount++;
            } else {
                console.log(`   ⊘ No content for this topic`);
            }
            // Note: If topic has no content, only the lightweight topic entry is created

            // Increment counter
            insertedCount++;
        }

        // ========================================
        // FINAL SUMMARY
        // ========================================
        console.log('\n' + '='.repeat(60));
        console.log('\n✅ SEEDING COMPLETED SUCCESSFULLY!');
        console.log(`\n📊 Summary:`);
        console.log(`   • Total topics inserted: ${insertedCount}`);
        console.log(`   • Topics with full content: ${contentCount}`);
        console.log(`   • Topics without content: ${insertedCount - contentCount}`);
        console.log(`   • Subject: DBMS`);
        console.log('\n' + '='.repeat(60));

    } catch (error) {
        // ========================================
        // ERROR HANDLING
        // ========================================
        // Log any errors that occur during seeding
        // Common errors:
        // - Database connection failed
        // - Duplicate key error (if unique constraint violated)
        // - Validation error (if required fields missing)
        console.error('\n❌ ERROR SEEDING DATABASE:');
        console.error(error);
    } finally {
        // ========================================
        // CLEANUP
        // ========================================
        // Always disconnect from database, whether seeding succeeded or failed
        // This prevents hanging connections
        console.log('\n🔌 Disconnecting from database...');
        mongoose.disconnect();
        console.log('✅ Disconnected\n');
    }
};

// ============================================================================
// EXECUTE SEEDING
// ============================================================================
// Call the seeding function immediately when script is run
// This is an IIFE (Immediately Invoked Function Expression) pattern
seedDBMS();
