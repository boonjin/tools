import React from 'react';
import { materials } from '../data/materials';

const MaterialSelector = ({ selectedMaterial, onSelect }) => {
    return (
        <div className="material-selector">
            <h3>Choose a Material</h3>
            <div className="material-grid">
                {Object.values(materials).map((material) => (
                    <button
                        key={material.id}
                        className={`material-btn ${selectedMaterial?.id === material.id ? 'active' : ''}`}
                        onClick={() => onSelect(material)}
                        style={{
                            borderColor: selectedMaterial?.id === material.id ? material.color : 'transparent',
                            boxShadow: selectedMaterial?.id === material.id ? `0 0 10px ${material.color}` : 'none'
                        }}
                    >
                        <div
                            className="material-preview"
                            style={{ backgroundColor: material.color }}
                        ></div>
                        <span>{material.name}</span>
                    </button>
                ))}
            </div>

            <style>{`
        .material-selector {
          margin-bottom: 2rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .material-selector h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
        }
        .material-grid {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .material-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0, 0, 0, 0.3);
          border: 2px solid transparent;
          padding: 1rem;
          border-radius: 12px;
          transition: all 0.3s ease;
          width: 100px;
        }
        .material-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
        .material-btn.active {
          background: rgba(255, 255, 255, 0.15);
        }
        .material-preview {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
        </div>
    );
};

export default MaterialSelector;
