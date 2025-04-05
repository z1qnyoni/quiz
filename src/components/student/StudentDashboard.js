import React, { useState } from 'react';
import JoinRoom from './JoinRoom';
import TakeTest from './TakeTest';

const StudentDashboard = () => {
  const [stage, setStage] = useState('join'); // join, test, complete
  const [roomId, setRoomId] = useState(null);
  const [testId, setTestId] = useState(null);
  const [studentName, setStudentName] = useState('');

  const handleJoinRoom = (roomId, testId, name) => {
    setRoomId(roomId);
    setTestId(testId);
    setStudentName(name);
    setStage('test');
  };

  const handleTestComplete = () => {
    setStage('complete');
  };

  return (
    <div className="student-dashboard">
      {stage === 'join' && (
        <JoinRoom onJoinRoom={handleJoinRoom} />
      )}
      
      {stage === 'test' && (
        <TakeTest 
          roomId={roomId}
          testId={testId}
          studentName={studentName}
          onTestComplete={handleTestComplete}
        />
      )}
      
      {stage === 'complete' && (
        <div className="test-complete">
          <h2>Tests ir pabeigts</h2>
          <p>Paldies, {studentName}! Tavas atbildes ir iesniegtas.</p>
          <button onClick={() => setStage('join')} className="new-test-btn">
            Pievienoties citam testam
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;