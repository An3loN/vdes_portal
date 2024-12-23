'use client';
import { Race, Weather } from '@/models/races';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'
import { inputToUnix, unixToInput } from '@/utils/date_formats';
import { TrashIcon } from '@heroicons/react/20/solid';
import CopyButton from '@/components/copy_button';
import ReactMarkdown from 'react-markdown';

const edit_url = `/api/admin/race/edit`;
const delete_url = '/api/admin/race/delete';
const generate_entry_list_url = '/api/admin/race/entry_list/';
const validate_file_url = `/api/validate_class_json`;
const validate_results_url = '/api/admin/validate_results_file';

type Prop = {
  race: Race
}

const EditForm: React.FC<Prop> = (prop: Prop) => {
  const [title, setTitle] = useState(prop.race.title);
  const [weather, setWeather] = useState<Weather>(prop.race.weather);
  const [trackTemperature, setTrackTemperature] = useState<number>(prop.race.track_temperature);
  const [airTemperature, setAirTemperature] = useState<number>(prop.race.air_temperature);
  const [description, setDescription] = useState(prop.race.description);
  const [dateTime, setDateTime] = useState(unixToInput(prop.race.date));
  const [image, setImage] = useState<File | null>(null);
  const [race_finished, setState] = useState<boolean>(prop.race.race_finished);
  const [file, setFile] = useState<File | null>(null); // Новое поле для загрузки файла
  const [fileError, setFileError] = useState<string>(''); // Ошибка валидации файла
  const [resultsFile, setResultsFile] = useState<File | null>(null); // Новое поле для загрузки файла
  const [resultsFileError, setResultsFileError] = useState<string>(''); // Ошибка валидации файла

  const [entryListError, setEntryListError] = useState<string | undefined>('');
  const [submitError, setSubmitError] = useState<string | undefined>('');

  const router = useRouter();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImage(event.target.files[0]);
    }
  };
  

  const handleDelete = async () => {
    try {
      await fetch(delete_url, {
        method: 'POST',
        body: JSON.stringify({
          'raceId': prop.race.id,
        }),
      });
    } catch (error) {
      console.error('Произошла ошибка:', error);
      return;
    }
    router.push('/admin');
    // router.refresh();
    setTimeout(() => {
      window.location.reload();
    }, 100);
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


  // Обработчик для выбора файла
  const handleResultsFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setResultsFile(selectedFile);

      // Валидация файла на сервере
      const formData = new FormData();
      formData.append('results_json', selectedFile);

      try {
        const response = await fetch(validate_results_url, {
          method: 'POST',
          body: formData,
        });
        const result = JSON.parse(await response.json()) as {is_valid?: boolean};

        if (result.is_valid) {
          setResultsFileError('');
        } else {
          setResultsFileError('Файл не прошёл валидацию');
        }
      } catch {
        setResultsFileError('Произошла ошибка при валидации файла');
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

    const formData = new FormData();
    formData.append('race_id', prop.race.id);
    formData.append('title', title);
    formData.append('weather', weather);
    formData.append('track_temperature', trackTemperature.toString());
    formData.append('air_temperature', airTemperature.toString());
    formData.append('description', description);
    formData.append('dateTime', inputToUnix(dateTime).toString());
    if(image){  
      formData.append('image', image);
    }
    formData.append('race_finished', race_finished.toString());
    if(file) {
      formData.append('class_file', file);
    }
    if(resultsFile) {
      formData.append('results_json', resultsFile);
    }
    try {
      const response = await fetch(edit_url, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Данные успешно отправлены:', data);
        router.push('/admin');
        router.refresh();
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

  const handleEntryListGeneration = async (): Promise<string> => {
    try {
      const response = await fetch(generate_entry_list_url + prop.race.id);
      if (response.ok) {
        const data = await response.text();
        setEntryListError(undefined);
        return data.substring(1, data.length-1).replace(/\\"/g, '"').replace(/\\n/g, '\n');;
      } else {
        console.error('Ошибка при отправке данных');
        setEntryListError('Ошибка генерации');
      }
    } catch (error) {
      console.error('Произошла ошибка:', error);
      setEntryListError('Ошибка');
    }
    return '';
  };

  return (
    <form className="p-4 bg-white shadow-md rounded-lg mx-auto flex flex-col items-stretch min-w-base" onSubmit={handleSubmit}>
      <div className='w-full flex mb-2'>
        {/* Скопировать энтри лист */}
        <CopyButton
        buttonText='Копировать entry-list'
        getTextToCopy={handleEntryListGeneration}
        error={entryListError}
        />

        {/* Кнопка удаления гонки */}
        <button
            className="py-2 px-4 bg-red-600 text-white font-semibold rounded-md shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 ml-auto"
            onClick={handleDelete}
            type="button"
        >
            <TrashIcon className='w-5 h-5'/>
        </button>
      </div>

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

      {/* Поле для выбора погоды */}
      <div className="mb-4">
        <label htmlFor="weather" className="block text-sm font-medium text-gray-700">
          Погода
        </label>
        <select
          id="weather"
          value={weather}
          onChange={(e) => setWeather(e.currentTarget.value as Weather)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
        >
          <option value='sunny'> Солнечно </option>
          <option value='cloudy'> Облачно </option>
          <option value='rainy'> Дождь </option>
          <option value='heavy_rain'> Ливень </option>
        </select>
      </div>

      {/* Поле для ввода температуры трека */}
      <div className="mb-4">
        <label htmlFor="track_temperature" className="block text-sm font-medium text-gray-700">
          Температура трека
        </label>
        <input
          id="track_temperature"
          type="number"
          value={trackTemperature}
          onChange={(e) => setTrackTemperature(Number(e.target.value))}
          className="mt-1 block w-full max-h-96 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none text-black"
          placeholder="Введите температуру трека"
        />
      </div>

      {/* Поле для ввода температуры воздуха */}
      <div className="mb-4">
        <label htmlFor="air_temperature" className="block text-sm font-medium text-gray-700">
          Температура воздуха
        </label>
        <input
          id="air_temperature"
          type="number"
          value={airTemperature}
          onChange={(e) => setAirTemperature(Number(e.target.value))}
          className="mt-1 block w-full max-h-96 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none text-black"
          placeholder="Введите температуру воздуха"
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
          className="mt-1 block w-full max-h-96 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none text-black"
          rows={3}
          placeholder="Введите описание"
          style={{ minHeight: '10rem', overflowX: 'hidden', overflowY: 'auto' }}
        />
      </div>

      {/* Поле для предпросмотра описания */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Предпросмотр описания
        </label>
        <div
        className="mt-1 block w-full p-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none text-black"
        >
          <ReactMarkdown>{description}</ReactMarkdown>
        </div>
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

      {/* Кнопка для выбора изображения */}
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
      {
        <div className="mb-4">
          <img
            src={ (image && URL.createObjectURL(image)) || prop.race.image_url || undefined}
            alt="Выбранное изображение"
            className="w-32 h-18 object-cover rounded-lg "
          />
        </div>
      }

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

      
      {/* Выбор завершённости гонки */}
      <div className="mb-4">
        <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700">
          Статус гонки
        </label>
        <div className="mt-1 block w-full p-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black">
          <input
            type="checkbox"
            id="finished"
            checked={race_finished}
            onChange={(e) => setState(e.target.checked)}
          />
          <label htmlFor="finished" className="ml-2">Завершена</label>
        </div>
      </div>

      {/* Поле для загрузки файла результатов */}
      {race_finished && 
      (
      <div className="mb-4">
        <label htmlFor="file" className="block text-sm font-medium text-gray-700">
          Загрузите файл результатов
        </label>
        <input
          type="file"
          id="file"
          accept=".json"
          onChange={handleResultsFileChange}
          className="mt-1 block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {/* Сообщение об ошибке валидации */}
        {resultsFileError && <p className="text-red-500 mt-2 text-sm">{resultsFileError}</p>}
      </div>
      )}

      {submitError && <p className="text-red-500 mt-2 text-sm">{submitError}</p>}   

      <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
          Редактировать
      </button>
    </form>
  );
};

export default EditForm;