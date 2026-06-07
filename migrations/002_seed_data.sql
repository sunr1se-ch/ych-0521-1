INSERT INTO umbrella (id, umbrella_no, planned_interval_days, status, created_at) VALUES
  ('u001', 'YS-2026-001', 5, 'normal', '2026-05-15 09:00:00'),
  ('u002', 'YS-2026-002', 7, 'stagnant', '2026-05-16 10:30:00'),
  ('u003', 'YS-2026-003', 5, 'normal', '2026-05-18 08:15:00'),
  ('u004', 'YS-2026-004', 6, 'completed', '2026-05-10 14:00:00'),
  ('u005', 'YS-2026-005', 5, 'normal', '2026-05-20 11:20:00'),
  ('u006', 'YS-2026-006', 7, 'stagnant', '2026-05-12 13:45:00');

INSERT INTO pasting_record (id, umbrella_id, pasting_date, wrinkle_length, interval_days, wrinkle_increase, is_stagnant_trigger) VALUES
  ('p001', 'u001', '2026-05-16', 0.5, NULL, NULL, 0),
  ('p002', 'u001', '2026-05-21', 1.2, 5, 0.7, 0),
  ('p003', 'u001', '2026-05-26', 1.8, 5, 0.6, 0),
  ('p004', 'u001', '2026-05-31', 2.1, 5, 0.3, 0),
  ('p005', 'u002', '2026-05-17', 0.8, NULL, NULL, 0),
  ('p006', 'u002', '2026-05-24', 1.5, 7, 0.7, 0),
  ('p007', 'u002', '2026-06-02', 4.8, 9, 3.3, 1),
  ('p008', 'u003', '2026-05-19', 0.3, NULL, NULL, 0),
  ('p009', 'u003', '2026-05-24', 0.9, 5, 0.6, 0),
  ('p010', 'u003', '2026-05-29', 1.4, 5, 0.5, 0),
  ('p011', 'u004', '2026-05-11', 0.4, NULL, NULL, 0),
  ('p012', 'u004', '2026-05-17', 1.0, 6, 0.6, 0),
  ('p013', 'u004', '2026-05-23', 1.6, 6, 0.6, 0),
  ('p014', 'u004', '2026-05-29', 2.0, 6, 0.4, 0),
  ('p015', 'u005', '2026-05-21', 0.2, NULL, NULL, 0),
  ('p016', 'u005', '2026-05-26', 0.7, 5, 0.5, 0),
  ('p017', 'u006', '2026-05-13', 0.6, NULL, NULL, 0),
  ('p018', 'u006', '2026-05-20', 1.3, 7, 0.7, 0),
  ('p019', 'u006', '2026-05-30', 4.5, 10, 3.2, 1);

INSERT INTO stagnation_record (id, umbrella_id, triggered_by_record_id, reason, stagnant_date, resolved) VALUES
  ('s001', 'u002', 'p007', '实际间隔9天超出计划7天+2天，起皱增加3.3cm超出3cm阈值', '2026-06-02', 0),
  ('s002', 'u006', 'p019', '实际间隔10天超出计划7天+2天，起皱增加3.2cm超出3cm阈值', '2026-05-30', 0);

UPDATE umbrella SET completed_at = '2026-06-01 15:30:00', status = 'completed' WHERE id = 'u004';
UPDATE umbrella SET status = 'stagnant' WHERE id IN ('u002', 'u006');
