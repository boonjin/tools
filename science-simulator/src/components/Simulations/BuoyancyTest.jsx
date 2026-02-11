import React, { useState, useEffect } from 'react';

const BuoyancyTest = ({ material }) => {
    const [isDropped, setIsDropped] = useState(false);
    const [message, setMessage] = useState("Drop the object to see if it floats or sinks.");

    useEffect(() => {
        setIsDropped(false);
        setMessage("Drop the object to see if it floats or sinks.");
    }, [material]);

    const dropObject = () => {
        setIsDropped(true);
        if (material.properties.buoyancy) {
            setMessage(`The ${material.name} floats on water!`);
        } else {
            setMessage(`The ${material.name} sinks in water.`);
        }
    };

    const reset = () => {
        setIsDropped(false);
        setMessage("Drop the object to see if it floats or sinks.");
    };

    return (
        <div className="simulation-container buoyancy-test">
            <div className="test-display">
                <div className="water-tank">
                    <div className="water-surface"></div>
                    <div className="water-body">
                        {/* Bubbles for effect */}
                        <div className="bubble b1"></div>
                        <div className="bubble b2"></div>
                        <div className="bubble b3"></div>
                    </div>

                    <div
                        className={`test-object ${isDropped ? (material.properties.buoyancy ? 'floating' : 'sinking') : 'holding'}`}
                        style={{
                            backgroundColor: material.color,
                        }}
                    >
                        <span className="object-label">{material.name}</span>
                    </div>
                </div>
            </div>

            <div className="controls">
                <p className="status-message">{message}</p>
                <div className="button-group">
                    <button onClick={dropObject} disabled={isDropped} className="action-btn">
                        💧 Drop Object
                    </button>
                    <button onClick={reset} className="reset-btn">
                        🔄 Reset
                    </button>
                </div>
                <div className="stats">
                    <span>Result: {isDropped ? (material.properties.buoyancy ? 'Floats' : 'Sinks') : 'Pending'}</span>
                </div>
            </div>

            <style>{`
        .simulation-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          padding: 1rem;
        }
        .test-display {
          width: 100%;
          height: 300px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          margin-bottom: 1rem;
          display: flex;
          justify-content: center;
          align-items: flex-end;
        }
        .water-tank {
          width: 80%;
          height: 80%;
          position: relative;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: none;
          border-radius: 0 0 12px 12px;
          background: rgba(0, 100, 255, 0.1);
          overflow: hidden;
        }
        .water-surface {
          position: absolute;
          top: 20%;
          width: 100%;
          height: 2px;
          background: rgba(255, 255, 255, 0.5);
          z-index: 2;
        }
        .water-body {
          position: absolute;
          top: 20%;
          width: 100%;
          height: 80%;
          background: linear-gradient(to bottom, rgba(0, 150, 255, 0.4), rgba(0, 100, 255, 0.6));
          z-index: 1;
        }
        .test-object {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.2);
          transition: top 1s cubic-bezier(0.45, 0.05, 0.55, 0.95);
          z-index: 3;
        }
        .object-label {
          font-size: 0.6rem;
          color: rgba(0,0,0,0.7);
          font-weight: bold;
          text-align: center;
          line-height: 1;
        }
        
        /* States */
        .holding {
          top: 5%; /* Above water */
        }
        .floating {
          top: 15%; /* Just bobbing on surface (surface is at 20%) */
          animation: bob 2s infinite ease-in-out;
        }
        .sinking {
          top: 85%; /* Bottom of tank */
        }

        @keyframes bob {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(5px); }
        }

        .bubble {
          position: absolute;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: rise 4s infinite linear;
        }
        .b1 { width: 10px; height: 10px; left: 20%; bottom: -10px; animation-delay: 0s; }
        .b2 { width: 15px; height: 15px; left: 60%; bottom: -15px; animation-delay: 1s; }
        .b3 { width: 8px; height: 8px; left: 80%; bottom: -8px; animation-delay: 2.5s; }

        @keyframes rise {
          0% { bottom: -20px; opacity: 0; }
          50% { opacity: 1; }
          100% { bottom: 100%; opacity: 0; }
        }

        /* Reuse controls styles */
        .controls {
          text-align: center;
          width: 100%;
        }
        .status-message {
          font-size: 1.2rem;
          margin-bottom: 1rem;
          min-height: 1.8rem;
        }
        .button-group {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .action-btn {
          background: #4facfe;
          color: white;
          font-weight: bold;
        }
        .action-btn:disabled {
          background: #555;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .reset-btn {
          background: #ff6b6b;
          color: white;
        }
        .stats {
          display: flex;
          justify-content: space-around;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.6);
          background: rgba(0,0,0,0.2);
          padding: 0.5rem;
          border-radius: 8px;
        }
      `}</style>
        </div>
    );
};

export default BuoyancyTest;
