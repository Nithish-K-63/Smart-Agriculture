import React, { createContext, useState, useEffect, useContext } from 'react';

const FarmContext = createContext();

export const useFarm = () => useContext(FarmContext);

export const FarmProvider = ({ children }) => {
  // Core State
  const [controlMode, setControlMode] = useState('Automatic'); // Manual, Automatic, AI-Predictive
  const [waterTankLevel, setWaterTankLevel] = useState(85.5); // %
  const [pumpState, setPumpState] = useState('OFF'); // ON, OFF, FAULT
  const [flowRate, setFlowRate] = useState(0); // L/min
  const [isRaining, setIsRaining] = useState(false);
  const [rainDelayActive, setRainDelayActive] = useState(false);
  
  // Nodes state
  const [nodes, setNodes] = useState([
    {
      id: 1,
      name: 'North Corn Field',
      macAddress: 'AA:BB:CC:DD:EE:FF',
      status: 'Online',
      moisture: 24.5,
      wiltingPoint: 18.0,
      fieldCapacity: 35.0,
      temperature: 32.5,
      humidity: 45.0,
      pH: 6.3,
      nitrogen: 45,
      phosphorus: 32,
      potassium: 54,
      battery: 4.12,
      rssi: -65
    },
    {
      id: 2,
      name: 'South Wheat Field',
      macAddress: 'AA:BB:CC:11:22:33',
      status: 'Online',
      moisture: 28.1,
      wiltingPoint: 20.0,
      fieldCapacity: 33.0,
      temperature: 30.2,
      humidity: 48.0,
      pH: 6.8,
      nitrogen: 50,
      phosphorus: 35,
      potassium: 60,
      battery: 3.98,
      rssi: -72
    },
    {
      id: 3,
      name: 'East Veg Plot',
      macAddress: 'AA:BB:CC:44:55:66',
      status: 'Online',
      moisture: 19.5,
      wiltingPoint: 22.0,
      fieldCapacity: 38.0,
      temperature: 28.8,
      humidity: 55.0,
      pH: 5.9,
      nitrogen: 40,
      phosphorus: 28,
      potassium: 45,
      battery: 4.05,
      rssi: -58
    }
  ]);

  // Logs & Alerts
  const [toasts, setToasts] = useState([]);
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'Warning', module: 'Power', message: 'Node 2 battery level dropping (3.98V)', status: 'Active', timestamp: '10:45' }
  ]);
  
  const [activityLogs, setActivityLogs] = useState([
    { id: 1, action: 'SYSTEM_BOOT', details: 'All ESP32 nodes connected successfully', source: 'System', timestamp: '10:00' }
  ]);

  // Historical readings cache for Recharts (past 5 intervals)
  const [historyData, setHistoryData] = useState([
    { time: '10:00', 'North Corn': 26.1, 'South Wheat': 29.5, 'East Veg': 21.0 },
    { time: '10:15', 'North Corn': 25.7, 'South Wheat': 29.1, 'East Veg': 20.6 },
    { time: '10:30', 'North Corn': 25.2, 'South Wheat': 28.7, 'East Veg': 20.1 },
    { time: '10:45', 'North Corn': 24.8, 'South Wheat': 28.4, 'East Veg': 19.8 },
    { time: '11:00', 'North Corn': 24.5, 'South Wheat': 28.1, 'East Veg': 19.5 }
  ]);

  // Custom Functions
  const addToast = (type, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const addLog = (action, details, source = 'System') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setActivityLogs(prev => [
      { id: Date.now(), action, details, source, timestamp },
      ...prev.slice(0, 19)
    ]);
    if (action.includes('IRRIG') || action.includes('OVERRIDE') || action.includes('TANK')) {
      addToast('info', `${action.replace(/_/g, ' ')}: ${details}`);
    }
  };

  const addAlert = (type, module, message) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAlerts(prev => [
      { id: Date.now(), type, module, message, status: 'Active', timestamp },
      ...prev
    ]);
    addLog('ALERT_TRIGGERED', `${type}: ${message}`, 'Alert Engine');
    addToast(type.toLowerCase(), `${module}: ${message}`);
  };

  const clearAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
    addLog('ALERT_RESOLVED', `Resolved alert index ID ${id}`, 'User');
  };

  // Toggle Pump Switch
  const togglePump = (state) => {
    if (state === 'ON') {
      if (waterTankLevel <= 10) {
        addAlert('Critical', 'Irrigation', 'Cannot start pump: Water Tank Level is too low (<10%)');
        return;
      }
      setPumpState('ON');
      setFlowRate(15.4);
      addLog('MANUAL_OVERRIDE_START', 'User initiated manual pump start override', 'User');
    } else {
      setPumpState('OFF');
      setFlowRate(0);
      addLog('MANUAL_OVERRIDE_STOP', 'User turned pump OFF manually', 'User');
    }
  };

  // Trigger Custom Refill Tank simulation
  const refillTank = () => {
    setWaterTankLevel(100.0);
    addLog('TANK_REFILL', 'Water storage tank refilled to 100%', 'User');
  };

  // Core Simulation Loop (Runs every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Simulate environmental decay
      setNodes(prevNodes => 
        prevNodes.map(node => {
          let nextMoisture = node.moisture;
          
          if (isRaining) {
            // Moisture rises if raining
            nextMoisture = Math.min(100, parseFloat((nextMoisture + 0.8).toFixed(1)));
          } else if (pumpState === 'ON' && node.status === 'Online') {
            // Moisture rises if pump is watering
            nextMoisture = Math.min(node.fieldCapacity + 2, parseFloat((nextMoisture + 0.5).toFixed(1)));
          } else {
            // Moisture naturally depletes
            nextMoisture = Math.max(0, parseFloat((nextMoisture - 0.15).toFixed(2)));
          }

          // Trigger alerts based on thresholds
          if (nextMoisture <= node.wiltingPoint && node.moisture > node.wiltingPoint) {
            addAlert('Warning', 'Sensor', `${node.name} moisture fell below Wilting Point (${node.wiltingPoint}%)`);
          }

          return { ...node, moisture: nextMoisture };
        })
      );

      // 2. Adjust Water Tank and Flow Rate if pump is ON
      if (pumpState === 'ON') {
        setWaterTankLevel(prev => {
          const nextLevel = parseFloat((prev - 0.4).toFixed(1));
          if (nextLevel <= 10) {
            setPumpState('OFF');
            setFlowRate(0);
            addAlert('Critical', 'Irrigation', 'Emergency Shutdown: Water Tank level empty (<10%)');
            return 10.0;
          }
          return nextLevel;
        });
      }

      // 3. Automated logic loops based on Mode
      const cornNode = nodes[0];
      
      if (controlMode === 'Automatic') {
        if (cornNode.moisture < cornNode.wiltingPoint && pumpState === 'OFF') {
          // Trigger automatic start
          if (waterTankLevel > 10 && !isRaining) {
            setPumpState('ON');
            setFlowRate(15.4);
            addLog('AUTO_IRRIGATION_START', `Soil moisture (${cornNode.moisture}%) below threshold. Starting pump.`, 'Rules Engine');
          }
        } else if (cornNode.moisture >= cornNode.fieldCapacity && pumpState === 'ON') {
          // Trigger automatic stop
          setPumpState('OFF');
          setFlowRate(0);
          addLog('AUTO_IRRIGATION_STOP', `Soil moisture (${cornNode.moisture}%) reached Field Capacity. Stopping pump.`, 'Rules Engine');
        }
      } else if (controlMode === 'AI-Predictive') {
        // AI-Predictive includes Rain Delay checks
        if (isRaining && pumpState === 'ON') {
          setPumpState('OFF');
          setFlowRate(0);
          setRainDelayActive(true);
          addLog('AI_RAIN_DELAY', 'AI Prediction: Rainfall detected. Pausing scheduled irrigation.', 'AI Engine');
        }
      }

      // 4. Update Recharts historical arrays (simulating past timestamps)
      setHistoryData(prev => {
        const nextTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newRecord = {
          time: nextTime.slice(0, 5),
          'North Corn': nodes[0].moisture,
          'South Wheat': nodes[1].moisture,
          'East Veg': nodes[2].moisture
        };
        return [...prev.slice(1), newRecord];
      });

    }, 3000);

    return () => clearInterval(interval);
  }, [nodes, pumpState, waterTankLevel, controlMode, isRaining]);

  return (
    <FarmContext.Provider value={{
      controlMode,
      setControlMode,
      waterTankLevel,
      pumpState,
      setPumpState,
      flowRate,
      isRaining,
      setIsRaining,
      rainDelayActive,
      nodes,
      setNodes,
      alerts,
      activityLogs,
      historyData,
      togglePump,
      refillTank,
      clearAlert,
      addLog,
      addAlert,
      toasts,
      addToast
    }}>
      {children}
    </FarmContext.Provider>
  );
};
