import db from '../../../database';

export default async function handler(req, res) {
  try {
    const members = await db.any('SELECT * FROM members ORDER BY updated_at DESC');
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching members from database' });
  }
}
