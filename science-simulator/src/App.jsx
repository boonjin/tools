import { useState, useEffect } from 'react'
import LabBench from './components/LabBench'
import './App.css'

function App() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => {
        console.error(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="app-container">
      <div className="global-controls">
        <a href="../" className="control-btn back-btn" title="Back to Repo">
          🏠 Back
        </a>
        <button onClick={toggleFullscreen} className="control-btn fs-btn" title="Toggle Fullscreen">
          {isFullscreen ? '❌ Exit Fullscreen' : '⛶ Fullscreen'}
        </button>
      </div>
      <LabBench />
      <style>{`
        .global-controls {
          position: fixed;
          top: 1rem;
          right: 1rem;
          display: flex;
          gap: 0.5rem;
          z-index: 1000;
        }
        .control-btn {
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          text-decoration: none;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          transition: all 0.2s;
          font-family: inherit;
        }
        .control-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  )
}

export default App
