'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { UserAuth } from '@/models/auth';
import Cookies from 'ts-cookies'

const UserProfileForm: React.FC<{ user_auth: UserAuth }> = ({user_auth}) => {
  const [firstName, setFirstName] = useState(user_auth.name ? user_auth.name : '');
  const [lastName, setLastName] = useState(user_auth.surname ? user_auth.surname : '');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  // Валидация и отправка данных
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация данных
    if (!firstName || !lastName) {
      setErrorMessage('Имя и Фамилия не должны быть пустыми.');
      setSuccessMessage('');
      return;
    }

    if (firstName.length > 50 || lastName.length > 50) {
      setErrorMessage('Имя и Фамилия не могут быть длиннее 50 символов.');
      setSuccessMessage('');
      return;
    }

    try {
      // Отправка данных на сервер (можно заменить URL на ваш бэкенд)
      const response = await axios.post('/api/user', { firstName, lastName });

      // Если успешно
      setSuccessMessage('Данные успешно сохранены!');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Ошибка при сохранении данных.');
      setSuccessMessage('');
    }
  };

  // Выход из аккаунта
  const handleLogout = () => {
    Cookies.remove('login');
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Для участия в гонках укажите Ваши данные:
        </h2>

        {/* Форма для ввода данных */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium">
              Имя
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-700 rounded bg-gray-900"
              placeholder="Введите ваше имя"
              maxLength={50}
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium">
              Фамилия
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 p-2 w-full border border-gray-700 rounded bg-gray-900"
              placeholder="Введите вашу фамилию"
              maxLength={50}
            />
          </div>

          {/* Кнопка "Сохранить" */}
          <button
            type="submit"
            className="bg-green-500 py-2 px-4 w-full rounded-lg hover:bg-green-600 transition"
          >
            Сохранить
          </button>

          {/* Сообщения о результате */}
          {errorMessage && (
            <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-green-500 text-sm mt-2">{successMessage}</p>
          )}
        </form>

        {/* Кнопка "Выйти" */}
        <button
          onClick={handleLogout}
          className="mt-6 bg-red-500 py-2 px-4 w-full rounded-lg hover:bg-red-600 transition"
        >
          Выйти
        </button>
      </div>
    </div>
  );
};

export default UserProfileForm;
