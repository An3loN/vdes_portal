'use client';
import { CarClass, Registration } from '@/models/races';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

interface ModalFormProps {
  handleSubmit: (selectedCar: string, raceNum: number, carClass: string) => Promise<boolean>;
  handleDelete: () => Promise<boolean>;
  closeModal: () => void;
  reserved_numbers: number[];
  allowed_classes: CarClass[];
  active_registration?: Registration;
}

const ModalForm: React.FC<ModalFormProps> = ({ handleSubmit, handleDelete, closeModal, reserved_numbers, allowed_classes, active_registration }) => {
  const [selectedClass, setSelectedClass] = useState<string>(active_registration ? active_registration.car_class:''); // Класс машины
  const [availableCars, setAvailableCars] = useState<string[]>([]); // Список машин для выбранного класса
  const [selectedCar, setSelectedCar] = useState<string>(active_registration ? active_registration.car:''); // Выбранная машина
  const [numericValue, setNumericValue] = useState<number | null>(active_registration ? active_registration.race_number:null); // Номер гонщика
  const [errorMessage, setErrorMessage] = useState<string>(''); // Сообщение об ошибке
  
  const router = useRouter();

  // Обновляем список машин, когда выбирается класс машины
  useEffect(() => {
    const selectedClassData = allowed_classes.find(carClass => carClass.class_name === selectedClass);
    if (selectedClassData) {
      setAvailableCars(selectedClassData.cars);
    }
  }, [selectedClass, allowed_classes]);

  // Функция для проверки номера гонщика
  const validateRaceNumber = (number: number) => {
    if (reserved_numbers.includes(number)) {
      setErrorMessage('Этот номер уже занят. Пожалуйста, выберите другой.');
    } else {
      setErrorMessage('');
    }
  };

  // Обработка отправки формы
  const handleSubmitBase = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedClass || !selectedCar || numericValue === null) {
      setErrorMessage('Пожалуйста, заполните все поля.');
      return;
    }

    // Проверка валидности перед отправкой
    if (errorMessage === '') {
      const succeed = await handleSubmit(selectedCar, numericValue, selectedClass);
      if(succeed){
        closeModal();
        router.refresh()
      } else {
        setErrorMessage('Ошибка регистрации.');
      }
    }
  };

    // Обработка удаления регистрации
    const handleDeleteBase = async () => {
      const succeed = await handleDelete();
      if(succeed){
        closeModal();
        router.refresh()
      } else {
        setErrorMessage('Ошибка удаления.');
      }
    };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 border-gray-400 rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button onClick={closeModal} className="absolute top-2 right-2 text-gray-400 hover:text-gray-50">✖</button>
        <h2 className="text-2xl font-bold mb-4">Регистрация на гонку</h2>

        <form onSubmit={handleSubmitBase} className="space-y-4">
          {/* Поле выбора класса машины */}
          <div>
            <label className="block text-gray-100 mb-2">Выберите класс машины:</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedCar(''); // Сброс выбора машины при смене класса
                setSelectedClass(e.target.value);
              }}
              className="w-full p-2 border border-gray-700 bg-gray-600 rounded-lg"
              required
            >
              <option value="" disabled>-- Выберите класс --</option>
              {allowed_classes.map((carClass, index) => (
                <option key={index} value={carClass.class_name}>{carClass.class_name}</option>
              ))}
            </select>
          </div>

          {/* Поле выбора машины (отображается после выбора класса) */}
          {selectedClass && (
            <div>
              <label className="block text-gray-100 mb-2">Выберите машину:</label>
              <select
                value={selectedCar}
                onChange={(e) => setSelectedCar(e.target.value)}
                className="w-full p-2 border border-gray-700 bg-gray-600 rounded-lg"
                required
              >
                <option value="" disabled>-- Выберите машину --</option>
                {availableCars.map((car, index) => (
                  <option key={index} value={car}>{car}</option>
                ))}
              </select>
            </div>
          )}

          {/* Поле для номера гонщика */}
          <div>
            <label className="block text-gray-100 mb-2">Введите Ваш номер гонщика (1-999):</label>
            <input
              type="number"
              value={numericValue !== null ? numericValue : ''}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                setNumericValue(value);
                validateRaceNumber(value);
              }}
              min="1"
              max="999"
              className="w-full p-2 border border-gray-600 rounded-lg bg-gray-600"
              required
            />
            {/* Сообщение об ошибке номера гонщика */}
            {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
          </div>

          {/* Кнопка отправки */}
          <button
            type="submit"
            className="w-full border border-green-500 text-green-500 py-2 px-4 rounded-md hover:bg-green-500 hover:text-black transition"
          >
            Зарегистрироваться
          </button>
        </form>
        {active_registration &&
          <button onClick={handleDeleteBase} className="w-full border rounded-md p-1 mt-3 border-red-500 text-red-500 hover:text-black hover:bg-red-500 transition">Отменить регистрацию</button>
        }
      </div>
    </div>
  );
};

export default ModalForm;
