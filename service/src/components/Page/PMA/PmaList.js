import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './PmaList.css';

const PmaList = () => {
  const [pmas, setPmas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPmas();
  }, []);

  const fetchPmas = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/pmas`);
      setPmas(response.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API}/pma/${id}`);
      alert('Data deleted successfully!');
      fetchPmas(); // Refresh data after deletion
    } catch (err) {
      console.error('Error deleting data:', err.response ? err.response.data : err.message);
      alert('Error deleting data');
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      pmas.map((pma, index) => ({
        '#': index + 1,
        'NUPMA': pma.nupma,
        'Code PMA': pma.codepma,
        'Name': pma.name,
        'Customer': pma.customer,
        'Start Date': new Date(pma.startdate).toLocaleDateString(),
        'Warranty': pma.warranty,
        'End Date': new Date(pma.enddate).toLocaleDateString(),
        'Status': pma.status,
        'Lease': pma.lease,
        'Document': pma.document,
        'SLA': pma.sla,
        'Note': pma.note,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PMA Data');
    XLSX.writeFile(workbook, 'PMA_Data.xlsx');
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Read the first sheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const importedData = XLSX.utils.sheet_to_json(worksheet);

        // Send imported data to the server
        await axios.post(`${process.env.REACT_APP_API}/import-pmas`, importedData);
        alert('Data imported successfully!');
        fetchPmas(); // Refresh data after import
      } catch (err) {
        console.error('Error importing data:', err);
        alert('Error importing data');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const filteredPmas = pmas.filter(pma =>
    pma.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pma-list-container">
      <Link to="/" className="pma-list-btn-home">Home</Link>
      <h1>PMA List</h1>
      <div className="pma-list-top-bar">
        <Link to="/addpma" className="pma-list-btn-add">Add New PMA</Link>
        <input
          type="text"
          className="pma-list-search-input"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <button onClick={handleExport} className="btn-export">Export to Excel</button>
        <input
          type="file"
          id="import-file"
          className="btn-import"
          onChange={handleImport}
          accept=".xlsx, .xls"
          style={{ display: 'none' }} // Hide input to trigger with button
        />
        <button
          className="btn-import"
          onClick={() => document.getElementById('import-file').click()}
        >
          Import from Excel
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>NUPMA</th>
            <th>Code PMA</th>
            <th>Name</th>
            <th>Customer</th>
            <th>Start Date</th>
            <th>Warranty</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Lease</th>
            <th>Document</th>
            <th>SLA</th>
            <th>Note</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  {filteredPmas.map((pma, index) => {
    const isExpired = new Date(pma.enddate) < new Date();
    const statusClass = isExpired ? 'expired' : 'active';

    return (
      <tr key={pma._id}>
        <td>{index + 1}</td>
        <td>{pma.nupma}</td>
        <td>{pma.codepma}</td>
        <td>{pma.name}</td>
        <td>{pma.customer}</td>
        <td>{new Date(pma.startdate).toLocaleDateString()}</td>
        <td>{pma.warranty}</td>
        <td className={statusClass}>{new Date(pma.enddate).toLocaleDateString()}</td>
        <td>{pma.status}</td>
        <td>{pma.lease}</td>

        {/* ทำให้ document เป็นลิงก์คำว่าคลิก */}
        <td>
          <a href={pma.document} target="_blank" rel="noopener noreferrer">
            คลิก
          </a>
        </td>

        {/* ทำให้ SLA เป็นลิงก์คำว่าคลิก */}
        <td>
          <a href={pma.sla} target="_blank" rel="noopener noreferrer">
            คลิก
          </a>
        </td>

        <td>{pma.note}</td>
        <td>
          <button onClick={() => handleDelete(pma._id)} className="btn btn-delete">Delete</button>
          <Link to={`/edit-pma/${pma._id}`} className="btn btn-edit">Edit</Link>
          <Link to={`/pma-info/${pma._id}`} className="btn btn-info">Info</Link>
        </td>
      </tr>
    );
  })}
</tbody>

      </table>
    </div>
  );
};

export default PmaList;
