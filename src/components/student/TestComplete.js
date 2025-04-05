import React from 'react';

const TestComplete = ({ studentName, onRejoin }) => {
  return (
    <div className="test-complete">
      <div className="completion-message">
        <h2>Tests veiksmīgi pabeigts!</h2>
        <div className="success-icon">✓</div>
        <p className="thank-you-message">
          Paldies, <strong>{studentName}</strong>! Tavas atbildes ir veiksmīgi iesniegtas.
        </p>
        <p className="info-message">
          Skolotājs saņems tavas atbildes un varēs tās apskatīt savā panelī.
        </p>
      </div>
      
      <div className="actions">
        <button onClick={onRejoin} className="rejoin-btn">
          Pievienoties citam testam
        </button>
      </div>
    </div>
  );
};

export default TestComplete;
