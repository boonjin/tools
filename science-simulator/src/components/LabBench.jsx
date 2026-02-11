import React, { useState } from 'react';
import MaterialSelector from './MaterialSelector';
import StrengthTest from './Simulations/StrengthTest';
import FlexibilityTest from './Simulations/FlexibilityTest';
import BuoyancyTest from './Simulations/BuoyancyTest';
import WaterproofTest from './Simulations/WaterproofTest';
import TransparencyTest from './Simulations/TransparencyTest';
import { materials } from '../data/materials';

const LabBench = () => {
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [activeTest, setActiveTest] = useState(null);

    const tests = [
        { id: 'strength', name: 'Strength Test', icon: '💪' },
        { id: 'flexibility', name: 'Flexibility Test', icon: '〰️' },
        { id: 'buoyancy', name: 'Float/Sink', icon: '🌊' },
        { id: 'waterproof', name: 'Waterproof', icon: '💧' },
        { id: 'transparency', name: 'Transparency', icon: '🔦' },
    ];

    return (
        <div className="lab-bench">
            <header className="lab-header">
                <h2>Science Lab: Diversity of Materials</h2>
                <p>Select a material and a test to investigate its properties.</p>
            </header>

            <MaterialSelector
                selectedMaterial={selectedMaterial}
                onSelect={(m) => {
                    setSelectedMaterial(m);
                    setActiveTest(null); // Reset test when material changes
                }}
            />

            {selectedMaterial && (
                <div className="test-selection">
                    <h3>Select a Test for {selectedMaterial.name}</h3>
                    <div className="test-grid">
                        {tests.map((test) => (
                            <button
                                key={test.id}
                                className={`test-btn ${activeTest === test.id ? 'active' : ''}`}
                                onClick={() => setActiveTest(test.id)}
                            >
                                <span className="test-icon">{test.icon}</span>
                                <span>{test.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="simulation-area">
                {selectedMaterial && activeTest ? (
                    <div className="simulation-wrapper">
                        {activeTest === 'strength' && <StrengthTest material={selectedMaterial} />}
                        {activeTest === 'flexibility' && <FlexibilityTest material={selectedMaterial} />}
                        {activeTest === 'buoyancy' && <BuoyancyTest material={selectedMaterial} />}
                        {activeTest === 'waterproof' && <WaterproofTest material={selectedMaterial} />}
                        {activeTest === 'transparency' && <TransparencyTest material={selectedMaterial} />}
                        {activeTest !== 'strength' && activeTest !== 'flexibility' && activeTest !== 'buoyancy' && activeTest !== 'waterproof' && activeTest !== 'transparency' && (
                            <div className="simulation-placeholder">
                                <h3>Running {tests.find(t => t.id === activeTest).name} on {selectedMaterial.name}</h3>
                                <p>Simulation component coming soon...</p>
                            </div>
                        )}
                    </div>
                ) : (
                    !selectedMaterial && (
                        <div className="empty-state">
                            <p>👈 Start by selecting a material above</p>
                        </div>
                    )
                )}
            </div>

            <style>{`
        .lab-bench {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .lab-header h2 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .test-selection {
          animation: fadeIn 0.5s ease;
        }
        .test-grid {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 1rem;
        }
        .test-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          width: 120px;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .test-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        .test-btn.active {
          background: rgba(79, 172, 254, 0.2);
          border-color: #4facfe;
          box-shadow: 0 0 15px rgba(79, 172, 254, 0.3);
        }
        .test-icon {
          font-size: 2rem;
        }
        .simulation-area {
          min-height: 300px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed rgba(255, 255, 255, 0.1);
          margin-top: 1rem;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default LabBench;
