import { QuizQuestion } from '@/types/quiz';

export const sampleQuestions: QuizQuestion[] = [
  {
    "type": "singleSelect",
    "question": "What is pipelining in a CPU?",
    "options": [
      "A technique to execute multiple instructions simultaneously by overlapping their execution phases",
      "A method to increase CPU clock speed",
      "A way to cool down the processor",
      "A process for storing data in RAM"
    ],
    "answer": [0],
    "explanation": "Pipelining is a technique where multiple instruction execution phases are overlapped to improve CPU throughput. While one instruction is being decoded, another can be fetched, and yet another can be executed simultaneously."
  },
  {
    "type": "singleSelect",
    "question": "Which data structure follows the Last In First Out (LIFO) principle?",
    "options": [
      "Queue",
      "Stack",
      "Array",
      "Linked List"
    ],
    "answer": [1],
    "explanation": "A Stack follows the LIFO (Last In First Out) principle, where the last element added is the first one to be removed. This is like a stack of plates where you add and remove from the top."
  },
  {
    "type": "singleSelect",
    "question": "What is the time complexity of binary search in a sorted array?",
    "options": [
      "O(n)",
      "O(n log n)",
      "O(log n)",
      "O(1)"
    ],
    "answer": [2],
    "explanation": "Binary search has O(log n) time complexity because it eliminates half of the remaining elements in each step by comparing with the middle element."
  },
  {
    "type": "singleSelect",
    "question": "Which of the following is NOT a principle of Object-Oriented Programming?",
    "options": [
      "Encapsulation",
      "Inheritance",
      "Polymorphism",
      "Compilation"
    ],
    "answer": [3],
    "explanation": "The four main principles of OOP are Encapsulation, Inheritance, Polymorphism, and Abstraction. Compilation is a process of converting source code to machine code, not an OOP principle."
  },
  {
    "type": "singleSelect",
    "question": "What does SQL stand for?",
    "options": [
      "Structured Query Language",
      "Sequential Query Language",
      "Standard Query Language",
      "Simple Query Language"
    ],
    "answer": [0],
    "explanation": "SQL stands for Structured Query Language. It's a domain-specific language used for managing and manipulating relational databases."
  }
];