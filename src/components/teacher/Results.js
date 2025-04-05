// src/components/teacher/Results.js
import React, { useState, useEffect } from 'react';
import { getSubmissionsByRoom } from '../../services/submissionService';
import { getTestById } from '../../services/testService';

const Results = ({ roomId, roomCode }) => {
  const [submissions, setSubmissions] = useState([]);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!roomId) return;

      try {
        const submissionsData = getSubmissionsByRoom(roomId);

        if (submissionsData.length > 0) {
          const testData = getTestById(submissionsData[0].testId);
          setTest(testData);
        }

        setSubmissions(submissionsData);
      } catch (error) {
        console.error('Kļūda ielādējot rezultātus:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [roomId]);

  const exportToCSV = () => {
    if (!test || submissions.length === 0) {
      alert('Nav datu eksportam.');
      return;
    }

    try {
      const csvRows = [];

      csvRows.push(`Testa rezultāti: ${test.title}`);
      csvRows.push(`Istabas kods: ${roomCode}`);
      csvRows.push(`Eksporta datums: ${new Date().toLocaleString()}`);
      csvRows.push('');

      const headers = ['Skolēns'];
      test.questions.forEach((_, index) => {
        headers.push(`Jautājums ${index + 1}`);
      });
      headers.push('Atbildes laiks');
      csvRows.push(headers.join(';'));

      const questionTexts = [''];
      test.questions.forEach(question => {
        questionTexts.push(question.text.substring(0, 30) + (question.text.length > 30 ? '...' : ''));
      });
      questionTexts.push('');
      csvRows.push(questionTexts.join(';'));

      submissions.forEach(submission => {
        const row = [submission.studentName];

        test.questions.forEach(question => {
          const answer = submission.answers[question.id] || '-';
          const formattedAnswer = answer.includes(';') ? `"${answer.replace(/"/g, '""')}"` : answer;
          row.push(formattedAnswer);
        });

        const date = new Date(submission.timestamp);
        row.push(date.toLocaleString());

        csvRows.push(row.join(';'));
      });

      const csvContent = '\uFEFF' + csvRows.join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `testa_rezultāti_${roomCode}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Kļūda eksportējot CSV:', error);
      alert('Kļūda eksportējot rezultātus. Lūdzu, mēģiniet vēlreiz.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <div>Rezultāti tiek ielādēti...</div>;
  }

  return (
    <div className="results">
      <h2>Testa rezultāti</h2>
      <div className="room-info">
        <p><strong>Istabas kods:</strong> {roomCode}</p>
        <p><strong>Atbilžu skaits:</strong> {submissions.length}</p>
      </div>

      {submissions.length === 0 ? (
        <p>Pašlaik nav iesniegumu. Gaidām, kamēr skolēni pabeigs testu...</p>
      ) : (
        <>
          <table className="results-table">
            <thead>
              <tr>
                <th>Skolēns</th>
                {test?.questions.map((q, idx) => (
                  <th key={q.id}>J{idx + 1}</th>
                ))}
                <th>Atbildes laiks</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.studentName}</td>
                  {test?.questions.map((q) => (
                    <td key={q.id}>
                      {sub.answers[q.id]}
                      {q.correctAnswer && (
                        <span className={
                          sub.answers[q.id] === q.correctAnswer
                            ? 'correct'
                            : 'incorrect'
                        }>
                          {sub.answers[q.id] === q.correctAnswer ? ' ✓' : ' ✗'}
                        </span>
                      )}
                    </td>
                  ))}
                  <td>{formatDate(sub.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={exportToCSV} className="export-btn">
            Eksportēt rezultātus CSV formātā
          </button>
        </>
      )}
    </div>
  );
};

export default Results;
