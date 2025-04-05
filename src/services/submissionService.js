// Сохранение ответов в localStorage
const saveSubmissions = (submissions) => {
    localStorage.setItem('quiz_submissions', JSON.stringify(submissions));
  };
  
  // Получение всех ответов из localStorage
  const getSubmissions = () => {
    const submissions = localStorage.getItem('quiz_submissions');
    return submissions ? JSON.parse(submissions) : [];
  };
  
  // Отправка ответов ученика
  export const submitAnswers = (roomId, testId, studentName, answers) => {
    const submissions = getSubmissions();
    
    const newSubmission = {
      id: Date.now().toString(), // Используем временную метку как ID
      roomId,
      testId,
      studentName,
      answers,
      timestamp: new Date().toISOString()
    };
    
    submissions.push(newSubmission);
    saveSubmissions(submissions);
    
    return newSubmission.id;
  };
  
  // Получение всех ответов для комнаты
  export const getSubmissionsByRoom = (roomId) => {
    const submissions = getSubmissions();
    return submissions.filter(submission => submission.roomId === roomId);
  };
  
  // Конвертация данных для экспорта в Excel
  export const prepareDataForExport = (roomId) => {
    const submissions = getSubmissionsByRoom(roomId);
    return submissions;
  };