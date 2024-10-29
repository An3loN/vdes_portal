import { Car } from '@/models/races';
import { UsersIcon } from '@heroicons/react/20/solid';
import React, { useState } from 'react';

type CarListProps = {
  handleCarPick: (car: Car) => void;
  cars: Car[];
  label: string;
  max_players: number;
  players: number;
}

const CarList: React.FC<CarListProps> = ({handleCarPick, cars, label, max_players, players}) => {
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
        className="color-button color-button-hover text-white border border-gray-700 py-2 px-4 rounded-md w-full transition"
      >
        <div className='flex justify-center'>
          <p>{label}</p>
          <p className='ml-2'> {players}/{max_players} </p>
          <UsersIcon className='max-w-4 ml-1'/>
        </div>
      </button>

      {/* Список элементов */}
      {isListVisible && (
        <div className="mt-4 w-full max-w-md color-button rounded-md shadow-md p-4 overflow-x-hidden overflow-y-auto min-h-28 max-h-40">
          <ul>
            {cars.map((car, index) => (
              <li key={index} onClick={() => handleCarPick(cars[index])} className="py-2 border-b border-gray-400 color-button color-button-hover last:border-none text-white">
                {car.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CarList;