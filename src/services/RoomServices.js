// src/services/RoomServices.js

// Генерация случайного 5-значного кода
export const generateRoomCode = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// Сохранение комнат в localStorage
const saveRooms = (rooms) => {
  localStorage.setItem('quiz_rooms', JSON.stringify(rooms));
};

// Получение всех комнат из localStorage
const getRooms = () => {
  const rooms = localStorage.getItem('quiz_rooms');
  return rooms ? JSON.parse(rooms) : [];
};

// Создание новой комнаты с тестом
export const createRoom = (testId) => {
  const rooms = getRooms();
  const code = generateRoomCode();
  
  const newRoom = {
    id: Date.now().toString(), // Используем временную метку как ID
    code,
    active: false,
    created: new Date().toISOString(),
    testId
  };
  
  rooms.push(newRoom);
  saveRooms(rooms);
  
  return { id: newRoom.id, code };
};

// Активация комнаты для подключения учеников
export const activateRoom = (roomId) => {
  const rooms = getRooms();
  const updatedRooms = rooms.map(room => 
    room.id === roomId ? { ...room, active: true } : room
  );
  
  saveRooms(updatedRooms);
};

// Получение комнаты по коду
export const getRoomByCode = (code) => {
  const rooms = getRooms();
  return rooms.find(room => room.code === code && room.active === true) || null;
};

// Получение комнаты по ID
export const getRoomById = (id) => {
  const rooms = getRooms();
  return rooms.find(room => room.id === id) || null;
};

// Получение всех комнат
export const getAllRooms = () => {
  return getRooms();
};

// Удаление комнаты
export const deleteRoom = (roomId) => {
  const rooms = getRooms();
  const updatedRooms = rooms.filter(room => room.id !== roomId);
  saveRooms(updatedRooms);
};