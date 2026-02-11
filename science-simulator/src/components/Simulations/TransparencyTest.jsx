import React, { useState, useEffect } from 'react';

const TransparencyTest = ({ material }) => {
    const [isLightOn, setIsLightOn] = useState(false);
    const [message, setMessage] = useState("Turn on the flashlight to test transparency.");

    useEffect(() => {
        setIsLightOn(false);
        setMessage("Turn on the flashlight to test transparency.");
    }, [material]);

    const toggleLight = () => {
        const newState = !isLightOn;
        setIsLightOn(newState);

        if (newState) {
            if (material.properties.transparency === 'transparent') {
                setMessage(`The ${material.name} is transparent. Light passes through clearly.`);
            } else if (material.properties.transparency === 'translucent') {
                setMessage(`The ${material.name} is translucent. Some light passes through.`);
            } else {
                setMessage(`The ${material.name} is opaque. No light passes through.`);
            }
        } else {
            setMessage("Turn on the flashlight to test transparency.");
        }
    };

    const reset = () => {
        setIsLightOn(false);
        setMessage("Turn on the flashlight to test transparency.");
    };

    // Determine light opacity based on material property
    const getLightOpacity = () => {
        if (!isLightOn) return 0;
        switch (material.properties.transparency) {
            case 'transparent': return 0.9;
            case 'translucent': return 0.4;
            case 'opaque': return 0;
            default: return 0;
        }
    };

    return (
        <div className="simulation-container transparency-test">
            <div className="test-display">
                <div className="scene">
                    {/* Background Object to see through */}
                    <div className="hidden-object">
                        🧸
                    </div>

                    {/* Material Layer */}
                    <div
                        className="material-layer"
                        style={{
                            backgroundColor: material.color,
                            opacity: material.properties.transparency === 'transparent' ? 0.3 : (material.properties.transparency === 'translucent' ? 0.7 : 1)
                        }}
                    >
                        <span className="layer-label">{material.name}</span>
                    </div>

                    {/* Flashlight Beam */}
                    <div
                        className={`flashlight-beam ${isLightOn ? 'on' : ''}`}
                        style={{
                            '--light-opacity': getLightOpacity()
                        }}
                    >
                        <div className="beam-cone"></div>
                        <div className="beam-through"></div>
                    </div>

                    <div className="flashlight">
                        🔦
                    </div>
                </div>
            </div>

            <div className="controls">
                <p className="status-message">{message}</p>
                <div className="button-group">
                    <button onClick={toggleLight} className={`action-btn ${isLightOn ? 'active-toggle' : ''}`}>
                        {isLightOn ? '🔦 Turn Off' : '🔦 Turn On'}
                    </button>
                    <button onClick={reset} className="reset-btn">
                        🔄 Reset
                    </button>
                </div>
                <div className="stats">
                    <span>Result: {isLightOn ? material.properties.transparency.charAt(0).toUpperCase() + material.properties.transparency.slice(1) : 'Pending'}</span>
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
          background: #1a1a1a;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          margin-bottom: 1rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .scene {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hidden-object {
          font-size: 5rem;
          position: absolute;
          left: 70%;
          z-index: 1;
          filter: brightness(0.2); /* Dark by default */
          transition: filter 0.3s ease;
        }
        .flashlight-beam.on ~ .hidden-object {
           /* If light passes through, illuminate object */
        }
        
        /* We need to simulate light passing through using the beam-through opacity */
        
        .material-layer {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 200px;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 0 10px rgba(0,0,0,0.5);
        }
        .layer-label {
          transform: rotate(-90deg);
          white-space: nowrap;
          font-size: 0.8rem;
          font-weight: bold;
          color: rgba(255,255,255,0.8);
          text-shadow: 0 1px 2px black;
        }

        .flashlight {
          position: absolute;
          left: 10%;
          font-size: 3rem;
          z-index: 10;
          transform: rotate(0deg);
        }

        .flashlight-beam {
          position: absolute;
          left: 15%;
          top: 50%;
          transform: translateY(-50%);
          width: 80%;
          height: 100px;
          pointer-events: none;
          display: flex;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .flashlight-beam.on {
          opacity: 1;
        }

        .beam-cone {
          width: 35%; /* Distance to material */
          height: 100%;
          background: linear-gradient(to right, rgba(255, 255, 200, 0.8), rgba(255, 255, 200, 0.4));
          clip-path: polygon(0% 40%, 100% 0%, 100% 100%, 0% 60%);
          z-index: 6; /* In front of material for the source part? No, behind material usually, but we want to see the beam hitting it. */
          /* Actually, let's put it behind material layer (z-index 5) */
          z-index: 4;
        }

        .beam-through {
          width: 65%; /* Distance after material */
          height: 100%;
          background: linear-gradient(to right, rgba(255, 255, 200, 0.4), rgba(255, 255, 200, 0));
          clip-path: polygon(0% 0%, 100% 10%, 100% 90%, 0% 100%);
          opacity: var(--light-opacity);
          transition: opacity 0.3s ease;
          z-index: 4; /* Behind material layer */
        }
        
        /* Illuminate object based on beam-through opacity */
        .flashlight-beam.on .beam-through {
           /* This logic is handled by inline style var */
        }
        
        /* Trick: Use a mix-blend-mode or just another overlay to light up the bear */
        .hidden-object::after {
          content: '🧸';
          position: absolute;
          top: 0;
          left: 0;
          filter: brightness(1.5);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        /* We can't easily target sibling via child state. 
           Let's use a different approach for the bear illumination.
           We will use a separate light overlay on the bear.
        */
        
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
        .active-toggle {
          background: #ffd700;
          color: black;
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

            {/* Dynamic style for bear illumination based on state */}
            <style>{`
        .hidden-object {
          filter: brightness(${isLightOn ? (0.2 + getLightOpacity()) : 0.2});
        }
      `}</style>
        </div>
    );
};

export default TransparencyTest;
