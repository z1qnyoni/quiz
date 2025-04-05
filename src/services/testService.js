// Сохранение тестов в localStorage
const saveTests = (tests) => {
    localStorage.setItem('quiz_tests', JSON.stringify(tests));
  };
  
  // Получение всех тестов из localStorage
  const getTests = () => {
    const tests = localStorage.getItem('quiz_tests');
    return tests ? JSON.parse(tests) : [];
  };
  
  // Создание нового теста
  export const createTest = (testData) => {
    const tests = getTests();
    
    const newTest = {
      id: Date.now().toString(), // Используем временную метку как ID
      ...testData,
      createdAt: new Date().toISOString()
    };
    
    tests.push(newTest);
    saveTests(tests);
    
    return newTest.id;
  };
  
  // Получение теста по ID
  export const getTestById = (testId) => {
    const tests = getTests();
    return tests.find(test => test.id === testId) || null;
  };
  
  // Получение всех тестов
  export const getAllTests = () => {
    return getTests();
  };