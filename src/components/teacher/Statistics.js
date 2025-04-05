import React, { useState, useEffect } from 'react';
import { getSubmissionsByRoom } from '../../services/submissionService';
import { getTestById } from '../../services/testService';
import Chart from './charts';

const Statistics = ({ roomId, roomCode }) => {
  const [submissions, setSubmissions] = useState([]);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageScore: 0,
    questionStats: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!roomId) return;
      
      try {
        const submissionsData = getSubmissionsByRoom(roomId);
        
        if (submissionsData.length > 0) {
          const testData = getTestById(submissionsData[0].testId);
          setTest(testData);
          setSubmissions(submissionsData);
          
          // Aprēķinām statistiku
          if (testData) {
            calculateStats(testData, submissionsData);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Kļūda, iegūstot datus:', error);
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Atjauninām datus ik pēc 10 sekundēm
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, [roomId]);

  const calculateStats = (testData, submissionsData) => {
    if (!testData || !submissionsData.length) return;
    
    // Kopējais skolēnu skaits
    const totalStudents = submissionsData.length;
    
    // Statistika par jautājumiem
    const questionStats = testData.questions.map(question => {
      const answersForQuestion = submissionsData.map(sub => sub.answers[question.id]);
      
      // Atbilžu skaits
      const answerCounts = {};
      answersForQuestion.forEach(answer => {
        if (!answer) return;
        answerCounts[answer] = (answerCounts[answer] || 0) + 1;
      });
      
      // Pareizo atbilžu procents (ja norādīta pareizā atbilde)
      let correctPercentage = 0;
      if (question.correctAnswer) {
        const correctCount = answerCounts[question.correctAnswer] || 0;
        correctPercentage = (correctCount / totalStudents) * 100;
      }
      
      return {
        questionId: question.id,
        questionText: question.text,
        answerCounts,
        correctPercentage,
        mostCommonAnswer: Object.entries(answerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Nav atbilžu'
      };
    });
    
    // Vidējais rezultāts (ja ir pareizās atbildes)
    let totalScore = 0;
    let possibleScore = 0;
    
    submissionsData.forEach(submission => {
      let studentScore = 0;
      
      testData.questions.forEach(question => {
        if (question.correctAnswer && submission.answers[question.id] === question.correctAnswer) {
          studentScore++;
        }
      });
      
      totalScore += studentScore;
    });
    
    possibleScore = testData.questions.filter(q => q.correctAnswer).length;
    const averageScore = possibleScore ? 
      (totalScore / (totalStudents * possibleScore)) * 100 : 0;
    
    setStats({
      totalStudents,
      averageScore,
      questionStats
    });
    
    setLoading(false);
  };

  // Palīgfunkcija, lai noteiktu krāsu pēc pareizo atbilžu procenta
  const getColorByPercentage = (percentage) => {
    if (percentage >= 80) return '#4CAF50'; // Zaļš
    if (percentage >= 60) return '#8BC34A'; // Gaiši zaļš
    if (percentage >= 40) return '#FFC107'; // Dzeltens
    if (percentage >= 20) return '#FF9800'; // Oranžs
    return '#F44336'; // Sarkans
  };

  // Sagatavo dati diagrammai par rezultātiem
  const prepareChartData = () => {
    if (!stats.questionStats.length) return null;
    
    return {
      labels: stats.questionStats.map((_, index) => `Jautājums ${index + 1}`),
      values: stats.questionStats.map(q => q.correctPercentage || 0),
      colors: stats.questionStats.map(q => getColorByPercentage(q.correctPercentage || 0))
    };
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  if (!test || submissions.length === 0) {
    return <div className="empty-state">Nav pietiekami datu, lai attēlotu statistiku.</div>;
  }

  const chartData = prepareChartData();

  return (
    <div className="statistics">
      <h2>Statistika par testu</h2>
      <div className="stats-summary">
        <div className="stat-card">
          <h3>Kopējais skolēnu skaits</h3>
          <div className="stat-value">{stats.totalStudents}</div>
        </div>
        
        {stats.averageScore > 0 && (
          <div className="stat-card">
            <h3>Vidējais rezultāts</h3>
            <div className="stat-value">{stats.averageScore.toFixed(1)}%</div>
          </div>
        )}
      </div>
      
      {chartData && (
        <div className="chart-container">
          <h3 className="chart-title">Rezultāti par jautājumiem</h3>
          <Chart 
            type="bar" 
            data={chartData}
            options={{
              title: 'Pareizo atbilžu procents',
              width: 600,
              height: 300
            }}
          />
        </div>
      )}
      
      <h3>Statistika par jautājumiem</h3>
      <div className="question-stats">
        {stats.questionStats.map((qStat, index) => (
          <div key={qStat.questionId} className="question-stat-card">
            <h4>Jautājums {index + 1}: {qStat.questionText}</h4>
            
            {test.questions[index].correctAnswer && (
              <div className="correct-percentage">
                <strong>Pareizo atbilžu procents:</strong> {qStat.correctPercentage.toFixed(1)}%
                <div className="progress-bar">
                  <div 
                    className="progress" 
                    style={{ width: `${qStat.correctPercentage}%`, backgroundColor: getColorByPercentage(qStat.correctPercentage) }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="answer-distribution">
              <strong>Atbilžu sadalījums:</strong>
              {Object.entries(qStat.answerCounts).length > 0 ? (
                <ul>
                  {Object.entries(qStat.answerCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([answer, count]) => (
                      <li key={answer}>
                        <span className="answer-text">
                          {answer} {test.questions[index].correctAnswer === answer && '✓'}
                        </span>
                        <span className="answer-count">
                          {count} ({((count / stats.totalStudents) * 100).toFixed(1)}%)
                        </span>
                        <div className="progress-bar small">
                          <div 
                            className="progress" 
                            style={{ 
                              width: `${(count / stats.totalStudents) * 100}%`,
                              backgroundColor: test.questions[index].correctAnswer === answer ? '#4CAF50' : '#2196F3'
                            }}
                          ></div>
                        </div>
                      </li>
                    ))}
                </ul>
              ) : (
                <p>Nav datu par atbildēm</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics;
