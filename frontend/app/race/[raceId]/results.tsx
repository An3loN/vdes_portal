import { Results } from '@/models/races';
import React from 'react';

interface RacePageProps {
  results: Results;
}

function formatLapTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  // Форматируем строку в формате "минуты.секунды.миллисекунды"
  return `${minutes}.${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

export const RaceResults: React.FC<RacePageProps> = ({ results }) => {
  return (
    <div className="panel-color p-6 rounded-lg overflow-auto">
      <table className="min-w-full panel-color text-left border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b border-gray-700">Место</th>
            <th className="px-4 py-2 border-b border-gray-700">Имя</th>
            <th className="px-4 py-2 border-b border-gray-700">Фамилия</th>
            <th className="px-4 py-2 border-b border-gray-700">Номер</th>
            <th className="px-4 py-2 border-b border-gray-700">Класс машины</th>
            <th className="px-4 py-2 border-b border-gray-700">Название машины</th>
            <th className="px-4 py-2 border-b border-gray-700">Количество кругов</th>
            <th className="px-4 py-2 border-b border-gray-700">Лучший круг мин.с.мс</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(results.rows).map((result, index) => (
            <tr key={index} className="button-color-hover">
              <td className="px-4 py-2 border-b border-gray-700">{result.place}</td>
              <td className="px-4 py-2 border-b border-gray-700">{result.user.name}</td>
              <td className="px-4 py-2 border-b border-gray-700">{result.user.surname}</td>
              <td className="px-4 py-2 border-b border-gray-700">{result.race_number}</td>
              <td className="px-4 py-2 border-b border-gray-700">{result.car_class}</td>
              <td className="px-4 py-2 border-b border-gray-700">{result.car}</td>
              <td className="px-4 py-2 border-b border-gray-700">{result.lap_count}</td>
              <td className="px-4 py-2 border-b border-gray-700">{formatLapTime(result.best_lap)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
  );
};