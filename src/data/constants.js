export const BRANCHES = [
  "All Branches",
  "CSE",
  "CSE (IoT)",
  "CSE (AI/ML)",
  "ECE",
  "EE",
  "ME",
  "CE",
  "IT",
];

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const RESOURCE_TYPES = [
  { value: "", label: "All Resources", icon: "📚" },
  { value: "Book", label: "Book", icon: "📖" },
  { value: "Handwritten Notes", label: "Handwritten Notes", icon: "✍️" },
  { value: "PDF Notes", label: "PDF Notes", icon: "📄" },
  { value: "Previous Year Paper", label: "Previous Year Paper", icon: "📝" },
  { value: "Lab Manual", label: "Lab Manual", icon: "🔬" },
  { value: "Question Bank", label: "Question Bank", icon: "❓" },
  { value: "Assignment", label: "Assignment", icon: "📋" },
  { value: "Engineering Drawing", label: "Engineering Drawing", icon: "📐" },
  { value: "Coding Resource", label: "Coding Resource", icon: "💻" },
  { value: "Cheat Sheet", label: "Cheat Sheet", icon: "⚡" },
  { value: "Study Pack", label: "Study Pack", icon: "📦" },
  { value: "Project Material", label: "Project Material", icon: "🛠️" },
  { value: "Other", label: "Other", icon: "📎" },
];

export const SUBJECT_GROUPS = [
  {
    label: "First Year / Foundation",
    subjects: [
      "Mathematics I",
      "Mathematics II",
      "Mathematics III",
      "Engineering Physics",
      "Engineering Chemistry",
      "Programming for Problem Solving",
      "Engineering Graphics",
      "Basic Electrical Engineering",
      "Basic Electronics",
    ],
  },
  {
    label: "CSE / IoT / Core",
    subjects: [
      "Data Structures",
      "Discrete Mathematics",
      "Digital Logic Design",
      "Computer Organization",
      "Operating Systems",
      "Computer Networks",
      "Database Management Systems",
      "Object Oriented Programming",
      "Computer Programming",
      "Internet of Things",
      "Microprocessors",
      "Microcontrollers",
    ],
  },
  {
    label: "Other Engineering",
    subjects: [
      "Engineering Mechanics",
      "Engineering Materials",
      "Signals and Systems",
      "Communication Systems",
      "Control Systems",
      "Numerical Methods",
      "Software Engineering",
      "Theory of Computation",
      "Compiler Design",
      "Web Technologies",
      "Machine Learning",
      "Artificial Intelligence",
      "Thermodynamics",
      "Fluid Mechanics",
      "Strength of Materials",
      "Electrical Machines",
      "Analog Electronics",
    ],
  },
];

export const ALL_SUBJECTS = SUBJECT_GROUPS.flatMap((g) => g.subjects);

export const SEMESTER_SUBJECTS = {
  1: ["Engineering Physics", "Engineering Chemistry", "Mathematics I", "Programming for Problem Solving", "Engineering Graphics", "Basic Electrical Engineering"],
  2: ["Mathematics II", "Basic Electronics", "Programming for Problem Solving", "Engineering Chemistry"],
  3: ["Mathematics III", "Data Structures", "Discrete Mathematics", "Digital Logic Design", "Computer Organization"],
  4: ["Operating Systems", "Computer Networks", "Database Management Systems", "Object Oriented Programming"],
  5: ["Software Engineering", "Theory of Computation", "Compiler Design", "Web Technologies"],
  6: ["Machine Learning", "Artificial Intelligence", "Microprocessors", "Microcontrollers"],
  7: ["Signals and Systems", "Communication Systems", "Control Systems"],
  8: ["Numerical Methods", "Engineering Materials", "Engineering Mechanics"],
};

export const CATEGORIES = [
  { value: "", label: "All" },
  { value: "Book", label: "Books" },
  { value: "Handwritten Notes", label: "Notes" },
  { value: "Previous Year Paper", label: "PYQs" },
  { value: "Lab Manual", label: "Lab Manuals" },
  { value: "Engineering Drawing", label: "Drawing" },
  { value: "Project Material", label: "Projects" },
  { value: "Question Bank", label: "Question Banks" },
];

export const SUBJECT_IMAGES = {
  "Engineering Physics": "/images/engineering-physics.svg",
  "Engineering Chemistry": "/images/engineering-chemistry.svg",
  "Programming for Problem Solving": "/images/programming.svg",
  "Engineering Graphics": "/images/engineering-graphics.svg",
  "Basic Electrical Engineering": "/images/basic-electrical.svg",
  "Basic Electronics": "/images/basic-electrical.svg",
  "Mathematics I": "/images/engineering-math.svg",
  "Mathematics II": "/images/engineering-math.svg",
  "Mathematics III": "/images/engineering-math.svg",
  "Discrete Mathematics": "/images/engineering-math.svg",
  "Data Structures": "/images/data-structures.svg",
  "Computer Networks": "/images/computer-networks.svg",
  "Digital Logic Design": "/images/digital-logic.svg",
  "Operating Systems": "/images/operating-systems.svg",
  "Computer Organization": "/images/operating-systems.svg",
  "Previous Year Papers": "/images/previous-year-papers.svg",
  "Lab Manual": "/images/lab-manual.svg",
  "Handwritten Notes": "/images/handwritten-notes.svg",
  "Database Management Systems": "/images/programming.svg",
  "Web Technologies": "/images/programming.svg",
  "Machine Learning": "/images/programming.svg",
  "Artificial Intelligence": "/images/programming.svg",
  "Compiler Design": "/images/programming.svg",
  "Software Engineering": "/images/programming.svg",
  "Theory of Computation": "/images/programming.svg",
  "Signals and Systems": "/images/engineering-physics.svg",
  "Control Systems": "/images/engineering-physics.svg",
  "Thermodynamics": "/images/engineering-physics.svg",
  "Fluid Mechanics": "/images/engineering-physics.svg",
  "Strength of Materials": "/images/engineering-graphics.svg",
  "Electrical Machines": "/images/basic-electrical.svg",
  "Analog Electronics": "/images/basic-electrical.svg",
  "Microprocessors": "/images/digital-logic.svg",
  "Communication Systems": "/images/computer-networks.svg",
  "Computer Programming": "/images/programming.svg",
  "Internet of Things": "/images/computer-networks.svg",
  "Microcontrollers": "/images/digital-logic.svg",
  "Engineering Mechanics": "/images/engineering-physics.svg",
  "Engineering Materials": "/images/engineering-graphics.svg",
  "Numerical Methods": "/images/engineering-math.svg",
  "Object Oriented Programming": "/images/programming.svg",
};

export const FALLBACK_IMAGE = "/images/book-generic.svg";

export const subjectImage = (subject) => SUBJECT_IMAGES[subject] ?? FALLBACK_IMAGE;