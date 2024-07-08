"use client"; // Add this line at the top

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const ChainReport = ({ params }) => {
  const [sortedMembers, setSortedMembers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'attacks', direction: 'descending' });
  const searchParams = useSearchParams();
  const chainId = params.chainId;
  const apiKey = localStorage.getItem('apiKey');
  const router = useRouter();

  useEffect(() => {
    fetchChainReport();
  }, []);

  const fetchChainReport = async () => {
    const ids = searchParams.get('ids') || chainId;
    try {
      const response = await axios.post('/api/chainReport', { ids, apiKey });
      const data = response.data;
      if (data.membersWithDetails && data.reports) {
        const bonuses = data.reports.flatMap(report => report.bonuses || []);
        const members = data.membersWithDetails.map(member => {
          const memberBonuses = bonuses.filter(bonus => bonus.attacker === member.userID);
          if (memberBonuses.length > 0) {
            const bonusRespect = memberBonuses.reduce((acc, bonus) => acc + bonus.respect, 0);
            const adjustedRespect = Math.round(member.respect - bonusRespect);
            const adjustedAvg = member.attacks > 1 
              ? parseFloat(((adjustedRespect) / (member.attacks - 1)).toFixed(2)) 
              : 0;

            return {
              ...member,
              respect: adjustedRespect,
              avg: adjustedAvg,
            };
          } else {
            return {
              ...member,
              respect: Math.round(member.respect),
              avg: parseFloat(member.avg.toFixed(2)),
            };
          }
        });
        setSortedMembers(members);
        sortArray('attacks', 'descending', members); // Default sort by highest attacks
      } else {
        console.error('Data is not in the expected format:', data);
      }
    } catch (error) {
      console.error('Error fetching chain report:', error);
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    sortArray(key, direction);
  };

  const parseRelativeTime = (relativeTime) => {
    if (!relativeTime) return Infinity; // Treat missing times as the least recent
    const parts = relativeTime.split(' ');
    const value = parseInt(parts[0], 10);
    const unit = parts[1] ? parts[1].toLowerCase() : '';
    let multiplier = 0;

    if (unit.startsWith('minute')) {
      multiplier = 1;
    } else if (unit.startsWith('hour')) {
      multiplier = 60;
    } else if (unit.startsWith('day')) {
      multiplier = 60 * 24;
    } else if (unit.startsWith('week')) {
      multiplier = 60 * 24 * 7;
    } else if (unit.startsWith('month')) {
      multiplier = 60 * 24 * 30;
    } else if (unit.startsWith('year')) {
      multiplier = 60 * 24 * 365;
    }

    return value * multiplier;
  };

  const sortArray = (key, direction, members = sortedMembers) => {
    const sortedArray = [...members].sort((a, b) => {
      if (key === 'last_active') {
        const aTime = parseRelativeTime(a[key]);
        const bTime = parseRelativeTime(b[key]);
        return direction === 'ascending' ? aTime - bTime : bTime - aTime;
      }
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setSortedMembers(sortedArray);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') {
        return <FaSortUp className="ml-1 inline" />;
      }
      return <FaSortDown className="ml-1 inline" />;
    }
    return <FaSort className="ml-1 inline" />;
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="flex-1 p-2 sm:p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="container mx-auto">
          <button
            onClick={() => router.push('/chain-reports')}
            className="bg-blue-500 px-4 py-2 mb-4 rounded hover:bg-blue-600"
          >
            Back to Chain Reports
          </button>
          <h1 className="text-2xl mb-4 text-center">Chain Report for {chainId}</h1>
          <table className="min-w-full bg-white dark:bg-gray-800 table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="px-4 py-2 text-center" onClick={() => requestSort('name')}>
                  Name {getSortIcon('name')}
                </th>
                <th className="px-4 py-2 text-center" onClick={() => requestSort('attacks')}>
                  Attacks {getSortIcon('attacks')}
                </th>
                <th className="px-4 py-2 text-center" onClick={() => requestSort('respect')}>
                  Respect {getSortIcon('respect')}
                </th>
                <th className="px-4 py-2 text-center" onClick={() => requestSort('avg')}>
                  Avg Respect {getSortIcon('avg')}
                </th>
                <th className="px-4 py-2 text-center" onClick={() => requestSort('last_active')}>
                  Last Active {getSortIcon('last_active')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedMembers.map((member) => (
                <tr key={member.userID} className="border-t">
                  <td className="px-4 py-2 text-center">
                    <a href={`https://www.torn.com/profiles.php?XID=${member.userID}`} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                      {member.name} [{member.userID}]
                    </a>
                  </td>
                  <td className="px-4 py-2 text-center">{formatNumber(member.attacks) || 0}</td>
                  <td className="px-4 py-2 text-center">{formatNumber(member.respect) || 0}</td>
                  <td className="px-4 py-2 text-center">{formatNumber(member.avg) || 0}</td>
                  <td className="px-4 py-2 text-center">{member.last_active || 'unknown'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ChainReport;
