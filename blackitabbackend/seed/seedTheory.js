/**
 * Seed script for Theory page data (subjects, topics, full topic content).
 *
 * Usage:
 *   node seed/seedTheory.js
 *   node seed/seedTheory.js --reset
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const connectDB = require('../config/database');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const FullTopicData = require('../models/FullTopicData');

const shouldReset = process.argv.includes('--reset');

const LAST_UPDATED = '2026-03-19';

const buildTopic = ({
  name,
  summary,
  keyPoints = [],
  steps = [],
  table = null,
  code = '',
  language = 'text',
  interviewTip = ''
}) => {
  const content = [
    { type: 'heading', text: name },
    { type: 'paragraph', text: summary }
  ];

  if (keyPoints.length > 0) {
    content.push({
      type: 'list',
      title: 'Key points',
      items: keyPoints
    });
  }

  if (steps.length > 0) {
    content.push({
      type: 'numbered_list',
      items: steps
    });
  }

  if (table && Array.isArray(table.headers) && Array.isArray(table.rows)) {
    content.push({
      type: 'table',
      headers: table.headers,
      rows: table.rows,
      caption: table.caption || ''
    });
  }

  if (code && code.trim()) {
    content.push({
      type: 'code',
      language,
      code
    });
  }

  if (interviewTip) {
    content.push({
      type: 'paragraph',
      text: `Interview focus: ${interviewTip}`
    });
  }

  return {
    name,
    lastUpdated: LAST_UPDATED,
    content
  };
};

const THEORY_SEED = [
  {
    name: 'DBMS',
    description: 'Learn relational databases, schema design, transactions, and performance tuning.',
    topics: [
      buildTopic({
        name: 'Introduction to DBMS',
        summary: 'A Database Management System stores and organizes data so multiple users and applications can safely read and write information.',
        keyPoints: [
          'Centralized and structured storage',
          'Constraint-driven data integrity',
          'Concurrency and recovery support',
          'Security and access control'
        ],
        table: {
          headers: ['Approach', 'Strength', 'Limitation'],
          rows: [
            ['File System', 'Simple and direct', 'Redundancy and weak consistency'],
            ['DBMS', 'Reliable multi-user access', 'Requires schema and query design']
          ],
          caption: 'File systems vs DBMS systems'
        },
        interviewTip: 'Explain two practical issues solved by DBMS compared to plain files.'
      }),
      buildTopic({
        name: 'ER Model and Relationships',
        summary: 'The ER model captures entities, attributes, and relationships before implementation in relational tables.',
        keyPoints: [
          'Entities represent objects like Student and Course',
          'Attributes define properties such as name or email',
          'Relationships show how entities are connected',
          'Cardinality defines one-to-one, one-to-many, or many-to-many'
        ],
        table: {
          headers: ['Relationship', 'Example'],
          rows: [
            ['1:1', 'User and unique profile'],
            ['1:N', 'Teacher and many classes'],
            ['M:N', 'Students and courses via enrollment table']
          ]
        }
      }),
      buildTopic({
        name: 'Keys and Constraints',
        summary: 'Keys and constraints enforce correctness and prevent invalid records from entering your database.',
        keyPoints: [
          'Primary key uniquely identifies each row',
          'Foreign key preserves referential integrity',
          'Unique, Not Null, and Check constraints validate fields',
          'Composite keys combine multiple columns for uniqueness'
        ],
        interviewTip: 'Give one example where missing foreign key checks caused a production issue.'
      }),
      buildTopic({
        name: 'Normalization Basics',
        summary: 'Normalization organizes tables to reduce duplication and avoid insertion, update, and deletion anomalies.',
        steps: [
          'Apply 1NF by removing repeating groups',
          'Apply 2NF by removing partial dependency',
          'Apply 3NF by removing transitive dependency'
        ],
        table: {
          headers: ['Normal Form', 'Goal', 'Typical Fix'],
          rows: [
            ['1NF', 'Atomic values only', 'Split repeating columns'],
            ['2NF', 'No partial key dependency', 'Separate dependent attributes'],
            ['3NF', 'No transitive dependency', 'Move derived data to new table']
          ]
        }
      }),
      buildTopic({
        name: 'Transactions and ACID',
        summary: 'Transactions ensure that groups of operations execute safely and maintain database consistency.',
        keyPoints: [
          'Atomicity: all operations succeed or all fail',
          'Consistency: data remains valid',
          'Isolation: concurrent transactions do not corrupt each other',
          'Durability: committed data survives crashes'
        ],
        code: 'BEGIN;\nUPDATE accounts SET balance = balance - 500 WHERE id = 1;\nUPDATE accounts SET balance = balance + 500 WHERE id = 2;\nCOMMIT;',
        language: 'sql'
      }),
      buildTopic({
        name: 'Indexing and Query Performance',
        summary: 'Indexes reduce lookup time by helping the database avoid full table scans for common query patterns.',
        keyPoints: [
          'Index columns used in WHERE, JOIN, and ORDER BY',
          'Use composite indexes in left-to-right query order',
          'Measure with EXPLAIN plans before and after changes',
          'Avoid too many indexes on write-heavy tables'
        ],
        code: 'CREATE INDEX idx_orders_customer_created ON orders(customer_id, created_at);\nEXPLAIN SELECT * FROM orders WHERE customer_id = 42 ORDER BY created_at DESC;',
        language: 'sql'
      })
    ]
  },
  {
    name: 'Operating Systems',
    description: 'Understand scheduling, synchronization, memory, and core OS behavior.',
    topics: [
      buildTopic({
        name: 'Process vs Thread',
        summary: 'Processes isolate resources, while threads are lightweight execution units inside the same process.',
        table: {
          headers: ['Aspect', 'Process', 'Thread'],
          rows: [
            ['Address space', 'Separate', 'Shared within process'],
            ['Context switch cost', 'Higher', 'Lower'],
            ['Failure impact', 'Mostly isolated', 'Can affect whole process']
          ]
        }
      }),
      buildTopic({
        name: 'CPU Scheduling',
        summary: 'The scheduler chooses which ready process runs next to maximize responsiveness and throughput.',
        keyPoints: [
          'FCFS is simple but can increase waiting time',
          'SJF can reduce average waiting but needs burst estimates',
          'Round Robin balances fairness for interactive systems',
          'Priority scheduling can cause starvation without aging'
        ]
      }),
      buildTopic({
        name: 'Deadlocks',
        summary: 'Deadlock happens when processes wait forever for resources held by each other in a cycle.',
        steps: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Circular Wait'],
        interviewTip: 'Memorize the four necessary conditions and one prevention strategy.'
      }),
      buildTopic({
        name: 'Memory Management and Paging',
        summary: 'Paging splits memory into fixed-size pages and frames, enabling virtual memory and flexible allocation.',
        keyPoints: [
          'Logical memory is mapped to physical frames',
          'Page tables translate virtual to physical addresses',
          'TLB caches translations for speed',
          'Page faults trigger OS page replacement'
        ],
        table: {
          headers: ['Term', 'Meaning'],
          rows: [
            ['Page', 'Fixed-size block in virtual memory'],
            ['Frame', 'Fixed-size block in physical memory'],
            ['Page fault', 'Page not present in RAM']
          ]
        }
      }),
      buildTopic({
        name: 'Synchronization and Semaphores',
        summary: 'Synchronization primitives coordinate concurrent threads and prevent race conditions in shared state.',
        keyPoints: [
          'Mutex allows one thread in critical section',
          'Counting semaphore controls access to N resources',
          'Busy waiting wastes CPU cycles',
          'Incorrect lock ordering may cause deadlock'
        ],
        code: 'wait(mutex);\n// critical section\nsignal(mutex);',
        language: 'text'
      })
    ]
  },
  {
    name: 'Computer Networks',
    description: 'Cover network models, transport behavior, and real-world request flow.',
    topics: [
      buildTopic({
        name: 'OSI vs TCP/IP Models',
        summary: 'Layered models separate communication concerns and improve modular protocol design.',
        table: {
          headers: ['OSI Layer', 'TCP/IP Mapping', 'Examples'],
          rows: [
            ['Application/Presentation/Session', 'Application', 'HTTP, DNS, TLS'],
            ['Transport', 'Transport', 'TCP, UDP'],
            ['Network', 'Internet', 'IP, ICMP'],
            ['Data Link/Physical', 'Link', 'Ethernet, Wi-Fi']
          ]
        }
      }),
      buildTopic({
        name: 'TCP Three-Way Handshake',
        summary: 'TCP handshake synchronizes sequence numbers and confirms two-way reachability before data transfer.',
        steps: [
          'Client sends SYN',
          'Server responds SYN-ACK',
          'Client sends ACK to finalize'
        ]
      }),
      buildTopic({
        name: 'HTTP Request Lifecycle',
        summary: 'A web request involves DNS, transport connection setup, request dispatch, processing, and response.',
        keyPoints: [
          'Domain name resolves to IP',
          'TCP and optional TLS handshake occur',
          'Request method, headers, and payload are sent',
          'Server returns status code, headers, and body'
        ],
        code: 'GET /api/subjects HTTP/1.1\nHost: blackitab.example\nAuthorization: Bearer <token>',
        language: 'http'
      }),
      buildTopic({
        name: 'Routing Fundamentals',
        summary: 'Routers forward packets based on destination IP and route selection protocols.',
        keyPoints: [
          'Static routes are manually configured',
          'Dynamic routing adapts to network changes',
          'Distance-vector and link-state are core approaches',
          'Default route handles unknown destinations'
        ]
      }),
      buildTopic({
        name: 'DNS and DHCP Essentials',
        summary: 'DNS maps names to IP addresses, while DHCP allocates network configuration automatically.',
        table: {
          headers: ['Protocol', 'Default Port', 'Purpose'],
          rows: [
            ['DNS', '53', 'Name resolution'],
            ['DHCP', '67/68', 'Dynamic IP assignment']
          ]
        }
      })
    ]
  },
  {
    name: 'Data Structures and Algorithms',
    description: 'Strengthen algorithmic thinking and implementation trade-offs.',
    topics: [
      buildTopic({
        name: 'Big O Analysis',
        summary: 'Big O describes the asymptotic growth of time and memory as input size increases.',
        table: {
          headers: ['Complexity', 'Typical Example'],
          rows: [
            ['O(1)', 'Array index access'],
            ['O(log n)', 'Binary search'],
            ['O(n)', 'Linear scan'],
            ['O(n log n)', 'Merge sort'],
            ['O(n^2)', 'Nested loops']
          ]
        }
      }),
      buildTopic({
        name: 'Arrays, Linked Lists, and Tradeoffs',
        summary: 'Arrays provide fast indexing, while linked lists offer flexible insertion and deletion.',
        keyPoints: [
          'Array random access is O(1)',
          'Middle insertion in arrays can be O(n)',
          'Linked lists need pointer traversal for access',
          'Linked list insertion at known node is O(1)'
        ]
      }),
      buildTopic({
        name: 'Stacks and Queues',
        summary: 'Stacks follow LIFO and queues follow FIFO; both are core in scheduling and parsing workflows.',
        keyPoints: [
          'Stack operations: push, pop, peek',
          'Queue operations: enqueue, dequeue, front',
          'Can be implemented with arrays or linked lists',
          'Used in recursion simulation and BFS'
        ],
        code: 'const queue = [];\nqueue.push(10);\nqueue.push(20);\nconst first = queue.shift(); // 10',
        language: 'javascript'
      }),
      buildTopic({
        name: 'Binary Search',
        summary: 'Binary search halves the search space each step, giving logarithmic search time for sorted arrays.',
        code: 'function binarySearch(arr, target) {\n  let low = 0, high = arr.length - 1;\n  while (low <= high) {\n    const mid = Math.floor((low + high) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) low = mid + 1;\n    else high = mid - 1;\n  }\n  return -1;\n}',
        language: 'javascript'
      }),
      buildTopic({
        name: 'Recursion and Backtracking',
        summary: 'Recursion solves problems by reducing them to smaller subproblems; backtracking explores choices and prunes invalid paths.',
        keyPoints: [
          'Define clear base case',
          'Trust recursive subproblem result',
          'Backtracking chooses, explores, and un-chooses',
          'Useful in permutations, subsets, and N-Queens'
        ]
      })
    ]
  },
  {
    name: 'SQL',
    description: 'Hands-on SQL for querying, aggregation, analytics, and interview-ready patterns.',
    topics: [
      buildTopic({
        name: 'SQL SELECT Fundamentals',
        summary: 'SELECT retrieves data with filters, sorting, and projection from one or more tables.',
        keyPoints: [
          'WHERE filters rows',
          'ORDER BY sorts result sets',
          'LIMIT controls output size',
          'Aliases improve readability'
        ],
        code: 'SELECT id, name, department\nFROM students\nWHERE department = \'CSE\'\nORDER BY name ASC\nLIMIT 20;',
        language: 'sql'
      }),
      buildTopic({
        name: 'JOINs Deep Dive',
        summary: 'JOIN operations combine rows from multiple tables based on matching keys.',
        table: {
          headers: ['JOIN Type', 'Returned Rows'],
          rows: [
            ['INNER JOIN', 'Only matching rows'],
            ['LEFT JOIN', 'All left rows + matched right rows'],
            ['RIGHT JOIN', 'All right rows + matched left rows'],
            ['FULL OUTER JOIN', 'All rows from both sides']
          ]
        },
        code: 'SELECT s.name, c.title\nFROM students s\nINNER JOIN enrollments e ON e.student_id = s.id\nINNER JOIN courses c ON c.id = e.course_id;',
        language: 'sql'
      }),
      buildTopic({
        name: 'GROUP BY and Aggregations',
        summary: 'GROUP BY creates summary rows using aggregate functions such as COUNT, SUM, AVG, MIN, and MAX.',
        keyPoints: [
          'Use HAVING to filter groups',
          'Aggregates run per group',
          'Non-grouped selected columns are invalid in strict SQL modes',
          'Indexes can improve grouped query speed'
        ],
        code: 'SELECT department, COUNT(*) AS total_students\nFROM students\nGROUP BY department\nHAVING COUNT(*) >= 10;',
        language: 'sql'
      }),
      buildTopic({
        name: 'Subqueries and CTEs',
        summary: 'Subqueries nest queries; CTEs improve readability and reuse complex intermediate results.',
        code: 'WITH top_students AS (\n  SELECT id, name, score\n  FROM students\n  WHERE score > 85\n)\nSELECT * FROM top_students ORDER BY score DESC;',
        language: 'sql',
        interviewTip: 'Know when to convert nested subqueries into CTEs for clarity.'
      }),
      buildTopic({
        name: 'Window Functions Essentials',
        summary: 'Window functions compute values across related rows without collapsing them into grouped output.',
        keyPoints: [
          'ROW_NUMBER ranks rows uniquely',
          'RANK handles ties with gaps',
          'PARTITION BY creates independent windows',
          'ORDER BY controls window sequence'
        ],
        code: 'SELECT name, department, score,\n       RANK() OVER (PARTITION BY department ORDER BY score DESC) AS dept_rank\nFROM students;',
        language: 'sql'
      })
    ]
  },
  {
    name: 'Object-Oriented Programming (OOP)',
    description: 'Core OOP concepts and design principles used in production code and interviews.',
    topics: [
      buildTopic({
        name: 'OOP Pillars: Encapsulation, Abstraction, Inheritance, Polymorphism',
        summary: 'These four pillars organize code into reusable, maintainable, and extensible models.',
        keyPoints: [
          'Encapsulation protects object state through controlled methods',
          'Abstraction hides implementation details behind interfaces',
          'Inheritance reuses behavior from parent classes',
          'Polymorphism allows one interface with many implementations'
        ]
      }),
      buildTopic({
        name: 'Classes and Objects',
        summary: 'A class defines structure and behavior, while objects are concrete runtime instances of that class.',
        code: 'class Student {\n  constructor(name) {\n    this.name = name;\n  }\n  greet() {\n    return `Hi, I am ${this.name}`;\n  }\n}\nconst s = new Student(\'Asha\');',
        language: 'javascript'
      }),
      buildTopic({
        name: 'Interfaces vs Abstract Classes',
        summary: 'Interfaces define contracts; abstract classes can define both contracts and shared implementation.',
        table: {
          headers: ['Feature', 'Interface', 'Abstract Class'],
          rows: [
            ['State fields', 'Usually no', 'Yes'],
            ['Method implementation', 'Signature only', 'Partial or full'],
            ['Multiple inheritance', 'Often allowed', 'Usually single']
          ]
        }
      }),
      buildTopic({
        name: 'Composition over Inheritance',
        summary: 'Composition builds behavior by combining smaller components, reducing rigid inheritance hierarchies.',
        keyPoints: [
          'Prefer has-a relationships where possible',
          'Makes behavior swapping easier',
          'Improves testability and modularity',
          'Avoids deep inheritance chains'
        ]
      }),
      buildTopic({
        name: 'SOLID Principles Basics',
        summary: 'SOLID principles guide maintainable object-oriented design and reduce change impact.',
        steps: [
          'S: Single Responsibility Principle',
          'O: Open/Closed Principle',
          'L: Liskov Substitution Principle',
          'I: Interface Segregation Principle',
          'D: Dependency Inversion Principle'
        ],
        interviewTip: 'Be ready with one real refactor example using SRP or DIP.'
      })
    ]
  },
  {
    name: 'CN Interview Patterns',
    description: 'Interview-focused networking explanations with concise patterns and high-frequency questions.',
    topics: [
      buildTopic({
        name: 'TCP vs UDP: Which and Why?',
        summary: 'TCP gives reliability and ordering, while UDP gives lower overhead and latency for real-time use cases.',
        table: {
          headers: ['Property', 'TCP', 'UDP'],
          rows: [
            ['Connection', 'Connection-oriented', 'Connectionless'],
            ['Reliability', 'Yes', 'No'],
            ['Ordering', 'Guaranteed', 'Not guaranteed'],
            ['Typical use', 'Web, email, file transfer', 'Streaming, gaming, DNS']
          ]
        },
        interviewTip: 'Answer with use-case reasoning, not just definitions.'
      }),
      buildTopic({
        name: 'Why Three-Way Handshake?',
        summary: 'The three-way handshake confirms both sender and receiver states before reliable byte-stream transfer starts.',
        steps: [
          'SYN from client',
          'SYN-ACK from server',
          'ACK from client'
        ],
        interviewTip: 'Mention sequence-number synchronization and stale packet prevention.'
      }),
      buildTopic({
        name: 'How DNS Resolves a Domain',
        summary: 'DNS resolution typically moves from local cache to recursive resolver, then root, TLD, and authoritative servers.',
        steps: [
          'Browser/OS checks local cache',
          'Resolver checks cache and queries root if needed',
          'Root points to TLD server',
          'TLD points to authoritative DNS',
          'Authoritative server returns record'
        ]
      }),
      buildTopic({
        name: 'What Happens When You Open a Website?',
        summary: 'A complete answer links DNS, TCP/TLS, HTTP request processing, server logic, and response rendering.',
        keyPoints: [
          'DNS lookup resolves domain to IP',
          'TCP and TLS setup secure transport',
          'HTTP request reaches load balancer and app server',
          'Server queries cache/database and returns response',
          'Browser parses HTML/CSS/JS and paints UI'
        ],
        interviewTip: 'This is one of the highest-frequency CN/system design starter questions.'
      }),
      buildTopic({
        name: 'Congestion Control vs Flow Control',
        summary: 'Flow control protects receiver capacity; congestion control protects the network from overload.',
        table: {
          headers: ['Control Type', 'Protects', 'Common Mechanism'],
          rows: [
            ['Flow control', 'Receiver', 'Sliding window / receive window'],
            ['Congestion control', 'Network path', 'Congestion window and slow start']
          ]
        },
        interviewTip: 'Differentiate rwnd and cwnd clearly in TCP explanations.'
      })
    ]
  }
];

const upsertTopicWithContent = async (subjectId, topicSeed) => {
  const topicDoc = await Topic.findOneAndUpdate(
    { subjectId, name: topicSeed.name },
    { subjectId, name: topicSeed.name },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const existingContent = await FullTopicData.findOne({ topicId: topicDoc._id }).select('_id');

  if (existingContent) {
    await FullTopicData.updateOne(
      { topicId: topicDoc._id },
      {
        $set: {
          title: topicSeed.name,
          lastUpdated: topicSeed.lastUpdated,
          content: topicSeed.content
        }
      }
    );
  } else {
    await FullTopicData.create({
      topicId: topicDoc._id,
      title: topicSeed.name,
      lastUpdated: topicSeed.lastUpdated,
      content: topicSeed.content,
      createdAt: new Date()
    });
  }
};

const seedTheory = async () => {
  await connectDB();

  if (shouldReset) {
    await FullTopicData.deleteMany({});
    await Topic.deleteMany({});
    await Subject.deleteMany({});
    console.log('🧹 Reset mode: cleared Subject, Topic, and FullTopicData collections.');
  }

  let totalTopicsProcessed = 0;

  for (const subjectSeed of THEORY_SEED) {
    const subjectDoc = await Subject.findOneAndUpdate(
      { name: subjectSeed.name },
      { name: subjectSeed.name, description: subjectSeed.description },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    for (const topicSeed of subjectSeed.topics) {
      await upsertTopicWithContent(subjectDoc._id, topicSeed);
      totalTopicsProcessed += 1;
    }
  }

  const subjectCount = await Subject.countDocuments();
  const topicCount = await Topic.countDocuments();
  const fullDataCount = await FullTopicData.countDocuments();

  console.log('✅ Theory seed completed successfully.');
  console.log(`   Subjects processed: ${THEORY_SEED.length}`);
  console.log(`   Topics processed: ${totalTopicsProcessed}`);
  console.log(`   Total subjects in DB: ${subjectCount}`);
  console.log(`   Total topics in DB: ${topicCount}`);
  console.log(`   Total full topic docs in DB: ${fullDataCount}`);

  process.exit(0);
};

seedTheory().catch((error) => {
  console.error('❌ Theory seed failed:', error.message);
  process.exit(1);
});
