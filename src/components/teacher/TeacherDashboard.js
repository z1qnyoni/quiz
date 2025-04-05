import React, { useState } from 'react';
import TestCreator from './TestCreator';
import RoomCreator from './RoomCreator';
import Results from './Results';
import Statistics from './Statistics';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [currentTestId, setCurrentTestId] = useState(null);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [roomCode, setRoomCode] = useState(null);

  const handleTestCreated = (testId) => {
    console.log('Testa ID ir izveidots:', testId);
    setCurrentTestId(testId);
    setActiveTab('room');
  };

  const handleRoomCreated = (roomId, code) => {
    console.log('Istaba ir izveidota ar ID:', roomId, 'un kodu:', code);
    setCurrentRoomId(roomId);
    setRoomCode(code);
    setActiveTab('results');
  };

  return (
    <div className="teacher-dashboard">
      <div className="tabs">
        <button 
          className={activeTab === 'create' ? 'active' : ''} 
          onClick={() => setActiveTab('create')}
        >
          Izveidot testu
        </button>
        <button 
          className={activeTab === 'room' ? 'active' : ''}
          onClick={() => setActiveTab('room')}
          disabled={!currentTestId}
        >
          Izveidot istabu
        </button>
        <button 
          className={activeTab === 'results' ? 'active' : ''}
          onClick={() => setActiveTab('results')}
          disabled={!currentRoomId}
        >
          Rezultāti
        </button>
        <button 
          className={activeTab === 'statistics' ? 'active' : ''}
          onClick={() => setActiveTab('statistics')}
          disabled={!currentRoomId}
        >
          Statistika
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'create' && (
          <TestCreator onTestCreated={handleTestCreated} />
        )}
        {activeTab === 'room' && (
          <RoomCreator testId={currentTestId} onRoomCreated={handleRoomCreated} />
        )}
        {activeTab === 'results' && (
          <Results roomId={currentRoomId} roomCode={roomCode} />
        )}
        {activeTab === 'statistics' && (
          <Statistics roomId={currentRoomId} roomCode={roomCode} />
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
