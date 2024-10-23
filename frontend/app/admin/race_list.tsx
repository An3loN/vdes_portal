'use client';
import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation'
import { Race } from '@/models/races';
import { formatDate } from '@/utils/date_formats';

type RaceList = {
  races: Race[]
}

const RaceList: React.FC<RaceList> = (prop: RaceList) => {
  const router = useRouter();
  return (
    <div className="p-4 flex-col items-stretch justify-items-stretch">
      {prop.races.map((race, index) => (
        <button key={index} onClick={() => router.push('/admin/race/' + race.id)} className="flex color-panel color-panel-hover items-center mb-4 p-4 rounded-lg shadow-md min-w-full">
          <img
            src={race.image_url}
            alt={race.title}
            className="max-w-22 max-h-12 rounded-lg mr-2"
          />
          <div className="flex-grow">
            <h2 className="text-lg font-semibold">{race.title}</h2>
            <p className="text-sm">{formatDate(race.date)}</p>
          </div>
          <Bars3Icon className="size-6 ml-auto" />
        </button>
      ))}
    </div>
  );
};

export default RaceList;
