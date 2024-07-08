import db from '../../../database';

export default async function handler(req, res) {
  const { apiKey } = req.body;
  try {
    const response = await fetch(`https://api.torn.com/faction/?key=${apiKey}&selections=basic`);
    const data = await response.json();

    const members = data.members;
    await db.tx(t => {
      const queries = Object.keys(members).map(memberId => {
        const member = members[memberId];
        return t.none(`
          INSERT INTO members (id, name, level, days_in_faction, last_action, last_action_timestamp, position, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE
          SET name = $2, level = $3, days_in_faction = $4, last_action = $5, last_action_timestamp = $6, position = $7, status = $8
        `, [memberId, member.name, member.level, member.days_in_faction, member.last_action.relative, member.last_action.timestamp, member.position, member.status.state]);
      });
      return t.batch(queries);
    });

    res.status(200).json({ message: 'Members updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating members in database' });
  }
}
