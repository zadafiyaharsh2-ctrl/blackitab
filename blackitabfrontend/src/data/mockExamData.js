export const mockExamQuestions = [
  {
    _id: "mock_q_1",
    examCategory: "GATE",
    subject: "Computer Science",
    topic: "Data Structures",
    difficulty: "Medium",
    question: "Consider a hash table of size 11 that uses open addressing with linear probing. Assuming that the hash function is h(k) = k mod 11, what is the standard sequence of probing for an element?",
    options: [
      "h(k), h(k)+1, h(k)+2, ...",
      "h(k), h(k)+1^2, h(k)+2^2, ...",
      "h(k), 2*h(k), 3*h(k), ...",
      "None of the above"
    ],
    correctAnswer: 0,
    explanation: "In linear probing, the interval between probes is fixed (usually 1). So the sequence is h(k), (h(k)+1)%M, (h(k)+2)%M, etc.",
    isAIGenerated: false
  },
  {
    _id: "mock_q_2",
    examCategory: "GATE",
    subject: "Operating Systems",
    topic: "Process Synchronization",
    difficulty: "Hard",
    question: "A counting semaphore was initialized to 10. Then 6 P (wait) operations and 4 V (signal) operations were completed. What is the resulting value of the semaphore?",
    options: [
      "8",
      "10",
      "12",
      "4"
    ],
    correctAnswer: 0,
    explanation: "Initial = 10. P decreases by 1 (10 - 6 = 4). V increases by 1 (4 + 4 = 8).",
    isAIGenerated: false
  },
  {
    _id: "mock_q_3",
    examCategory: "GATE",
    subject: "Computer Networks",
    topic: "TCP/IP",
    difficulty: "Medium",
    question: "In the IPv4 addressing format, the number of networks allowed under Class C addresses is:",
    options: [
      "2^14",
      "2^7",
      "2^21",
      "2^24"
    ],
    correctAnswer: 2,
    explanation: "Class C uses 3 bytes for network ID. The first 3 bits are fixed as 110. Hence, remaining bits = 24 - 3 = 21. Therefore, 2^21 networks.",
    isAIGenerated: false
  },
  {
    _id: "mock_q_4",
    examCategory: "GATE",
    subject: "DBMS",
    topic: "Normalization",
    difficulty: "Hard",
    question: "A relation R has attributes A, B, C, D, E, F, G, H, I, J, and satisfying the following functional dependencies: A -> BC, B -> CFH, E -> A, F -> EG. What is the closure of {E}?",
    options: [
      "{E, A, B, C, F, H}",
      "{E, A, B, C, F, G, H}",
      "{E, A, B, C}",
      "{E}"
    ],
    correctAnswer: 1,
    explanation: "E -> A. A -> BC. So E -> ABC. B -> CFH. So E -> ABCFH. F -> EG. So E -> ABCFGH. Therefore, E+ = {A, B, C, E, F, G, H}.",
    isAIGenerated: true
  }
];

export const getMockExamQuestions = (examId, subjectQuery) => {
  // If a specific subject is queried, filter. Otherwise return all.
  let filtered = mockExamQuestions;
  
  if (examId) {
     // Optional: You could filter by examCategory matching the examId if you want
     // filtered = filtered.filter(q => q.examCategory.toLowerCase() === examId.toLowerCase());
  }

  if (subjectQuery && subjectQuery !== 'All') {
    filtered = filtered.filter(q => q.subject.toLowerCase() === subjectQuery.toLowerCase());
  }
  
  // Return at least some questions even if filtering matched nothing, to prevent blank screens
  return filtered.length > 0 ? filtered : mockExamQuestions;
};
