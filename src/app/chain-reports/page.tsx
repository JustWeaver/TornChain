"use client"; // Add this line at the top

import { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { format, differenceInSeconds } from 'date-fns';
import { useRouter } from 'next/navigation';

const ChainReports = () => {
  const [chains, setChains] = useState([]);
  const [sortedChains, setSortedChains] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [minHits, setMinHits] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedChains, setSelectedChains] = useState(new Set());
  const router = useRouter();

  const perPage = 20;

  useEffect(() => {
    fetchChainsFromDb();
  }, []);

  const fetchChainsFromDb = async () => {
    try {
      const res = await fetch('/api/chains');
      const data = await res.json();
      if (Array.isArray(data)) {
        setChains(data);
        setSortedChains(data);
      } else {
        console.error('Data is not an array:', data);
      }
    } catch (error) {
      console.error('Error fetching chains from database:', error);
    }
  };

  const handleUpdateChains = async () => {
    const apiKey = localStorage.getItem('apiKey');
    try {
      await axios.post('/api/updateChains', { apiKey });
      fetchChainsFromDb();
    } catch (error) {
      console.error('Error updating chains:', error);
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

  const sortArray = (key, direction) => {
    const sortedArray = [...chains].sort((a, b) => {
      if (key === 'duration') {
        const durationA = b.end_time - b.start_time;
        const durationB = a.end_time - a.start_time;
        return direction === 'ascending' ? durationA - durationB : durationB - durationA;
      }
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setSortedChains(sortedArray);
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

  const handleMinHitsChange = (e) => {
    const value = e.target.value;
    if (value === '' || (Number(value) >= 0 && !isNaN(Number(value)))) {
      setMinHits(value);
      filterChains(value, startDate, endDate);
    }
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    filterChains(minHits, date, endDate);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    filterChains(minHits, startDate, date);
  };

  const filterChains = (minHits, startDate, endDate) => {
    const filteredChains = chains.filter(chain => {
      const chainStartDate = new Date(chain.start_time * 1000);
      const chainEndDate = new Date(chain.end_time * 1000);
      return (!minHits || chain.chain >= minHits) &&
             (!startDate || chainStartDate >= startDate) &&
             (!endDate || chainEndDate <= endDate);
    });
    setSortedChains(filteredChains);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCheckboxChange = (id) => {
    const newSelectedChains = new Set(selectedChains);
    if (newSelectedChains.has(id)) {
      newSelectedChains.delete(id);
    } else {
      newSelectedChains.add(id);
    }
    setSelectedChains(newSelectedChains);
  };

  const handleViewSelected = () => {
    if (selectedChains.size === 1) {
      const [chainId] = selectedChains;
      router.push(`/chain-reports/${chainId}`);
    } else if (selectedChains.size > 1) {
      router.push(`/chain-reports/aggregate?ids=${Array.from(selectedChains).join(',')}`);
    }
  };

  const paginatedChains = sortedChains.slice((currentPage - 1) * perPage, currentPage * perPage);

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const calculateDuration = (start, end) => {
    const durationInSeconds = differenceInSeconds(new Date(end * 1000), new Date(start * 1000));
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = durationInSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const minStartDate = chains.length ? new Date(Math.min(...chains.map(chain => chain.start_time * 1000))) : null;
  const maxEndDate = chains.length ? new Date(Math.max(...chains.map(chain => chain.end_time * 1000))) : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="p-4 flex flex-col items-center">
        <button onClick={handleUpdateChains} className="bg-blue-500 px-4 py-2 mb-4 rounded hover:bg-blue-600">
          Update Chains
        </button>
        <div className="flex flex-wrap justify-center items-center gap-4 mb-4">
          <input
            type="number"
            placeholder="Min Hits"
            value={minHits}
            onChange={handleMinHitsChange}
            className="p-2 border rounded bg-transparent text-white"
            min="0"
          />
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            placeholderText="Start Date"
            className="p-2 border rounded bg-transparent text-white"
            minDate={minStartDate}
            maxDate={maxEndDate}
          />
          <DatePicker
            selected={endDate}
            onChange={handleEndDateChange}
            placeholderText="End Date"
            className="p-2 border rounded bg-transparent text-white"
            minDate={minStartDate}
            maxDate={maxEndDate}
          />
        </div>
        <button onClick={handleViewSelected} className="bg-green-500 px-4 py-2 rounded hover:bg-green-600">
          View Selected
        </button>
      </div>
      <main className="flex-1 p-2 sm:p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="container mx-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="px-4 py-2 text-center">
                  Select
                </th>
                <th className="px-4 py-2 text-center" onClick={() => requestSort('id')}>
                  Chain ID {getSortIcon('id')}
                </th>
                <th className="px-4 py-2 text-center" onClick={() => requestSort('chain')}>
                  Hits {getSortIcon('chain')}
                </th>
                <th className="px-4 py-2 text-center" onClick={() => requestSort('respect')}>
                  Respect {getSortIcon('respect')}
                </th>
                <th className="px-4 py-2 text-center" onClick={() => requestSort('start_time')}>
                  Start Time {getSortIcon('start_time')}
                </th>
                <th className="px-4 py-2 text-center" onClick={() => requestSort('end_time')}>
                  End Time {getSortIcon('end_time')}
                </th>
                <th className="px-4 py-2 text-center" onClick={() => requestSort('duration')}>
                  Duration {getSortIcon('duration')}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedChains.map((chain) => (
                <tr key={chain.id} className="border-t">
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedChains.has(chain.id)}
                      onChange={() => handleCheckboxChange(chain.id)}
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <a
                      href="#"
                      className="text-blue-500 hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/chain-reports/${chain.id}`);
                      }}
                    >
                      {chain.id}
                    </a>
                  </td>
                  <td className="px-4 py-2 text-center">{formatNumber(chain.chain)}</td>
                  <td className="px-4 py-2 text-center">{formatNumber(Math.round(chain.respect))}</td>
                  <td className="px-4 py-2 text-center">{format(new Date(chain.start_time * 1000), 'PPpp')}</td>
                  <td className="px-4 py-2 text-center">{format(new Date(chain.end_time * 1000), 'PPpp')}</td>
                  <td className="px-4 py-2 text-center">{calculateDuration(chain.start_time, chain.end_time)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center mt-4">
            {Array.from({ length: Math.ceil(sortedChains.length / perPage) }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-1 mx-1 border rounded ${index + 1 === currentPage ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700'}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChainReports;
