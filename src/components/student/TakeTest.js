import React, { useState, useEffect } from 'react';
import { getTestById } from '../../services/testService';
import { submitAnswers } from '../../services/submissionService';

const TakeTest = ({ roomId, testId, studentName, onTestComplete }) => {
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [lastAnsweredQuestion, setLastAnsweredQuestion] = useState(null); // Pēdējā atbildētā jautājuma ID
  const [showFeedback, setShowFeedback] = useState(false); // Karogs atsauksmes rādīšanai

  useEffect(() => {
    // Ielādēt testu, kad komponents tiek piesaistīts
    const fetchTest = () => {
      try {
        const testData = getTestById(testId);
        
        if (!testData) {
          setError('Tests netika atrasts');
          return;
        }
        
        setTest(testData);
        
        // Inicializēt atbildes
        const initialAnswers = {};
        testData.questions.forEach(q => {
          initialAnswers[q.id] = '';
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error('Kļūda ielādējot testu:', error);
        setError('Kļūda ielādējot testu. Lūdzu, mēģiniet vēlreiz.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTest();
  }, [testId]);

  // Kad mainās pašreizējais jautājums, pārbaudām, vai ir jāparāda atsauksmes
  useEffect(() => {
    if (lastAnsweredQuestion && lastAnsweredQuestion !== test?.questions[currentQuestion]?.id) {
      setShowFeedback(true);
    } else {
      setShowFeedback(false);
    }
  }, [currentQuestion, lastAnsweredQuestion, test]);

  // Apstrādāt studenta atbildes izmaiņas
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Saglabāt pēdējo atbildēto jautājumu
    setLastAnsweredQuestion(questionId);
    
    // Paslēpt atsauksmes atbildes izmaiņu laikā
    setShowFeedback(false);
  };

  // Navigācija starp jautājumiem
  const goToNextQuestion = () => {
    if (currentQuestion < test.questions.length - 1) {
      // Parādīt atsauksmes pirms pāriešanas uz nākamo jautājumu
      setShowFeedback(true);
      
      // Pāriet uz nākamo jautājumu pēc 1,5 sekundēm
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 1500); // Aizture 1,5 sekundes, lai apskatītu atsauksmes
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Atbilžu iesniegšana
  const handleSubmit = () => {
    try {
      // Parādīt atsauksmes pirms iesniegšanas
      setShowFeedback(true);
      
      // Atbilžu validācija
      const unansweredQuestions = test.questions.filter(q => !answers[q.id]);
      
      if (unansweredQuestions.length > 0) {
        const confirm = window.confirm(`Jums ir ${unansweredQuestions.length} neizpildīts jautājums(-i). Vai tomēr iesniegt?`);
        if (!confirm) return;
      }
      
      // Iesniegt atbildes ar aizturi, lai lietotājs varētu apskatīt pareizo atbildi
      setTimeout(() => {
        submitAnswers(roomId, testId, studentName, answers);
        alert('Tests veiksmīgi iesniegts!');
        onTestComplete();
      }, 2000); // Aizture 2 sekundes, lai apskatītu atsauksmes
    } catch (error) {
      console.error('Kļūda iesniedzot testu:', error);
      setError('Kļūda iesniedzot testu. Lūdzu, mēģiniet vēlreiz.');
    }
  };

  // Pārbauda, vai atbilde ir pareiza
  const isCorrectAnswer = (questionId, answer) => {
    const question = test.questions.find(q => q.id === questionId);
    return question && question.correctAnswer === answer;
  };

  if (loading) {
    return <div className="loading">Testa ielāde...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!test) {
    return <div className="not-found">Tests netika atrasts</div>;
  }

  const currentQ = test.questions[currentQuestion];
  const hasAnswer = !!answers[currentQ.id];

  return (
    <div className="take-test">
      <h2>{test.title}</h2>
      <div className="student-info">
        <p><strong>Student:</strong> {studentName}</p>
        <p><strong>Jautājums:</strong> {currentQuestion + 1} no {test.questions.length}</p>
      </div>
      
      <div className="question-container">
        <h3>Jautājums {currentQuestion + 1}</h3>
        <p className="question-text">{currentQ.text}</p>
        
        {currentQ.type === 'multiple-choice' ? (
          <div className="options">
            {currentQ.options.map((option, idx) => (
              <label key={idx} className="option">
                <input
                  type="radio"
                  name={`question-${currentQ.id}`}
                  value={option}
                  checked={answers[currentQ.id] === option}
                  onChange={() => handleAnswerChange(currentQ.id, option)}
                />
                <span className="option-checkmark"></span>
                <span className="option-text">{option}</span>
                
                {/* Rāda atsauksmes tikai pēc jautājuma aiziešanas */}
                {showFeedback && answers[currentQ.id] === option && currentQ.correctAnswer && (
                  isCorrectAnswer(currentQ.id, option) ? 
                    <span className="feedback correct">✓</span> : 
                    <span className="feedback incorrect">✗</span>
                )}
              </label>
            ))}
            
            {/* Rāda pareizo atbildi tikai pēc jautājuma aiziešanas, ja atbilde bija nepareiza */}
            {showFeedback && hasAnswer && currentQ.correctAnswer && !isCorrectAnswer(currentQ.id, answers[currentQ.id]) && (
              <div className="correct-answer-feedback">
                <p>Pareizā atbilde: <strong>{currentQ.correctAnswer}</strong></p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-input">
            <textarea
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
              placeholder="Ievadiet savu atbildi šeit..."
              rows="4"
            />
            
            {/* Rāda pareizo atbildi tikai pēc jautājuma aiziešanas */}
            {showFeedback && hasAnswer && currentQ.correctAnswer && (
              <div className="text-feedback">
                {answers[currentQ.id].toLowerCase().trim() === currentQ.correctAnswer.toLowerCase().trim() ? (
                  <div className="correct">Pareizi! ✓</div>
                ) : (
                  <div className="incorrect">
                    <p>Nepareizi ✗</p>
                    <p>Pareizā atbilde: <strong>{currentQ.correctAnswer}</strong></p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="navigation">
        <button 
          onClick={goToPreviousQuestion} 
          disabled={currentQuestion === 0}
          className="nav-btn prev-btn"
        >
          Iepriekšējais
        </button>
        
        {currentQuestion < test.questions.length - 1 ? (
          <button 
            onClick={goToNextQuestion} 
            className="nav-btn next-btn"
            disabled={!hasAnswer} // Poga ir neaktīva, ja nav atbildes
          >
            Nākamais
          </button>
        ) : (
          <button 
            onClick={handleSubmit} 
            className="submit-btn"
            disabled={!hasAnswer} // Poga ir neaktīva, ja nav atbildes
          >
            Pabeigt testu
          </button>
        )}
      </div>
      
      <div className="progress-indicator">
        {test.questions.map((_, idx) => (
          <span 
            key={idx} 
            className={`progress-dot ${idx === currentQuestion ? 'active' : ''} ${answers[test.questions[idx].id] ? 'answered' : ''}`}
            onClick={() => setCurrentQuestion(idx)}
          />
        ))}
      </div>
    </div>
  );
  };

export default TakeTest;