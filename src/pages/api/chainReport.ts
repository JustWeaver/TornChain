import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import db from '../../../database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { ids, apiKey } = req.body;

  if (!ids || !apiKey) {
    return res.status(400).json({ error: 'Missing chain IDs or API key' });
  }

  try {
    const idArray = ids.split(',');
    const promises = idArray.map(async (id) => {
      const response = await axios.get(`https://api.torn.com/torn/${id}?key=${apiKey}&selections=chainreport`);
      return response.data.chainreport;
    });

    const reports = await Promise.all(promises);

    // Aggregate member data
    const aggregatedMembers = reports.reduce((acc, report) => {
      Object.values(report.members).forEach(member => {
        const memberId = member.userID;
        if (!acc[memberId]) {
          acc[memberId] = { ...member, attacks: 0, respect: 0, avg: 0, losses: 0 };
        }
        acc[memberId].attacks += member.attacks;
        acc[memberId].respect += member.respect;
        acc[memberId].avg = acc[memberId].attacks ? acc[memberId].respect / acc[memberId].attacks : 0;
        acc[memberId].losses += member.losses;
      });
      return acc;
    }, {});

    // Fetch member details from the database
    const memberIDs = Object.keys(aggregatedMembers);
    const memberDetails = await db.any('SELECT id, name, last_action FROM members WHERE id IN ($1:csv)', [memberIDs]);

    const memberDetailsMap = memberDetails.reduce((acc, member) => {
      acc[member.id] = member;
      return acc;
    }, {});

    // Combine member details with aggregated data
    const membersWithDetails = Object.values(aggregatedMembers).map(member => {
      const details = memberDetailsMap[member.userID] || {};
      return {
        ...member,
        name: details.name || 'unknown',
        last_active: details.last_action || 'unknown'
      };
    });

    res.status(200).json({ reports, membersWithDetails });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chain reports' });
  }
}
