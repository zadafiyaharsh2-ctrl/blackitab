export const mockSubjects = [
  {
    _id: "subj_dbms",
    name: "Database Management Systems",
    description: "Master the fundamentals of databases, SQL, normalization, and transaction management.",
    topicCount: 5
  },
  {
    _id: "subj_os",
    name: "Operating Systems",
    description: "Learn about processes, threads, memory management, and file systems.",
    topicCount: 4
  },
  {
    _id: "subj_dsa",
    name: "Data Structures & Algorithms",
    description: "Core concepts of computer science including arrays, trees, graphs, and dynamic programming.",
    topicCount: 6
  },
  {
    _id: "subj_networks",
    name: "Computer Networks",
    description: "Explore the OSI model, TCP/IP Suite, routing algorithms, and network security protocols.",
    topicCount: 3
  }
];

export const getMockTopics = (subjectId) => {
  if (subjectId === "subj_dbms") {
    return [
      { _id: "topic_dbms_1", name: "Introduction to Databases", subjectId },
      { _id: "topic_dbms_2", name: "Relational Data Model", subjectId },
      { _id: "topic_dbms_3", name: "SQL Fundamentals", subjectId },
      { _id: "topic_dbms_4", name: "Normalization Techniques", subjectId },
      { _id: "topic_dbms_5", name: "Transaction & Concurrency", subjectId }
    ];
  }
  if (subjectId === "subj_os") {
    return [
      { _id: "topic_os_1", name: "OS Overview & Architecture", subjectId },
      { _id: "topic_os_2", name: "Process Management", subjectId },
      { _id: "topic_os_3", name: "Memory Management", subjectId },
      { _id: "topic_os_4", name: "Concurrency & Deadlocks", subjectId }
    ];
  }
  if (subjectId === "subj_dsa") {
    return [
      { _id: "topic_dsa_1", name: "Arrays & Strings", subjectId },
      { _id: "topic_dsa_2", name: "Linked Lists", subjectId },
      { _id: "topic_dsa_3", name: "Stacks & Queues", subjectId },
      { _id: "topic_dsa_4", name: "Trees & BSTs", subjectId },
      { _id: "topic_dsa_5", name: "Graph Algorithms", subjectId },
      { _id: "topic_dsa_6", name: "Dynamic Programming", subjectId }
    ];
  }
  if (subjectId === "subj_networks") {
    return [
      { _id: "topic_net_1", name: "OSI & TCP/IP Models", subjectId },
      { _id: "topic_net_2", name: "Routing Protocols", subjectId },
      { _id: "topic_net_3", name: "Application Layer", subjectId }
    ];
  }
  return [{ _id: "topic_generic_1", name: "Getting Started", subjectId }];
};

export const getMockTopicContent = (topic) => {
  return {
    _id: topic._id,
    title: topic.name,
    content: [
      {
        type: "heading",
        text: `Overview of ${topic.name}`
      },
      {
        type: "paragraph",
        text: `Welcome to the comprehensive module on **${topic.name}**. This section is expertly designed to provide you with a deep understanding of the core concepts, practical applications, and advanced techniques required to master this segment of computer science.`
      },
      {
        type: "list",
        title: "Key Learning Objectives",
        items: [
          "Understand the theoretical foundations and underlying architecture.",
          "Analyze real-world scenarios and practical applicability.",
          "Implement fundamental algorithms, queries, and configurations.",
          "Evaluate performance characteristics and optimization techniques."
        ]
      },
      {
        type: "heading",
        text: "Deep Dive: Core Architectural Concepts"
      },
      {
        type: "paragraph",
        text: "In modern computing, these principles form the absolute backbone of scalable and efficient systems. By securely abstracting underlying complexity, developers and engineers can build robust architectures capable of handling millions of operations per second seamlessly without bottlenecking the main execution threads."
      },
      {
        type: "code",
        language: "javascript",
        code: `// Example Technical Implementation
function analyzeSystemMetrics(dataStream) {
  if (!dataStream || dataStream.length === 0) {
    throw new Error("Data stream empty or inaccessible");
  }
  
  // High-performance filter map reduction
  const optimizedThroughput = dataStream
    .filter(packet => packet.isSecure && packet.integrityHash)
    .map(packet => packet.payloadSize * 1.5)
    .reduce((acc, curr) => acc + curr, 0);
    
  return {
    status: 'OPTIMAL',
    throughput: optimizedThroughput
  };
}

// Execute analysis pipeline
console.log(analyzeSystemMetrics([{ isSecure: true, integrityHash: "0x1A", payloadSize: 1024 }]));`
      },
      {
        type: "heading",
        text: "Comparative Analysis"
      },
      {
        type: "table",
        headers: ["Feature Matrix", "Traditional Approach", "Modern Approach (Optimized)"],
        rows: [
          ["Time Complexity", "O(n²) - Scales poorly at extreme volume", "O(n log n) - Highly scalable architecture"],
          ["Memory Allocation", "High garbage collection overhead", "Pre-allocated optimized buffers"],
          ["Implementation Difficulty", "Simple, linear to write", "Requires complex distributed architectural planning"]
        ],
        caption: "Comparing historical monolithic strategies versus modern distributed implementations."
      },
      {
        type: "numbered_list",
        items: [
          "First, establish the baseline requirements for your server cluster.",
          "Second, deploy the initialization scripts.",
          "Finally, monitor the application logs for any anomalies."
        ]
      },
      {
        type: "paragraph",
        text: "To summarize, mastering these intricate elements will significantly elevate your ability to architect enterprise-grade software. Continue to the next topic to build upon this foundational knowledge and expand your technical repertoire."
      }
    ]
  };
};
