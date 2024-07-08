"use client"; // Add this line at the top

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [sortedMembers, setSortedMembers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

  useEffect(() => {
    fetchMembersFromDb();
  }, []);

  const fetchMembersFromDb = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMembers(data);
        setSortedMembers(data);
      } else {
        console.error('Data is not an array:', data);
      }
    } catch (error) {
      console.error('Error fetching members from database:', error);
    }
  };

  const handleUpdateMembers = async () => {
    const apiKey = localStorage.getItem('apiKey');
    try {
      await axios.post('/api/updateMembers', { apiKey });
      fetchMembersFromDb();
    } catch (error) {
      console.error('Error updating members:', error);
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    if (key === 'last_action') {
      sortArrayByTimestamp(key, direction);
    } else {
      sortArray(key, direction);
    }
  };

  const sortArray = (key, direction) => {
    const sortedArray = [...members].sort((a, b) => {
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

  const parseTimeString = (timeString) => {
    const units = {
      minute: 1,
      hour: 60,
      day: 1440,
      week: 10080,
      month: 43200,
      year: 525600,
    };

    const [value, unit] = timeString.split(' ');
    const numericValue = parseInt(value);
    let factor = 1;

    if (unit.startsWith('minute')) {
      factor = units.minute;
    } else if (unit.startsWith('hour')) {
      factor = units.hour;
    } else if (unit.startsWith('day')) {
      factor = units.day;
    } else if (unit.startsWith('week')) {
      factor = units.week;
    } else if (unit.startsWith('month')) {
      factor = units.month;
    } else if (unit.startsWith('year')) {
      factor = units.year;
    }

    return numericValue * factor;
  };

  const sortArrayByTimestamp = (key, direction) => {
    const sortedArray = [...members].sort((a, b) => {
      const timeA = parseTimeString(a[key]);
      const timeB = parseTimeString(b[key]);

      if (timeA < timeB) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (timeA > timeB) {
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="p-4 flex flex-col items-center">
        <button onClick={handleUpdateMembers} className="bg-blue-500 px-4 py-2 mb-4 rounded hover:bg-blue-600">
          Update Members
        </button>
      </div>
      <main className="flex-1 p-2 sm:p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="container mx-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="px-4 py-2 text-center" onClick={() => requestSort('name')}>
                  Name {getSortIcon('name')}
                </th>
                <th className="px-4 py-2 text-center" onClick={() => requestSort('level')}>
                  Level {getSortIcon('level')}
                </th>
                <th className="px-4 py-2 text-center" onClick={() => requestSort('days_in_faction')}>
                  Days in Faction {getSortIcon('days_in_faction')}
                </th>
                <th className="px-4 py-2 text-center" onClick={() => requestSort('last_action')}>
                  Last Action {getSortIcon('last_action')}
                </th>
                <th className="px-4 py-2 text-center" onClick={() => requestSort('position')}>
                  Position {getSortIcon('position')}
                </th>
                <th className="px-4 py-2 text-center" onClick={() => requestSort('status')}>
                  Status {getSortIcon('status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedMembers.map((member) => (
                <tr key={member.id} className="border-t">
                  <td className="px-4 py-2 text-center">
                    <a href={`https://www.torn.com/profiles.php?XID=${member.id}`} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                      {member.name} [{member.id}]
                    </a>
                  </td>
                  <td className="px-4 py-2 text-center">{member.level}</td>
                  <td className="px-4 py-2 text-center">{member.days_in_faction}</td>
                  <td className="px-4 py-2 text-center">{member.last_action}</td>
                  <td className="px-4 py-2 text-center">{member.position}</td>
                  <td className="px-4 py-2 text-center">{member.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Members;
