import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";
import "./RobotChart.css";

const RobotChart = () => {
  const [robotData, setRobotData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [modelColors, setModelColors] = useState({});

  useEffect(() => {
    const fetchRobotData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/robots`);
        setRobotData(response.data);
      } catch (error) {
        console.error("Error fetching robot data:", error);
      }
    };

    fetchRobotData();
  }, []);

  const totalRobots = robotData.length;

  const getRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  };

  const locationData = robotData.reduce((acc, robot) => {
    const modelName = robot.model ? robot.model.toUpperCase() : "UNKNOWN";
    const location = robot.location || "UNKNOWN";
    if (!acc[location]) acc[location] = { location };
    acc[location][modelName] = (acc[location][modelName] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.values(locationData);

  useEffect(() => {
    const uniqueModels = Array.from(new Set(robotData.map(r => r.model?.toUpperCase() || "UNKNOWN")));
    const newModelColors = {};
    uniqueModels.forEach(model => {
      if (!modelColors[model]) {
        newModelColors[model] = getRandomColor();
      } else {
        newModelColors[model] = modelColors[model];
      }
    });
    setModelColors(newModelColors);
  }, [robotData]);

  const handleBarClick = (data) => {
    if (data && data.location) {
      const filteredRobots = robotData.filter(robot => robot.location === data.location);
      setSelectedLocation(data.location);
      setModalData(filteredRobots);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="robot-chart-container">
      <button className="robot-back-button" onClick={handleBack}>
        ← Back
      </button>
      <h2>จำนวนหุ่นยนต์แต่ละไซต์</h2>
      <ResponsiveContainer
        width="100%"
        height={Math.max(600, chartData.length * 50)} // ✅ ปรับความสูงอัตโนมัติตามจำนวนไซต์
      >
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 20, right: 40, left: 120, bottom: 40 }}
          onClick={(e) => handleBarClick(e?.activePayload?.[0]?.payload)}
        >
          <XAxis type="number" allowDecimals={false} />
          <YAxis
            dataKey="location"
            type="category"
            width={200} // ✅ เพิ่มความกว้างให้ชื่อไซต์
            tick={{
              angle: 0, // ✅ ไม่หมุน (อ่านง่าย)
              fontSize: 14,
              fill: "#333",
              dx: -5,
              dy: 4,
            }}
          />
          <Tooltip />
          <Legend />
          {Object.keys(modelColors).map((model) => (
            <Bar
              key={model}
              dataKey={model}
              stackId="robot"
              fill={modelColors[model]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      <div className="robot-total-count">
        <h3>จำนวนหุ่นยนต์ทั้งหมด: {totalRobots} ตัว</h3>
      </div>

      {selectedLocation && (
        <div className="robot-modal">
          <div className="robot-modal-content">
            <h3>📍 รายละเอียดหุ่นยนต์ใน {selectedLocation}</h3>
            <ul>
              {modalData.map(robot => (
                <li key={robot.vin}>
                  <strong>VIN:</strong> {robot.vin} | <strong>Model:</strong> {robot.model}
                </li>
              ))}
            </ul>
            <button onClick={() => setSelectedLocation(null)}>ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RobotChart;
