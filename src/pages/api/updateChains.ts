import db from '../../../database';

export default async function handler(req, res) {
  const { apiKey } = req.body;
  try {
    const response = await fetch(`https://api.torn.com/faction/?key=${apiKey}&selections=chains`);
    const data = await response.json();

    const chains = data.chains;
    await db.tx(t => {
      const queries = Object.keys(chains).map(chainId => {
        const chain = chains[chainId];
        return t.none(`
          INSERT INTO chains (id, chain, respect, start_time, end_time)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO NOTHING
        `, [chainId, chain.chain, chain.respect, chain.start, chain.end]);
      });
      return t.batch(queries);
    });

    res.status(200).json({ message: 'Chains updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating chains in database' });
  }
}
