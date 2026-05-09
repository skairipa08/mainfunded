import { Router } from 'express';
import { requireScope } from '../middleware/apiKey';
import { query } from '../lib/db';

export const studentsRouter = Router();

const SANDBOX_STUDENT = {
  id: 'std_sandbox_001',
  display_name: 'Demo Student',
  country: 'TR',
  field_of_study: 'Computer Science',
  verification_status: 'verified',
  created_at: '2026-01-01T00:00:00Z',
};

studentsRouter.get('/:id', requireScope('students:read'), async (req, res) => {
  if (req.apiKey!.environment === 'sandbox') {
    return res.json({ ...SANDBOX_STUDENT, id: req.params.id });
  }
  const [row] = await query(
    `SELECT id, display_name, country, field_of_study, verification_status, created_at
       FROM students
      WHERE id = $1 AND school_id = $2`,
    [req.params.id, req.apiKey!.school_id],
  );
  if (!row) return res.status(404).json({ error: { code: 'not_found', message: 'Öğrenci yok' } });
  res.json(row);
});
