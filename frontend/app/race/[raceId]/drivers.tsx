import { Registration } from '@/models/races';
import React from 'react';

interface RaceDriversProps {
  registrations: Record<string, Registration>;
}

export const RaceDrivers: React.FC<RaceDriversProps> = ({ registrations }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg overflow-auto">
      <table className="min-w-full bg-gray-800 text-left border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b border-gray-700">Имя</th>
            <th className="px-4 py-2 border-b border-gray-700">Фамилия</th>
            <th className="px-4 py-2 border-b border-gray-700">Номер</th>
            <th className="px-4 py-2 border-b border-gray-700">Класс машины</th>
            <th className="px-4 py-2 border-b border-gray-700">Название машины</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(registrations).map((registration, index) => (
            <tr key={index} className="hover:bg-gray-700">
              <td className="px-4 py-2 border-b border-gray-700">{registration.name}</td>
              <td className="px-4 py-2 border-b border-gray-700">{registration.surname}</td>
              <td className="px-4 py-2 border-b border-gray-700">{registration.race_number}</td>
              <td className="px-4 py-2 border-b border-gray-700">{registration.car_class}</td>
              <td className="px-4 py-2 border-b border-gray-700">{registration.car}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
  );
};