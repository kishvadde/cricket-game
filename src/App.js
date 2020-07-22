import React, { useState } from 'react';
import Game from './components/Game';

import './App.css';

function App() {
  const [numberOfOvers, setNumberOfOvers] = useState(20);

  return (
    <div className="flex-container">
      <div className="game-container">
        <div style={{ margin: '20px' }}>
          <span style={{ fontWeight: 600 }}>Overs:</span>
          <select
            className="number-of-overs-input"
            onChange={(event) => {
              setNumberOfOvers(event.target.value);
            }}
            value={numberOfOvers}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <Game numberOfOvers={numberOfOvers} />
      </div>
    </div>
  );
}

export default App;
