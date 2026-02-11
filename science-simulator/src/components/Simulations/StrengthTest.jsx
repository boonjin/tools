import React, { useState, useEffect } from 'react';

const StrengthTest = ({ material }) => {
    const [weights, setWeights] = useState(0);
    const [isBroken, setIsBroken] = useState(false);
    const [message, setMessage] = useState("Add weights to test strength.");

    // Reset when material changes
    useEffect(() => {
        setWeights(0);
        setIsBroken(false);
        setMessage("Add weights to test strength.");
    }, [material]);

    const addWeight = () => {
        if (isBroken) return;

        const newWeights = weights + 1;
        setWeights(newWeights);

        // Simple logic: if weights exceed strength, it breaks
        if (newWeights > material.properties.strength) {
            setIsBroken(true);
            setMessage(`Oh no! The ${material.name} broke under the weight!`);
        } else {
            setMessage(`The ${material.name} is holding strong.`);
        }
    };

    const reset = () => {
        setWeights(0);
        setIsBroken(false);
        setMessage("Add weights to test strength.");
    };

    return (
        <div className="simulation-container strength-test">
            <div className="test-display">
                <div className="beam-container">
                    <div className="supports">
                        <div className="support left"></div>
                        <div className="support right"></div>
                    </div>
                    <div
                        className={`material-beam ${isBroken ? 'broken' : ''}`}
                        style={{
                            backgroundColor: material.color,
                            transform: isBroken ? 'rotate(15deg) translateY(20px)' : `translateY(${weights * 2}px)`
                        }}
                    >
                        <span className="material-label">{material.name}</span>
                    </div>
                    {isBroken && (
                        <div
                            className="material-beam broken-part"
                            style={{
                                backgroundColor: material.color,
                                left: '50%',
                                transform: 'rotate(-15deg) translateY(20px)'
                            }}
                        ></div>
                    )}

                    <div className="weight-hanger" style={{ top: isBroken ? '150px' : `${100 + weights * 2}px` }}>
                        <div className="hook"></div>
                        {Array.from({ length: weights }).map((_, i) => (
                            <div key={i} className="weight-block">1kg</div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="controls">
                <p className="status-message">{message}</p>
                <div className="button-group">
                    <button onClick={addWeight} disabled={isBroken} className="action-btn">
                        ➕ Add Weight
                    </button>
                    <button onClick={reset} className="reset-btn">
                        🔄 Reset
                    </button>
                </div>
                <div className="stats">
                    <span>Current Load: {weights} kg</span>
                    <span>Material Strength: {isBroken ? 'Exceeded' : '??'}</span>
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
        }
        .beam-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
        }
        .supports {
          position: absolute;
          top: 100px;
          width: 80%;
          display: flex;
          justify-content: space-between;
        }
        .support {
          width: 20px;
          height: 100px;
          background: #555;
          border-radius: 4px;
        }
        .material-beam {
          position: absolute;
          top: 90px;
          width: 80%;
          height: 20px;
          border-radius: 4px;
          transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        }
        .material-beam.broken {
          width: 45%;
          left: 10%;
          transform-origin: right center;
        }
        .material-beam.broken-part {
          width: 45%;
          left: auto;
          right: 10%;
          transform-origin: left center;
        }
        .material-label {
          font-size: 0.8rem;
          color: rgba(0,0,0,0.6);
          font-weight: bold;
          text-shadow: 0 1px 0 rgba(255,255,255,0.4);
        }
        .weight-hanger {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: top 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          z-index: 3;
        }
        .hook {
          width: 4px;
          height: 40px;
          background: #888;
          margin-bottom: -5px;
        }
        .weight-block {
          width: 60px;
          height: 30px;
          background: #444;
          border: 1px solid #666;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          margin-top: 2px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
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

export default StrengthTest;
