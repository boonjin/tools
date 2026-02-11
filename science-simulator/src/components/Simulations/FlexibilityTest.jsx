import React, { useState, useEffect } from 'react';

const FlexibilityTest = ({ material }) => {
    const [force, setForce] = useState(0);
    const [bendAngle, setBendAngle] = useState(0);
    const [message, setMessage] = useState("Apply force to test flexibility.");

    useEffect(() => {
        setForce(0);
        setBendAngle(0);
        setMessage("Apply force to test flexibility.");
    }, [material]);

    const applyForce = () => {
        if (force >= 10) return;

        const newForce = force + 1;
        setForce(newForce);

        // Calculate bend based on material flexibility property
        // Flexibility 0 = no bend (0 deg)
        // Flexibility 10 = max bend (e.g., 90 deg)
        const maxPossibleBend = material.properties.flexibility * 9; // 0 to 90 degrees
        const currentBend = (newForce / 10) * maxPossibleBend;

        setBendAngle(currentBend);

        if (material.properties.flexibility < 2) {
            setMessage(`The ${material.name} is very stiff. It barely bends.`);
        } else if (material.properties.flexibility < 6) {
            setMessage(`The ${material.name} bends a little bit.`);
        } else {
            setMessage(`The ${material.name} is very flexible! It bends easily.`);
        }
    };

    const reset = () => {
        setForce(0);
        setBendAngle(0);
        setMessage("Apply force to test flexibility.");
    };

    return (
        <div className="simulation-container flexibility-test">
            <div className="test-display">
                <div className="bend-apparatus">
                    <div className="clamp"></div>
                    <div
                        className="material-strip"
                        style={{
                            backgroundColor: material.color,
                            transform: `rotate(${bendAngle}deg)`,
                            transition: 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)'
                        }}
                    >
                        <span className="material-label-strip">{material.name}</span>
                    </div>
                    <div className="force-arrow" style={{
                        opacity: force > 0 ? 1 : 0,
                        transform: `rotate(${bendAngle}deg) translateX(120px) translateY(-20px)`
                    }}>
                        ⬇️ {force}N
                    </div>
                </div>

                <div className="protractor-bg">
                    <div className="tick t-0"></div>
                    <div className="tick t-45"></div>
                    <div className="tick t-90"></div>
                </div>
            </div>

            <div className="controls">
                <p className="status-message">{message}</p>
                <div className="button-group">
                    <button onClick={applyForce} disabled={force >= 10} className="action-btn">
                        💪 Bend It
                    </button>
                    <button onClick={reset} className="reset-btn">
                        🔄 Reset
                    </button>
                </div>
                <div className="stats">
                    <span>Applied Force: {force} N</span>
                    <span>Bend Angle: {Math.round(bendAngle)}°</span>
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
          align-items: center;
          padding-left: 100px;
        }
        .bend-apparatus {
          position: relative;
          z-index: 2;
        }
        .clamp {
          width: 40px;
          height: 60px;
          background: #555;
          border-radius: 4px;
          position: absolute;
          left: -20px;
          top: -30px;
          z-index: 3;
          box-shadow: 2px 2px 5px rgba(0,0,0,0.5);
        }
        .material-strip {
          width: 200px;
          height: 15px;
          border-radius: 0 8px 8px 0;
          transform-origin: left center;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .material-label-strip {
          font-size: 0.7rem;
          color: rgba(0,0,0,0.6);
          font-weight: bold;
          white-space: nowrap;
        }
        .force-arrow {
          position: absolute;
          font-size: 1.5rem;
          font-weight: bold;
          color: #ff6b6b;
          transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
          pointer-events: none;
        }
        .protractor-bg {
          position: absolute;
          top: 50%;
          left: 100px;
          width: 250px;
          height: 250px;
          border: 2px dashed rgba(255,255,255,0.1);
          border-radius: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }
        .tick {
          position: absolute;
          background: rgba(255,255,255,0.2);
          transform-origin: left center;
          left: 50%;
          top: 50%;
          width: 125px;
          height: 1px;
        }
        .t-0 { transform: rotate(0deg); }
        .t-45 { transform: rotate(45deg); }
        .t-90 { transform: rotate(90deg); }
        
        /* Reuse controls styles from StrengthTest if possible, or duplicate for isolation */
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

export default FlexibilityTest;
