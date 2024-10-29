import { Registration } from '@/models/races';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import React from 'react';

interface AdminRaceDriversProps {
  handleDelete: (user_id: string) => void;
  registrations: Record<string, Registration>;
}

export const AdminRaceDrivers: React.FC<AdminRaceDriversProps> = ({ handleDelete, registrations }) => {
  return (
    <div className="panel-color p-6 rounded-lg overflow-auto">
      <table className="min-w-full panel-color text-left border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b border-gray-700">Имя</th>
            <th className="px-4 py-2 border-b border-gray-700">Фамилия</th>
            <th className="px-4 py-2 border-b border-gray-700">Номер</th>
            <th className="px-4 py-2 border-b border-gray-700">Класс машины</th>
            <th className="px-4 py-2 border-b border-gray-700">Название машины</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {Object.values(registrations).map((registration, index) => (
            <tr key={index} className="button-color-hover">
              <td className="px-4 py-2 border-b border-gray-700">{registration.name}</td>
              <td className="px-4 py-2 border-b border-gray-700">{registration.surname}</td>
              <td className="px-4 py-2 border-b border-gray-700">{registration.race_number}</td>
              <td className="px-4 py-2 border-b border-gray-700">{registration.car_class}</td>
              <td className="px-4 py-2 border-b border-gray-700">{registration.car}</td>
              <td>
                <button onClick={() => handleDelete(registration.steamid)} title='Выгнать участника' className='bg-red-500 rounded-md hover:bg-red-700'>
                  <ExclamationTriangleIcon className='text-black w-7 h-7'/>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
  );
};