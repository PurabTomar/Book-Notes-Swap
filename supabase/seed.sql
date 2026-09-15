-- =============================================================
-- Book & Notes Swap — Enriched demo data
-- Run after schema.sql. Safe to re-run (deletes old demo rows).
-- =============================================================

delete from public.listings
where title in (
  'Engineering Physics — Complete Notes',
  'Mathematics II — Complete Notes',
  'Data Structures — Lab Manual',
  'Basic Electrical Engineering — Important Questions',
  'Operating Systems — Unit-wise Notes',
  'Previous Year Papers — Sem 4 (Set)',
  'Computer Networks — Complete Notes',
  'Digital Logic Design — Important Topics',
  'Engineering Physics — PYQ 2025',
  'Engineering Graphics — Drawing Practice'
);

insert into public.listings
  (title, subject, semester, condition, price, is_free, description,
   photo_url, contact_email, contact_phone, contact_whatsapp,
   resource_type, branch, status)
values
  ('Engineering Physics — Complete Notes', 'Engineering Physics', 1, 'Good', 0, true,
   'Handwritten notes covering all 5 units. Electromagnetism, optics, and modern physics.',
   '/images/engineering-physics.svg',
   'rahul@student.example', '+91 90000 00001', '919000000001',
   'Handwritten Notes', 'CSE', 'available'),

  ('Mathematics II — Complete Notes', 'Mathematics II', 2, 'New', 0, true,
   'Topper handwritten notes covering all 5 units. Differential equations and series.',
   '/images/engineering-math.svg',
   NULL, '+91 90000 00002', '919000000002',
   'Handwritten Notes', 'CSE', 'available'),

  ('Data Structures — Lab Manual', 'Data Structures', 3, 'Fair', 0, true,
   'Complete lab manual with all programs indexed. Trees, graphs, sorting, and searching.',
   '/images/data-structures.svg',
   'ananya@student.example', NULL, NULL,
   'Lab Manual', 'CSE', 'available'),

  ('Basic Electrical Engineering — Important Questions', 'Basic Electrical Engineering', 1, 'Good', 0, true,
   'Curated question bank with 100+ important questions and solved examples.',
   '/images/basic-electrical.svg',
   NULL, '+91 90000 00004', '919000000004',
   'Question Bank', 'EE', 'available'),

  ('Operating Systems — Unit-wise Notes', 'Operating Systems', 5, 'Good', 0, true,
   'Unit-wise organized notes covering process management, memory, and file systems.',
   '/images/operating-systems.svg',
   'kavya@student.example', NULL, NULL,
   'PDF Notes', 'CSE', 'available'),

  ('Previous Year Papers — Sem 4 (Set)', 'Computer Networks', 4, 'New', 0, true,
   'All subjects, 3 years of question papers for semester 4. Clean scans.',
   '/images/previous-year-papers.svg',
   NULL, '+91 90000 00005', '919000000005',
   'Previous Year Paper', 'CSE', 'available'),

  ('Computer Networks — Complete Notes', 'Computer Networks', 4, 'Good', 0, true,
   'Unit-wise printed notes, neatly stapled. OSI model, TCP/IP, routing.',
   '/images/computer-networks.svg',
   'dev@student.example', NULL, NULL,
   'PDF Notes', 'CSE', 'available'),

  ('Digital Logic Design — Important Topics', 'Digital Logic Design', 3, 'Fair', 0, true,
   'Covers Boolean algebra, K-maps, flip-flops, and sequential circuits.',
   '/images/digital-logic.svg',
   NULL, '+91 90000 00006', '919000000006',
   'Question Bank', 'ECE', 'available'),

  ('Engineering Physics — PYQ 2025', 'Engineering Physics', 1, 'New', 0, true,
   'Previous year paper 2025 with solutions. Covers all units.',
   '/images/engineering-physics.svg',
   'priya@student.example', NULL, '919000000007',
   'Previous Year Paper', 'CSE', 'available'),

  ('Engineering Graphics — Drawing Practice', 'Engineering Graphics', 1, 'Good', 0, true,
   'Practice sheets with isometric views, projections, and section views.',
   '/images/engineering-graphics.svg',
   NULL, '+91 90000 00008', '919000000008',
   'Engineering Drawing', 'ME', 'available');