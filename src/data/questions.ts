export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  hint: string;
  language: 'JavaScript' | 'Python' | 'HTML/CSS' | 'C++' | 'Java' | 'SQL';
}

export const questions: Question[] = [
  // JavaScript
  {
    id: 1,
    text: "What does HTML stand for?",
    options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink and Text Management Language"],
    correctAnswer: 0,
    hint: "It's the standard language for documents designed to be displayed in a web browser.",
    language: 'HTML/CSS'
  },
  {
    id: 2,
    text: "Which of these is NOT a JavaScript data type?",
    options: ["Boolean", "Float", "Undefined"],
    correctAnswer: 1,
    hint: "JavaScript uses 'Number' for both integers and floating-point numbers.",
    language: 'JavaScript'
  },
  {
    id: 3,
    text: "What does CSS stand for?",
    options: ["Creative Style Sheets", "Computer Style Sheets", "Cascading Style Sheets"],
    correctAnswer: 2,
    hint: "It describes how HTML elements are to be displayed on screen, paper, or in other media.",
    language: 'HTML/CSS'
  },
  {
    id: 4,
    text: "Which symbol is used for comments in JavaScript?",
    options: ["//", "/* */", "Both of these"],
    correctAnswer: 2,
    hint: "JavaScript supports both single-line and multi-line comments.",
    language: 'JavaScript'
  },
  {
    id: 5,
    text: "What is the correct way to write a JavaScript array?",
    options: ["var colors = (1:'red', 2:'blue')", "var colors = ['red', 'blue']", "var colors = 'red', 'blue'"],
    correctAnswer: 1,
    hint: "Arrays use square brackets.",
    language: 'JavaScript'
  },
  {
    id: 6,
    text: "Which method is used to add an element at the end of an array in JS?",
    options: ["push()", "pop()", "shift()"],
    correctAnswer: 0,
    hint: "Think of 'pushing' something onto a stack.",
    language: 'JavaScript'
  },
  {
    id: 7,
    text: "What will `typeof null` return in JavaScript?",
    options: ["null", "object", "undefined"],
    correctAnswer: 1,
    hint: "This is a long-standing bug in the language.",
    language: 'JavaScript'
  },
  {
    id: 8,
    text: "Which of these is used to declare a constant in JavaScript?",
    options: ["const", "let", "var"],
    correctAnswer: 0,
    hint: "It's short for 'constant'.",
    language: 'JavaScript'
  },
  {
    id: 9,
    text: "What is the result of '2' + 2 in JavaScript?",
    options: ["4", "22", "Error"],
    correctAnswer: 1,
    hint: "JavaScript performs string concatenation when one operand is a string.",
    language: 'JavaScript'
  },
  {
    id: 10,
    text: "Which function is used to parse a string into an integer in JS?",
    options: ["parseInt()", "toInteger()", "parseNumber()"],
    correctAnswer: 0,
    hint: "It's a global function that starts with 'parse'.",
    language: 'JavaScript'
  },
  // Python
  {
    id: 11,
    text: "Which keyword is used to create a function in Python?",
    options: ["function", "def", "func"],
    correctAnswer: 1,
    hint: "It's short for 'define'.",
    language: 'Python'
  },
  {
    id: 12,
    text: "How do you start a comment in Python?",
    options: ["//", "/*", "#"],
    correctAnswer: 2,
    hint: "It's the hash symbol.",
    language: 'Python'
  },
  {
    id: 13,
    text: "What is the correct file extension for Python files?",
    options: [".pyt", ".py", ".python"],
    correctAnswer: 1,
    hint: "Just two letters.",
    language: 'Python'
  },
  {
    id: 14,
    text: "Which data type is used to store multiple items in a single variable in Python?",
    options: ["list", "array", "map"],
    correctAnswer: 0,
    hint: "It's one of the four built-in data types in Python used to store collections of data.",
    language: 'Python'
  },
  {
    id: 15,
    text: "How do you create a variable with the numeric value 5 in Python?",
    options: ["x = 5", "x = int(5)", "Both are correct"],
    correctAnswer: 2,
    hint: "Python is dynamically typed but you can also cast.",
    language: 'Python'
  },
  {
    id: 16,
    text: "Which function is used to get the length of a list in Python?",
    options: ["length()", "len()", "size()"],
    correctAnswer: 1,
    hint: "It's a very short 3-letter function.",
    language: 'Python'
  },
  {
    id: 17,
    text: "How do you create a dictionary in Python?",
    options: ["{}", "[]", "()"],
    correctAnswer: 0,
    hint: "Dictionaries use curly braces.",
    language: 'Python'
  },
  {
    id: 18,
    text: "Which method is used to add an item to a list in Python?",
    options: ["add()", "append()", "insert()"],
    correctAnswer: 1,
    hint: "It starts with 'app'.",
    language: 'Python'
  },
  {
    id: 19,
    text: "What is the output of 2 ** 3 in Python?",
    options: ["6", "8", "9"],
    correctAnswer: 1,
    hint: "** is the exponentiation operator.",
    language: 'Python'
  },
  // HTML/CSS
  {
    id: 21,
    text: "Which HTML element is used for the largest heading?",
    options: ["<heading>", "<h6>", "<h1>"],
    correctAnswer: 2,
    hint: "The numbers go from 1 to 6, with 1 being the largest.",
    language: 'HTML/CSS'
  },
  {
    id: 22,
    text: "Which property is used to change the background color in CSS?",
    options: ["color", "background-color", "bgcolor"],
    correctAnswer: 1,
    hint: "It's a very descriptive property name.",
    language: 'HTML/CSS'
  },
  {
    id: 23,
    text: "Which HTML attribute is used to define inline styles?",
    options: ["font", "class", "style"],
    correctAnswer: 2,
    hint: "It shares the same name as the general concept of CSS.",
    language: 'HTML/CSS'
  },
  {
    id: 24,
    text: "What is the correct HTML for creating a hyperlink?",
    options: ["<a>http://google.com</a>", "<a href='http://google.com'>Google</a>", "<a name='http://google.com'>Google</a>"],
    correctAnswer: 1,
    hint: "You need the 'href' attribute.",
    language: 'HTML/CSS'
  },
  {
    id: 25,
    text: "Which CSS property controls the text size?",
    options: ["font-style", "text-size", "font-size"],
    correctAnswer: 2,
    hint: "It's 'font-' followed by the property.",
    language: 'HTML/CSS'
  },
  {
    id: 26,
    text: "How do you make the text bold in CSS?",
    options: ["font-weight: bold", "style: bold", "font: bold"],
    correctAnswer: 0,
    hint: "It's about the 'weight' of the font.",
    language: 'HTML/CSS'
  },
  {
    id: 27,
    text: "Which HTML tag is used to define an unordered list?",
    options: ["<ol>", "<ul>", "<li>"],
    correctAnswer: 1,
    hint: "U for Unordered.",
    language: 'HTML/CSS'
  },
  // C++
  {
    id: 31,
    text: "Which header file is used for input/output in C++?",
    options: ["<stdio.h>", "<iostream>", "<conio.h>"],
    correctAnswer: 1,
    hint: "It's part of the standard library for streams.",
    language: 'C++'
  },
  {
    id: 32,
    text: "How do you insert a new line in C++?",
    options: ["\\n", "endl", "Both of these"],
    correctAnswer: 2,
    hint: "One is an escape character, the other is a manipulator.",
    language: 'C++'
  },
  {
    id: 33,
    text: "Which keyword is used to define a class in C++?",
    options: ["struct", "class", "Both of these"],
    correctAnswer: 2,
    hint: "Both can define a class, but default access levels differ.",
    language: 'C++'
  },
  {
    id: 34,
    text: "Which of these is the correct way to declare a pointer in C++?",
    options: ["int *ptr;", "int &ptr;", "int ptr*;"],
    correctAnswer: 0,
    hint: "The asterisk (*) is used for pointers.",
    language: 'C++'
  },
  {
    id: 35,
    text: "What is the size of 'char' data type in C++ (usually)?",
    options: ["1 byte", "2 bytes", "4 bytes"],
    correctAnswer: 0,
    hint: "It's the smallest standard data type.",
    language: 'C++'
  },
  {
    id: 36,
    text: "Which operator is used to access members of a class through a pointer?",
    options: [".", "->", "::"],
    correctAnswer: 1,
    hint: "It looks like an arrow.",
    language: 'C++'
  },
  // Java
  {
    id: 41,
    text: "Which keyword is used to inherit a class in Java?",
    options: ["implements", "extends", "inherits"],
    correctAnswer: 1,
    hint: "It 'extends' the functionality of the parent class.",
    language: 'Java'
  },
  {
    id: 42,
    text: "What is the entry point of a Java program?",
    options: ["start()", "main()", "init()"],
    correctAnswer: 1,
    hint: "public static void ...",
    language: 'Java'
  },
  {
    id: 43,
    text: "Which of these is used to compile Java code?",
    options: ["java", "javac", "javadoc"],
    correctAnswer: 1,
    hint: "The 'c' stands for compiler.",
    language: 'Java'
  },
  {
    id: 44,
    text: "Which Java keyword is used to create an object?",
    options: ["create", "new", "make"],
    correctAnswer: 1,
    hint: "It's a very common 3-letter keyword.",
    language: 'Java'
  },
  {
    id: 45,
    text: "Which data type is used to create a variable that should store text?",
    options: ["String", "txt", "myString"],
    correctAnswer: 0,
    hint: "It starts with an uppercase letter in Java.",
    language: 'Java'
  },
  {
    id: 46,
    text: "Which of these is a valid way to start the main method in Java?",
    options: ["public static void main(String[] args)", "void main(String[] args)", "public main(String[] args)"],
    correctAnswer: 0,
    hint: "It needs to be public, static, and return void.",
    language: 'Java'
  },
  {
    id: 47,
    text: "What is the default value of a boolean variable in Java?",
    options: ["true", "false", "null"],
    correctAnswer: 1,
    hint: "It's the opposite of true.",
    language: 'Java'
  },
  {
    id: 48,
    text: "Which package is automatically imported into every Java program?",
    options: ["java.util", "java.io", "java.lang"],
    correctAnswer: 2,
    hint: "It contains fundamental classes like String and System.",
    language: 'Java'
  },
  // SQL
  {
    id: 56,
    text: "Which SQL keyword is used to return only different values?",
    options: ["UNIQUE", "DISTINCT", "DIFFERENT"],
    correctAnswer: 1,
    hint: "It starts with 'D'.",
    language: 'SQL'
  },
  {
    id: 57,
    text: "Which SQL operator is used to search for a specified pattern in a column?",
    options: ["GET", "LIKE", "SEARCH"],
    correctAnswer: 1,
    hint: "You use it with wildcards like %.",
    language: 'SQL'
  },
  {
    id: 58,
    text: "Which SQL statement is used to delete data from a database?",
    options: ["REMOVE", "DELETE", "COLLAPSE"],
    correctAnswer: 1,
    hint: "It's a very direct 6-letter word.",
    language: 'SQL'
  },
  {
    id: 51,
    text: "Which SQL statement is used to extract data from a database?",
    options: ["GET", "SELECT", "EXTRACT"],
    correctAnswer: 1,
    hint: "You 'select' the columns you want.",
    language: 'SQL'
  },
  {
    id: 52,
    text: "Which SQL keyword is used to sort the result-set?",
    options: ["SORT BY", "ORDER BY", "ARRANGE BY"],
    correctAnswer: 1,
    hint: "You put the results in a specific 'order'.",
    language: 'SQL'
  },
  {
    id: 53,
    text: "Which SQL statement is used to update data in a database?",
    options: ["SAVE", "MODIFY", "UPDATE"],
    correctAnswer: 2,
    hint: "It's a direct command to change existing records.",
    language: 'SQL'
  },
  {
    id: 54,
    text: "Which SQL statement is used to insert new data in a database?",
    options: ["INSERT INTO", "ADD RECORD", "INSERT NEW"],
    correctAnswer: 0,
    hint: "You 'insert into' a table.",
    language: 'SQL'
  },
  {
    id: 55,
    text: "How do you select all columns from a table named 'Persons'?",
    options: ["SELECT * FROM Persons", "SELECT Persons", "SELECT [all] FROM Persons"],
    correctAnswer: 0,
    hint: "The asterisk (*) is a wildcard for all columns.",
    language: 'SQL'
  }
];
