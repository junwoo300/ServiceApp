import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './imp-menu.css';
import Modal from 'react-modal';
import { FaEdit } from 'react-icons/fa';
import { AiFillDelete } from 'react-icons/ai';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

import { remove, getdata, update, create } from '../funtions/product';

Modal.setAppElement('#root');

const FormProduct = () => {
    const [data, setData] = useState([]);
    const [form, setForm] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        setFilteredData(
            data.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, data]);

    const loadData = async () => {
        try {
            const res = await getdata();
            setData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleRemove = (id) => {
        confirmAlert({
            title: 'Confirm to delete',
            message: 'จะลบแน่นะ ?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        try {
                            await remove(id);
                            loadData();
                        } catch (err) {
                            console.error(err);
                        }
                    }
                },
                {
                    label: 'No',
                    onClick: () => console.log('Delete cancelled')
                }
            ]
        });
    };

    const handleEdit = (item) => {
        setForm(item);
        setIsEditing(true);
        setModalIsOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await update(form._id, form);
                setIsEditing(false);
            } else {
                await create(form);
            }
            setModalIsOpen(false);
            loadData();
            setForm({});
        } catch (err) {
            console.error(err);
        }
    };

    const exportToExcel = () => {
        const exportData = filteredData.map(({ _id, name, income, balance, outcome, borrowed, unit, detail, price }, index) => ({
            No: index + 1,
            Model: name,
            'Income Stock': income,
            Balance: balance,
            'Outcome Stock': outcome,
            'ของที่ยืม': borrowed,
            UNIT: unit,
            detail: detail,
            price: price
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(dataBlob, 'product_data.xlsx');
    };

    const importFromExcel = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const workbook = XLSX.read(event.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const importedData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            importedData.forEach(item => {
                create(item).catch(err => console.error(err));
            });

            loadData();
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div>
            <br />
            <div className='img-add'>
                <a href='/'><img src="/imagenakub/home.png" alt="Home" /></a>
                <a href='/Wherehouse/adddata'><img src="/imagenakub/add.png" alt="Add" /></a>

                <div className='appfind'>
                    <input
                        type="text"
                        placeholder="ค้นหา..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <br />
            <center>รายการของในคลัง SERVICE </center>
            <br />
            <br />
            <div className="button-container">
                <button onClick={exportToExcel}>Export to Excel</button>
                
                <input id="file-upload" type="file" onChange={importFromExcel} />
            </div>
            <center>
                <div className="tablelist-container">
                    <table className="tablelist-table" border={2}>
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Model</th>
                                <th scope="col">Income Stock</th>
                                <th scope="col">Balance</th>
                                <th scope="col">Outcome Stock</th>
                                <th scope="col">ของที่ยืม</th>
                                <th scope="col">UNIT</th>
                                <th scope="col">detail</th>
                                <th scope="col">price</th>
                                <th scope="col">action</th>
                                <th scope="col">edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.name}</td>
                                    <td>{item.income}</td>
                                    <td>{item.balance}</td>
                                    <td>{item.outcome}</td>
                                    <td>{item.borrowed}</td>
                                    <td>{item.unit}</td>
                                    <td>{item.detail}</td>
                                    <td>{item.price}</td>
                                    <td onClick={() => handleRemove(item._id)}>
                                        <center><AiFillDelete /></center>
                                    </td>
                                    <td onClick={() => handleEdit(item)}>
                                        <center><FaEdit /></center>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </center>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                contentLabel="Edit Product"
                className="Modal"
                overlayClassName="Overlay"
            >
                <h3>{isEditing ? 'Edit Product' : 'Add Product'}</h3>
                <form onSubmit={handleSave}>
                    <div>
                        <label>ชื่อ:</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="name"
                            value={form.name || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>จำนวนที่รับเข้ามา:</label>
                        <input
                            type="number"
                            name="income"
                            placeholder="Income Stock"
                            value={form.income || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>ยอดคงเหลือ:</label>
                        <input
                            type="number"
                            name="balance"
                            placeholder="Balance"
                            value={form.balance || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>จำนวนที่เบิกออก:</label>
                        <input
                            type="number"
                            name="outcome"
                            placeholder="Outcome Stock"
                            value={form.outcome || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>ของที่ยืม:</label>
                        <input
                            type="number"
                            name="borrowed"
                            placeholder="ของที่ยืม"
                            value={form.borrowed || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>หน่วย:</label>
                        <input
                            type="text"
                            name="unit"
                            placeholder="UNIT"
                            value={form.unit || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>รายละเอียด:</label>
                        <input
                            type="text"
                            name="detail"
                            placeholder="detail"
                            value={form.detail || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>ราคา:</label>
                        <input
                            type="number"
                            name="price"
                            placeholder="price"
                            value={form.price || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit">บันทึก</button>
                    <button type="button" onClick={() => setModalIsOpen(false)}>ยกเลิก</button>
                </form>
            </Modal>
        </div>
    );
};

export default FormProduct;
