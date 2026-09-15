-- =============================================================
-- Sample data so the feed isn't empty while you demo.
-- Run after schema.sql, or paste the INSERT statement directly.
-- =============================================================

insert into public.listings
  (title, subject, semester, condition, price, is_free, description,
   photo_url, contact_email, contact_phone, contact_whatsapp, status)
values
  ('Engineering Physics – 3rd Edition', 'Engineering Physics', 1, 'Good', 300, false,
   'First semester physics textbook, no missing pages, very few markings.',
   'https://picsum.photos/seed/swap-physics/800/600',
   'ananya@student.example', '+91 90000 00001', '919000000001', 'available'),

  ('Mathematics II – Complete Notes', 'Mathematics II', 2, 'New', 120, false,
   'Topper handwritten notes covering all 5 units. Covers differential equations and series.',
   'https://picsum.photos/seed/swap-maths/800/600',
   NULL, '+91 90000 00002', '919000000002', 'available'),

  ('Data Structures Lab Manual', 'Lab Manual', 3, 'Fair', 0, true,
   'Used lab manual for DS lab, all programs indexed. Giving away free.',
   'https://picsum.photos/seed/swap-lab/800/600',
   'rahul@student.example', NULL, NULL, 'available'),

  ('Basic Electrical Engineering (EEE)', 'Basic Electrical Engineering', 1, 'New', 450, false,
   'Brand new, still in wrapper. Selling because I bought a combined pack.',
   'https://picsum.photos/seed/swap-eee/800/600',
   NULL, '+91 90000 00003', '919000000003', 'available'),

  ('Operating Systems – 5th Edition', 'Operating Systems', 5, 'Good', 350, false,
   'Used for one semester, no torn pages, last ~10 pages have highlighter.',
   'https://picsum.photos/seed/swap-os/800/600',
   'kavya@student.example', NULL, NULL, 'available'),

  ('Previous Year Papers – Sem 4 (Set)', 'Previous Year Papers', 4, 'Good', 80, false,
   'All subjects, 3 years of question papers for semester 4.',
   'https://picsum.photos/seed/swap-pyp/800/600',
   NULL, '+91 90000 00004', '919000000004', 'available'),

  ('Computer Networks – Notes', 'Computer Networks', 6, 'Good', 150, false,
   'Unit-wise printed notes, neatly stapled. Last two units only.',
   'https://picsum.photos/seed/swap-cn/800/600',
   'dev@student.example', NULL, NULL, 'available'),

  ('Digital Logic Design (DLD)', 'Digital Logic Design', 3, 'Fair', 200, false,
   'Moderately used, cover slightly worn but all pages intact.',
   'https://picsum.photos/seed/swap-dld/800/600',
   NULL, '+91 90000 00005', '919000000005', 'available');