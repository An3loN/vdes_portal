'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { UserAuth } from '@/models/auth';
import Cookies from 'ts-cookies'
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/16/solid';

const UserProfileForm: React.FC<{ user_auth: UserAuth }> = ({user_auth}) => {
  const [firstName, setFirstName] = useState(user_auth.name ? user_auth.name : '');
  const [lastName, setLastName] = useState(user_auth.surname ? user_auth.surname : '');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const not_latin_regexp = /[^a-z]/gi;

  const validateThen = async (validate_value: string, afterValidate: (arg: string)=>void) => {
    const result = validate_value.replace(not_latin_regexp, '');

    afterValidate(result);
  }
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

    if (firstName.search(not_latin_regexp) != -1 || lastName.search(not_latin_regexp) != -1) {
      setErrorMessage('Имя и Фамилия должны быть на латинице (Ivan Ivanov).');
      setSuccessMessage('');
      return;
    }

    try {
      // Отправка данных на сервер (можно заменить URL на ваш бэкенд)
      const response = await axios.post('/api/user', { firstName, lastName });

      // Если успешно
      if(response.status == 200){
        setSuccessMessage('Данные успешно сохранены!');
        setErrorMessage('');
      }
    } catch {
      setErrorMessage('Ошибка при сохранении данных.');
      setSuccessMessage('');
    }
  };

  // Выход из аккаунта
  const handleLogout = () => {
    Cookies.remove('login');
    router.push('/');
    router.refresh();
  };

  return (
    <div className="color-panel p-6 rounded-lg shadow-lg w-full max-w-md flex flex-col">
      {/* Кнопка "Выйти" */}
      <button
        onClick={handleLogout}
        className="bg-red-500 p-1 rounded-lg hover:bg-red-600 transition self-end"
      >
        <ArrowRightStartOnRectangleIcon className='w-6'/>
      </button>
      <h2 className="text-2xl font-bold mb-4 text-center mt-2">
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
            onChange={(e) => validateThen(e.target.value, setFirstName)}
            className="mt-1 p-2 w-full border border-gray-700 rounded color-bg"
            placeholder="Ivan"
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
            onChange={(e) => validateThen(e.target.value, setLastName)}
            className="mt-1 p-2 w-full border border-gray-700 rounded color-bg"
            placeholder="Ivanov"
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
    </div>
  );
};

export default UserProfileForm;
