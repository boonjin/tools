import React, { useState, useEffect } from 'react';

const WaterproofTest = ({ material }) => {
    const [isPouring, setIsPouring] = useState(false);
    const [waterLevel, setWaterLevel] = useState(0);
    const [message, setMessage] = useState("Pour water to test if it's waterproof.");

    useEffect(() => {
        setIsPouring(false);
        setWaterLevel(0);
        setMessage("Pour water to test if it's waterproof.");
    }, [material]);

    const pourWater = () => {
        if (isPouring) return;
        setIsPouring(true);

        // Simulate pouring
        setTimeout(() => {
            setIsPouring(false);
            setWaterLevel(100);

            if (material.properties.waterproof) {
                setMessage(`The ${material.name} is waterproof! Water stays on top.`);
            } else {
                setMessage(`The ${material.name} absorbs water. It is not waterproof.`);
            }
        }, 2000);
    };

    const reset = () => {
        setIsPouring(false);
        setWaterLevel(0);
        setMessage("Pour water to test if it's waterproof.");
    };

    return (
        <div className="simulation-container waterproof-test">
            <div className="test-display">
                <div className="material-surface" style={{ backgroundColor: material.color }}>
                    <span className="surface-label">{material.name}</span>

                    {/* Water Puddle / Absorption Effect */}
                    <div
                        className={`water-effect ${material.properties.waterproof ? 'beading' : 'absorbing'}`}
                        style={{
                            opacity: waterLevel > 0 ? 1 : 0,
                            transition: 'opacity 1s ease'
                        }}
                    >
                        {material.properties.waterproof ? (
                            <>
                                <div className="droplet d1"></div>
                                <div className="droplet d2"></div>
                                <div className="droplet d3"></div>
                                <div className="puddle"></div>
                            </>
                        ) : (
                            <div className="wet-spot"></div>
                        )}
                    </div>
                </div>

                {/* Pouring Animation */}
                <div className={`pitcher ${isPouring ? 'pouring' : ''}`}>
                    <div className="pitcher-body">🫗</div>
                    <div className={`water-stream ${isPouring ? 'flowing' : ''}`}></div>
                </div>
            </div>

            <div className="controls">
                <p className="status-message">{message}</p>
                <div className="button-group">
                    <button onClick={pourWater} disabled={isPouring || waterLevel > 0} className="action-btn">
                        🚿 Pour Water
                    </button>
                    <button onClick={reset} className="reset-btn">
                        🔄 Reset
                    </button>
                </div>
                <div className="stats">
                    <span>Result: {waterLevel > 0 ? (material.properties.waterproof ? 'Waterproof' : 'Absorbent') : 'Pending'}</span>
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
          align-items: center;
        }
        .material-surface {
          width: 200px;
          height: 200px;
          border-radius: 8px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          transform: rotateX(40deg); /* 3D perspective */
          transform-style: preserve-3d;
        }
        .surface-label {
          transform: rotateX(-40deg); /* Counteract parent rotation */
          font-weight: bold;
          color: rgba(0,0,0,0.5);
        }
        .pitcher {
          position: absolute;
          top: 20px;
          right: 100px;
          font-size: 3rem;
          transition: transform 0.5s ease;
          z-index: 10;
        }
        .pitcher.pouring {
          transform: rotate(-45deg) translate(-20px, 20px);
        }
        .water-stream {
          position: absolute;
          top: 40px;
          left: 10px;
          width: 6px;
          height: 0;
          background: rgba(0, 150, 255, 0.6);
          transition: height 0.2s ease;
        }
        .water-stream.flowing {
          height: 150px;
        }
        
        /* Water Effects */
        .water-effect {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        /* Waterproof: Beading */
        .droplet {
          position: absolute;
          background: rgba(200, 230, 255, 0.9);
          border-radius: 50%;
          box-shadow: 1px 1px 2px rgba(0,0,0,0.2);
        }
        .d1 { width: 15px; height: 15px; top: 40%; left: 40%; }
        .d2 { width: 10px; height: 10px; top: 50%; left: 60%; }
        .d3 { width: 20px; height: 20px; top: 60%; left: 30%; }
        .puddle {
          position: absolute;
          top: 45%;
          left: 35%;
          width: 30%;
          height: 20%;
          background: rgba(200, 230, 255, 0.6);
          border-radius: 50%;
          filter: blur(1px);
        }

        /* Absorbent: Wet Spot */
        .wet-spot {
          position: absolute;
          top: 20%;
          left: 20%;
          width: 60%;
          height: 60%;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 50%;
          filter: blur(10px);
          animation: spread 2s ease forwards;
        }
        @keyframes spread {
          from { transform: scale(0); }
          to { transform: scale(1); }
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

export default WaterproofTest;
