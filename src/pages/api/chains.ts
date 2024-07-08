import db from '../../../database';

export default async function handler(req, res) {
  try {
    const chains = await db.any('SELECT * FROM chains ORDER BY start_time DESC');
    res.status(200).json(chains);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chains from database' });
  }
}
