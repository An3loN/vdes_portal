'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { inputToUnix, unixToInput } from '@/utils/date_formats';

const create_url = `/api/admin/race/create`;
const validate_file_url = `/api/validate_class_json`;

const RaceInputForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null); // Новое поле для загрузки файла
  const [fileError, setFileError] = useState<string>(''); // Ошибка валидации файла
  const [submitError, setSubmitError] = useState<string | undefined>('');
  const router = useRouter();

  // Обработчик для выбора изображения
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImage(event.target.files[0]);
    }
  };

  // Обработчик для выбора файла
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);

      // Валидация файла на сервере
      const formData = new FormData();
      formData.append('class_json', selectedFile);

      try {
        const response = await fetch(validate_file_url, {
          method: 'POST',
          body: formData,
        });
        const result = JSON.parse(await response.json()) as {is_valid?: boolean};

        if (result.is_valid) {
          setFileError('');
        } else {
          setFileError('Файл не прошёл валидацию');
        }
      } catch {
        setFileError('Произошла ошибка при валидации файла');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      unixToInput(inputToUnix(dateTime).toString());
    } catch {
      setSubmitError('Время указано неверно.');
      return;
    }


    if (!image) {
      alert('Выберите изображение');
      return;
    }
    if (!file) {
      alert('Выберите файл с классами');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('dateTime', inputToUnix(dateTime).toString());
    formData.append('image', image);
    formData.append('class_file', file);

    try {
      const response = await fetch(create_url, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Данные успешно отправлены:', data);
        router.back();
      } else {
        console.error('Ошибка при отправке данных');
        setSubmitError('Ошибка. Статус ' + response.status.toString());
      }
    } catch (error) {
      console.error('Произошла ошибка:', error);
      if(error) {
        setSubmitError(error.toString());
      }
    }
  };

  return (
    <form className="p-4 bg-white shadow-md rounded-lg mx-auto flex-row min-w-base" onSubmit={handleSubmit}>
      {/* Поле для ввода названия */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Название гонки
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
          placeholder="Введите название"
        />
      </div>

      {/* Поле для ввода описания */}
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Описание
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none text-black"
          rows={3}
          placeholder="Введите описание"
          style={{ minHeight: '10rem', overflowX: 'hidden', overflowY: 'auto' }}
        />
      </div>

      {/* Поле для выбора даты и времени */}
      <div className="mb-4">
        <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700">
          Дата и время проведения
        </label>
        <input
          type="datetime-local"
          id="dateTime"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
        />
      </div>

      {/* Поле для выбора изображения */}
      <div className="mb-4">
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Выберите изображение
        </label>
        <input
          type="file"
          id="image"
          accept=".png, .jpg"
          onChange={handleImageChange}
          className="mt-1 block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </div>

      {/* Отображение выбранного изображения */}
      {image && (
        <div className="mb-4">
          <img
            src={URL.createObjectURL(image)}
            alt="Выбранное изображение"
            className="w-32 h-18 object-cover rounded-lg "
          />
        </div>
      )}

      {/* Поле для загрузки файла */}
      <div className="mb-4">
        <label htmlFor="file" className="block text-sm font-medium text-gray-700">
          Загрузите файл классов
        </label>
        <input
          type="file"
          id="file"
          accept=".json"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {/* Сообщение об ошибке валидации */}
        {fileError && <p className="text-red-500 mt-2 text-sm">{fileError}</p>}
      </div>

      {submitError && <p className="text-red-500 mt-2 text-sm">{submitError}</p>}

      <button
        type="submit"
        className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Создать
      </button>
    </form>
  );
};

export default RaceInputForm;
