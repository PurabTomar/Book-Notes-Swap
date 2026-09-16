// =============================================================
// Live seed for previously-EMPTY category tabs (Book, Project
// Material, Assignment, Coding Resource, Cheat Sheet, Study Pack,
// Other).  Safe to re-run: deletes the exact demo titles first,
// then re-inserts.  Uses the same public-insert RLS policy that
// supabase/seed.sql relies on (listings_public_insert, check true).
//
//   node scripts/live-seed.mjs
// =============================================================
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const envRaw = readFileSync(".env", "utf8");
const grab = (k) => {
  const m = envRaw.match(new RegExp(`^${k}=(.*)$`, "m"));
  return m ? m[1].trim() : undefined;
};

const url = grab("VITE_SUPABASE_URL") || process.env.VITE_SUPABASE_URL;
const anon = grab("VITE_SUPABASE_ANON_KEY") || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, anon);

const DEMO_TITLES = [
  "OS â€” Memory Management Cheat Sheet",
  "Data Structures â€” Complexity Cheat Sheet",
  "Compiler Design â€” One-Page Study Pack",
  "Automata Theory â€” Study Pack",
  "Electronics â€” Op-Amp Assignment Solutions",
  "Signals â€” Convolution Assignment Solved",
  "RDBMS â€” Normalization Assignment",
  "C Programming â€” Coding Resource: Pattern Problems",
  "DSA â€” Coding Resource: 30 Must-Know Programs",
  "Python â€” Coding Resource: NumPy Crash Pack",
  "Microprocessors â€” Previous Year Paper Set 2",
  "Engineering Mechanics â€” Previous Year Paper Set 2",
  "Discrete Mathematics â€” Assignment Pack",
];

const DEMO_ROWS = [
  // ---- Books (was empty) ----
  { title: "Operating Systems â€” Galvin Style Textbook", subject: "Operating Systems", semester: 5, condition: "Good", price: 148, is_free: false, description: "Clean copy of the classic OS textbook. Process management, memory, file systems, all chapters intact. No torn pages.", photo_url: "/images/operating-systems.svg", contact_email: "vivek@student.example", contact_phone: "+91 91000 00020", contact_whatsapp: "919100000020", resource_type: "Book", branch: "CSE", status: "available" },
  { title: "Computer Networks â€” Kurose Textbook (Indian Ed.)", subject: "Computer Networks", semester: 6, condition: "Good", price: 165, is_free: false, description: "Indian edition of Kurose & Ross. Application, transport, network layers in depth. Minimal highlighting.", photo_url: "/images/computer-networks.svg", contact_email: "sneha@student.example", contact_phone: null, contact_whatsapp: null, resource_type: "Book", branch: "CSE", status: "available" },
  { title: "Engineering Mathematics II â€” Textbook", subject: "Mathematics II", semester: 2, condition: "Fair", price: 90, is_free: false, description: "Complete 5-unit textbook. Differential equations, series, Laplace transforms. Covers syllabus fully.", photo_url: "/images/engineering-math.svg", contact_email: null, contact_phone: "+91 91000 00022", contact_whatsapp: "919100000022", resource_type: "Book", branch: "CSE", status: "available" },
  { title: "Digital Logic Design â€” Textbook", subject: "Digital Logic Design", semester: 3, condition: "Good", price: 110, is_free: false, description: "Morris Mano style DLD textbook. Boolean algebra, K-maps, sequential circuits. Hardcover.", photo_url: "/images/digital-logic.svg", contact_email: "iitstudent@student.example", contact_phone: null, contact_whatsapp: null, resource_type: "Book", branch: "ECE", status: "available" },

  // ---- Project Material (was empty) ----
  { title: "IoT Smart Attendance System â€” Project Report", subject: "Internet of Things", semester: 6, condition: "New", price: 75, is_free: false, description: "Complete ready-to-use project report: RFID-based attendance with full circuit diagram, code snippets, and result screenshots. Great reference for your own capstone.", photo_url: "/images/iot.svg", contact_email: null, contact_phone: "+91 91000 00025", contact_whatsapp: "919100000025", resource_type: "Project Material", branch: "ECE", status: "available" },
  { title: "Smart Home Automation â€” Block Diagram + Report", subject: "IoT", semester: 6, condition: "Good", price: 60, is_free: false, description: "Sensor + relay based home automation. Includes block diagram, wiring, and sample demo video stills.", photo_url: "/images/iot.svg", contact_email: "priyansh@student.example", contact_phone: null, contact_whatsapp: null, resource_type: "Project Material", branch: "EE", status: "available" },
  { title: "Network Sniffer (Python) â€” Project Report", subject: "Computer Networks", semester: 6, condition: "Good", price: 85, is_free: false, description: "Build a packet sniffer project in Python. Packet capture code, analysis, and conclusions.", photo_url: "/images/computer-networks.svg", contact_email: null, contact_whatsapp: "919100000027", contact_phone: null, resource_type: "Project Material", branch: "CSE", status: "available" },

  // ---- Assignment (was empty) ----
  { title: "Electronics â€” Op-Amp Assignment Solutions", subject: "Basic Electronics", semester: 2, condition: "Good", price: 0, is_free: true, description: "Fully solved Op-Amp assignment: inverting, non-inverting, integrator, comparator. Clear step-by-step working.", photo_url: "/images/basic-electronics.svg", contact_email: "aakash@student.example", contact_phone: null, contact_whatsapp: null, resource_type: "Assignment", branch: "ECE", status: "available" },
  { title: "Signals â€” Convolution Assignment Solved", subject: "Signals and Systems", semester: 4, condition: "Good", price: 0, is_free: true, description: "Step-by-step convolution solved sheet. Linear time-invariant systems part done fully.", photo_url: "/images/signals.svg", contact_email: null, contact_phone: "+91 91000 00029", contact_whatsapp: "919100000029", resource_type: "Assignment", branch: "ECE", status: "available" },
  { title: "RDBMS â€” Normalization Assignment", subject: "Database Management Systems", semester: 4, condition: "Good", price: 0, is_free: true, description: "Solved normalization assignment: 1NF to BCNF with worked examples and ER diagrams.", photo_url: "/images/dbms.svg", contact_email: "twinkle@student.example", contact_phone: null, contact_whatsapp: null, resource_type: "Assignment", branch: "CSE", status: "available" },

  // ---- Coding Resource (was empty) ----
  { title: "C Programming â€” Coding Resource: Pattern Problems", subject: "Programming for Problem Solving", semester: 1, condition: "New", price: 0, is_free: true, description: "40 pattern-programming problems with full C solutions. Star, number, alphabets. Great for lab viva.", photo_url: "/images/programming.svg", contact_email: null, contact_phone: null, contact_whatsapp: "91910000031", resource_type: "Coding Resource", branch: "CSE", status: "available" },
  { title: "DSA â€” Coding Resource: 30 Must-Know Programs", subject: "Data Structures", semester: 3, condition: "New", price: 0, is_free: true, description: "30 interview-oriented DSA programs: linked lists, stacks, queues, trees, sorting. Compile-ready.", photo_url: "/images/data-structures.svg", contact_email: "sumit@student.example", contact_phone: null, contact_whatsapp: null, resource_type: "Coding Resource", branch: "CSE", status: "available" },
  { title: "Python â€” Coding Resource: NumPy Crash Pack", subject: "Machine Learning", semester: 5, condition: "New", price: 0, is_free: true, description: "NumPy fundamentals with ML-relevant examples. Arrays, broadcasting, vectorization.", photo_url: "/images/machine-learning.svg", contact_email: null, contact_whatsapp: null, contact_phone: "+91 91000 00033", resource_type: "Coding Resource", branch: "CSE", status: "available" },

  // ---- Cheat Sheet (was empty) ----
  { title: "OS â€” Memory Management Cheat Sheet", subject: "Operating Systems", semester: 5, condition: "New", price: 0, is_free: true, description: "Paging, segmentation, virtual memory, page-replacement algorithms in one dense sheet.", photo_url: "/images/operating-systems.svg", contact_email: null, contact_phone: null, contact_whatsapp: "91910000035", resource_type: "Cheat Sheet", branch: "CSE", status: "available" },
  { title: "Data Structures â€” Complexity Cheat Sheet", subject: "Data Structures", semester: 3, condition: "New", price: 0, is_free: true, description: "Big-O for every common operation: arrays, lists, trees, hash, heaps, graphs.", photo_url: "/images/data-structures.svg", contact_email: "neelam@student.example", contact_phone: null, contact_whatsapp: null, resource_type: "Cheat Sheet", branch: "CSE", status: "available" },

  // ---- Study Pack (was empty) ----
  { title: "Compiler Design â€” One-Page Study Pack", subject: "Compiler Design", semester: 6, condition: "Good", price: 0, is_free: true, description: "Lexical analysis to code generation condensed into a single review page with diagrams.", photo_url: "/images/compiler-design.svg", contact_email: null, contact_phone: "+91 91000 00037", contact_whatsapp: "919100000037", resource_type: "Study Pack", branch: "CSE", status: "available" },
  { title: "Automata Theory â€” Study Pack", subject: "Theory of Computation", semester: 5, condition: "Good", price: 0, is_free: true, description: "DFA/NFA, regular languages, pushdown automata, Turing machines. Condensed + worked examples.", photo_url: "/images/toc.svg", contact_email: "rahim@student.example", contact_phone: null, contact_whatsapp: null, resource_type: "Study Pack", branch: "CSE", status: "available" },

  // ---- Other (was empty) ----
  { title: "Microprocessors â€” Previous Year Paper Set 2", subject: "Microprocessors", semester: 4, condition: "Good", price: 0, is_free: true, description: "Extra PYQ set for 8086 topics: addressing modes, interrupts, programming examples.", photo_url: "/images/previous-year-paper.svg", contact_email: null, contact_phone: null, contact_whatsapp: "91910000040", resource_type: "Other", branch: "ECE", status: "available" },
  { title: "Engineering Mechanics â€” Previous Year Paper Set 2", subject: "Engineering Mechanics", semester: 2, condition: "Good", price: 0, is_free: true, description: "Force systems, equilibrium, trusses, friction, centroids â€” with short solutions.", photo_url: "/images/engineering-mechanics.svg", contact_email: "divya@student.example", contact_phone: null, contact_whatsapp: null, resource_type: "Other", branch: "ME", status: "available" },
];

async function main() {
  // 1) Delete the demo titles so re-runs are idempotent
  const { error: delErr } = await supabase
    .from("listings")
    .delete()
    .in("title", DEMO_TITLES);
  if (delErr) console.error("delete error:", delErr.message);

  // 2) Insert
  for (const row of DEMO_ROWS) {
    const payload = { ...row };
    // JSON field carries null fine; keep nulls so photo/CDN checks behave
    const { error } = await supabase.from("listings").insert(payload);
    if (error) {
      console.error("insert failed:", row.title, "-", error.message);
    } else {
      console.log("seeded:", row.title);
    }
  }
}

main();
