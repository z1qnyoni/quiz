import React, { useState } from 'react';
import { createTest } from '../../services/testService';

const TestCreator = ({ onTestCreated }) => {
  const [testTitle, setTestTitle] = useState('');
  const [questions, setQuestions] = useState([
    { id: '1', text: '', type: 'multiple-choice', options: ['', ''], correctAnswer: '' },
    { id: '2', text: '', type: 'text-input', correctAnswer: '' }
  ]);

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push('');
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: (questions.length + 1).toString(),
        text: '',
        type: 'multiple-choice',
        options: ['', ''],
        correctAnswer: ''
      }
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!testTitle.trim()) {
      alert('Lūdzu, ievadiet testa nosaukumu');
      return;
    }

    for (const question of questions) {
      if (!question.text.trim()) {
        alert('Lūdzu, aizpildiet visus jautājumu tekstus');
        return;
      }

      if (question.type === 'multiple-choice') {
        for (const option of question.options) {
          if (!option.trim()) {
            alert('Lūdzu, aizpildiet visus atbilžu variantus');
            return;
          }
        }
      }
    }

    try {
      const testId = await createTest({
        title: testTitle,
        questions,
        createdAt: new Date()
      });

      console.log('Tests izveidots ar ID:', testId);

      alert('Tests veiksmīgi izveidots!');
      onTestCreated(testId);
    } catch (error) {
      console.error('Kļūda veidojot testu:', error);
      alert('Radās kļūda veidojot testu. Lūdzu, mēģiniet vēlreiz.');
    }
  };

  return (
    <div className="test-creator">
      <h2>Izveidot jaunu testu</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Testa nosaukums:</label>
          <input
            type="text"
            value={testTitle}
            onChange={(e) => setTestTitle(e.target.value)}
            required
          />
        </div>

        <h3>Jautājumi</h3>
        {questions.map((question, questionIndex) => (
          <div key={question.id} className="question-container">
            <h4>Jautājums {questionIndex + 1}</h4>
            <div className="form-group">
              <label>Jautājuma teksts:</label>
              <textarea
                value={question.text}
                onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Jautājuma tips:</label>
              <select
                value={question.type}
                onChange={(e) => handleQuestionChange(questionIndex, 'type', e.target.value)}
              >
                <option value="multiple-choice">Izvēle no variantiem</option>
                <option value="text-input">Teksta ievade</option>
              </select>
            </div>

            {question.type === 'multiple-choice' && (
              <div className="options-container">
                <label>Atbilžu varianti:</label>
                {question.options.map((option, optionIndex) => (
                  <input
                    key={optionIndex}
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                    placeholder={`Variants ${optionIndex + 1}`}
                    required
                  />
                ))}
                <button
                  type="button"
                  onClick={() => addOption(questionIndex)}
                  className="add-option-btn"
                >
                  Pievienot variantu
                </button>
              </div>
            )}

            <div className="form-group">
              <label>Pareizā atbilde (nav obligāti):</label>
              {question.type === 'multiple-choice' ? (
                <select
                  value={question.correctAnswer}
                  onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', e.target.value)}
                >
                  <option value="">Nav pareizās atbildes</option>
                  {question.options.map((option, idx) => (
                    <option key={idx} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={question.correctAnswer}
                  onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', e.target.value)}
                  placeholder="Paredzamā atbilde (nav obligāti)"
                />
              )}
            </div>
          </div>
        ))}

        <button type="button" onClick={addQuestion} className="add-question-btn">
          Pievienot vēl vienu jautājumu
        </button>

        <button type="submit" className="submit-btn">
          Izveidot testu
        </button>
      </form>
    </div>
  );
};

export default TestCreator;
