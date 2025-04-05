// src/App.js
import React, { useState } from 'react';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import './App.css';

function App() {
  const [role, setRole] = useState(null); // 'teacher' vai 'student'

  if (!role) {
    return (
      <div className="role-selection">
        <h1>Testēšanas platforma</h1>
        <p>Vai jūs esat skolotājs vai skolēns?</p>
        <div className="buttons">
          <button onClick={() => setRole('teacher')}>Skolotājs</button>
          <button onClick={() => setRole('student')}>Skolēns</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Testēšanas platforma</h1>
        <button onClick={() => setRole(null)} className="back-btn">
          Atgriezties pie lomas izvēles
        </button>
      </header>

      <main>
        {role === 'teacher' ? (
          <TeacherDashboard />
        ) : (
          <StudentDashboard />
        )}
      </main>

      <footer>
        <p>Testēšanas platformas prototips</p>
      </footer>
    </div>
  );
}

export default App;
