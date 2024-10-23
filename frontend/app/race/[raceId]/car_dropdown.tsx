import { UsersIcon } from '@heroicons/react/20/solid';
import React, { useState } from 'react';


const ToggleableList: React.FC<{ items: string[], label: string, max_players: number, players: number }> = ({items, label, max_players, players}) => {
  const [isListVisible, setIsListVisible] = useState<boolean>(false);

  // Функция для переключения видимости списка
  const toggleListVisibility = () => {
    setIsListVisible(!isListVisible);
  };

  return (
    <div className="flex flex-col items-center py-1 px-6">
      {/* Кнопка */}
      <button
        onClick={toggleListVisibility}
        className="bg-gray-900 text-white border border-gray-700 py-2 px-4 rounded-md w-full hover:bg-gray-800 transition"
      >
        <div className='flex justify-center'>
          <p>{label}</p>
          <p className='ml-2'> {players}/{max_players} </p>
          <UsersIcon className='max-w-4 ml-1'/>
        </div>
      </button>

      {/* Список элементов */}
      {isListVisible && (
        <div className="mt-4 w-full max-w-md bg-gray-900 rounded-md shadow-md p-4 overflow-x-hidden overflow-y-auto min-h-28 max-h-40">
          <ul>
            {items.map((item, index) => (
              <li key={index} className="py-2 border-b border-gray-700 last:border-none text-white">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ToggleableList;