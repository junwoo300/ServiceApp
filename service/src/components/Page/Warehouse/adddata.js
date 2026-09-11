import React, { useState } from 'react';

import '../../imp-menu.css';
import { Link } from 'react-router-dom';

import { create } from '../../../funtions/product';

const Adddata = () => {
  const [form, setForm] = useState({
    name: '',
    detail: '',
    price: '',
    income: '',
    balance: '',
    borrowed: '',
    unit: 'EA' // เริ่มต้นเลือก EA
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    create(form)
      .then(res => {
        console.log(res.data);
        alert("ทำการบันทึกของเข้าคลังเรียบร้อย");
        window.location.href = '/Wherehouse';
      })
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <br />
      <div className='img-add'>
        <a href='/'>
          <img src="/imagenakub/home.png" />
        </a>
        <a href='/Wherehouse'>
          <img src="/imagenakub/report.png" />
        </a>
      </div>
      <br /><br />
      <center>
        <h2>กรุณาเพิ่มของที่ต้องการเข้าคลัง</h2>
        <form onSubmit={handleSubmit}>
          <input
            type='text'
            name='name'
            onChange={handleChange}
            placeholder='Model'
            required
          /> <br /><br />

          <input
            type='text'
            name='detail'
            onChange={handleChange}
            placeholder='detail'
            required
          /><br /><br />

          <input
            type='number'
            name='price'
            onChange={handleChange}
            placeholder='ราคา'
            required
          /><br /><br />

          <input
            type='number'
            name='income'
            onChange={handleChange}
            placeholder='income'
            required
          /><br /><br />

          <input
            type='number'
            name='balance'
            onChange={handleChange}
            placeholder='balance'
            required
          /><br /><br />

<input
            type='number'
            name='outcome'
            onChange={handleChange}
            placeholder='Outcome'
            required
          /><br /><br />

          <input
            type='number'
            name='borrowed'
            onChange={handleChange}
            placeholder='ของที่ยืม'
            required
          /><br /><br />

          <label>หน่วย:</label>
          <select name="unit" onChange={handleChange} value={form.unit}>
            <option value="EA">EA</option>
            <option value="BOX">BOX</option>
          </select>
          <br /><br />

          <button type="submit">บันทึก</button>
        </form>
      </center>
    </div>
  );
}

export default Adddata;
