import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './BillList.css';

function BillList() {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newBill, setNewBill] = useState({
    name: "",
    status: "Pending",
    link1: "",
    link2: "",
    link3: "",
  });

  const fetchBills = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/getAllBill`);
      if (!response.ok) throw new Error("Failed to fetch bills");
      const data = await response.json();
      setBills(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleAddBill = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/addBill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBill),
      });
      if (!response.ok) throw new Error("Failed to add bill");
      const addedBill = await response.json();
      setBills((prev) => [...prev, addedBill]);
      setNewBill({ name: "", status: "Pending", link1: "", link2: "", link3: "" });
      setShowForm(false);
    } catch (err) {
      alert("Error adding bill: " + err.message);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/toggleStatus/${id}`, {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Failed to toggle status");
      const result = await response.json();

      setBills((prev) =>
        prev.map((bill) =>
          bill._id === id ? { ...bill, status: result.status } : bill
        )
      );
    } catch (err) {
      alert("Error toggling status: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("ต้องการลบบิลนี้หรือไม่?")) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API}/deleteBill/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("ลบไม่สำเร็จ");

        setBills((prev) => prev.filter((bill) => bill._id !== id));
      } catch (err) {
        alert("Error deleting bill: " + err.message);
      }
    }
  };

  if (loading) return <div className="bill-loading">Loading bills...</div>;
  if (error) return <div className="bill-error">Error: {error}</div>;

  return (
    <div className="bill-container">
      <div className="bill-header">
        <button className="bill-btn-back" onClick={() => navigate(-1)}>⬅ กลับ</button>
        <h1 className="bill-title">รายการบิลทั้งหมด</h1>
        <button className="bill-btn-add" onClick={() => setShowForm(!showForm)}>
          เพิ่มบิล
        </button>
      </div>

      {showForm && (
        <div className="bill-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="bill-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="bill-modal-close" onClick={() => setShowForm(false)}>&times;</button>
            <form className="bill-form" onSubmit={handleAddBill}>
              <input
                type="text"
                placeholder="ชื่อบิล"
                value={newBill.name}
                onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                required
              />
              <select
                value={newBill.status}
                onChange={(e) => setNewBill({ ...newBill, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="wait">wait</option>
                <option value="Done">Done</option>
              </select>
              <input
                type="text"
                placeholder="ใบแจ้งวางบิล"
                value={newBill.link1}
                onChange={(e) => setNewBill({ ...newBill, link1: e.target.value })}
              />
              <input
                type="text"
                placeholder="เอกสารเรียกเก็บเงิน"
                value={newBill.link2}
                onChange={(e) => setNewBill({ ...newBill, link2: e.target.value })}
              />
              <input
                type="text"
                placeholder="แฟ้มเอกสาร"
                value={newBill.link3}
                onChange={(e) => setNewBill({ ...newBill, link3: e.target.value })}
              />
              <button type="submit" className="bill-btn-submit">บันทึก</button>
            </form>
          </div>
        </div>
      )}

      {bills.length === 0 ? (
        <p className="bill-no-data">ไม่มีข้อมูลบิล</p>
      ) : (
        <table className="bill-table">
          <thead>
            <tr>
              <th className="bill-th">ชื่อบิล (name)</th>
              <th className="bill-th">สถานะ (status)</th>
              <th className="bill-th">ใบแจ้งวางบิล</th>
              <th className="bill-th">เอกสารเรียกเก็บเงิน</th>
              <th className="bill-th">แฟ้มเอกสาร</th>
              <th className="bill-th">Action</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr
                key={bill._id}
                className={`bill-tr ${
                  bill.status === "Done"
                    ? "row-done"
                    : bill.status === "wait"
                    ? "row-wait"
                    : "row-pending"
                }`}
              >
                <td className="bill-td">{bill.name}</td>
                <td className="bill-td">{bill.status}</td>
                <td className="bill-td">
                  <a href={bill.link1} target="_blank" rel="noopener noreferrer" className="bill-link">คลิ๊ก</a>
                </td>
                <td className="bill-td">
                  <a href={bill.link2} target="_blank" rel="noopener noreferrer" className="bill-link">คลิ๊ก</a>
                </td>
                <td className="bill-td">
                  <a href={bill.link3} target="_blank" rel="noopener noreferrer" className="bill-link">คลิ๊ก</a>
                </td>
                <td className="bill-td">
                  <button className="bill-btn-done" onClick={() => toggleStatus(bill._id)}>
                    {bill.status === "Pending"
                      ? "→ wait"
                      : bill.status === "wait"
                      ? "→ Done"
                      : "→ Pending"}
                  </button>
                  <button className="bill-btn-delete" onClick={() => handleDelete(bill._id)}>
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default BillList;
