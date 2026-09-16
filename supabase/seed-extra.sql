-- =============================================================
-- Book & Notes Swap — Extra demo data for previously-empty tabs
-- Run after seed.sql (or standalone — safe to re-run).
--   Books, Projects, Assignments, Coding Resources, Cheat Sheets,
--   and Study Packs had ZERO rows, so those category tabs appeared
--   empty. This fills them with realistic SATI entries.
-- =============================================================

delete from public.listings
where title in (
  'Programming for Problem Solving — Reference Book',
  'Engineering Chemistry — Reference Book',
  'Data Structures — Handwritten Coding Notes Bundle',
  'IoT Smart Classroom Guide — Project Material',
  'Smart Attendance System — Project Report',
  'Engineering Graphics — Cheat Sheet',
  'DBMS — Question Bank Pocket Pack',
  'Java Programming — Coding Resource Pack',
  'Data Science Mini Project — Study Pack'
);

insert into public.listings
  (title, subject, semester, condition, price, is_free, description,
   photo_url, contact_email, contact_phone, contact_whatsapp,
   resource_type, branch, status)
values
  ('Programming for Problem Solving — Reference Book', 'Programming for Problem Solving', 1, 'Good', 120, false,
   'Standard reference used by SATI faculty. Covers C fundamentals, arrays, pointers, and file handling.',
   '/images/book-generic.svg',
   'arjun@student.example', '+91 90000 00009', '919000000009',
   'Book', 'CSE', 'available'),

  ('Engineering Chemistry — Reference Book', 'Engineering Chemistry', 1, 'Fair', 80, false,
   'Well-worn but fully readable. Water treatment, corrosion, fuels, and polymers.',
   '/images/engineering-chemistry.svg',
   NULL, '+91 90000 00010', '919000000010',
   'Book', 'CSE', 'available'),

  ('Data Structures — Handwritten Coding Notes Bundle', 'Data Structures', 3, 'Good', 0, true,
   'Handwritten notes + PDF cheat sheet for tricky topics: linked lists, trees, hashing.',
   '/images/data-structures.svg',
   'ishita@student.example', NULL, NULL,
   'Study Pack', 'CSE', 'available'),

  ('IoT Smart Classroom Guide — Project Material', 'Internet of Things', 5, 'New', 0, true,
   'Complete project report + schematics for an IoT-enabled classroom display. My final-year project.',
   '/images/iot.svg',
   NULL, '+91 90000 00011', '919000000011',
   'Project Material', 'ECE', 'available'),

  ('Smart Attendance System — Project Report', 'IoT', 6, 'Good', 0, true,
   'RFID-based attendance system: full report, circuit diagram, and working model photos.',
   '/images/project-material.svg',
   'karan@student.example', NULL, NULL,
   'Project Material', 'ECE', 'available'),

  ('Engineering Graphics — Cheat Sheet', 'Engineering Graphics', 1, 'Good', 0, true,
   'One-page cheat sheet: projections, orthographic views, and dimensioning rules.',
   '/images/engineering-graphics.svg',
   NULL, NULL, '919000000012',
   'Cheat Sheet', 'ME', 'available'),

  ('DBMS — Question Bank Pocket Pack', 'Database Management Systems', 4, 'Good', 0, true,
   '50 handpicked exam questions with short answers. Great for quick revision.',
   '/images/dbms.svg',
   'neha@student.example', NULL, NULL,
   'Question Bank', 'CSE', 'available'),

  ('Java Programming — Coding Resource Pack', 'Object Oriented Programming', 3, 'New', 0, true,
   'OOP + Java: solved programs, common interview snippets, and unit-wise pointers.',
   '/images/coding-resource.svg',
   NULL, '+91 90000 00013', '919000000013',
   'Coding Resource', 'CSE', 'available'),

  ('Data Science Mini Project — Study Pack', 'Machine Learning', 7, 'Good', 0, true,
   'Ready-to-pitch mini project kit: proposal, dataset links, and sample notebook summary.',
   '/images/project-material.svg',
   'rehmat@student.example', NULL, NULL,
   'Project Material', 'CSE', 'available')
;
