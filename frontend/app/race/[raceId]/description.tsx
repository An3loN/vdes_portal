'use cliend';

import { UserAuth } from "@/models/auth";
import { ParsedRace } from "@/models/races";
import { unixTimePassed } from "@/utils/date_formats";
import { useEffect, useState } from "react";

const formatTimeLeft = (timeLeft: number) => {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
};

export const RaceDescription: React.FC<{race: ParsedRace, user_auth: UserAuth, toggleModal: ()=>void}> = ({race, user_auth, toggleModal}) => {
    const [timeLeft, setTimeLeft] = useState(formatTimeLeft(Date.parse(race.date) - Date.now()));
  
    useEffect(() => {
      const timer = setInterval(() => {
        const remaining = new Date(Number(race.date) * 1000).getTime() - Date.now();
        setTimeLeft(formatTimeLeft(remaining));
      }, 1000);
  
      return () => clearInterval(timer); // Очищаем интервал при размонтировании
    }, [race.date]);
    
    return (
        <div>
        {
            race.race_finished ?
            (
              <div className="border border-gray-700 p-4 rounded-lg space-y-2 flex">
                <div>
                  <div className="text-gray-700 text-xl font-semibold">Гонка завершена</div>
                </div>
              </div>
            ) : (
              unixTimePassed(race.date) ?
              (
                <div className="border border-orange-700 p-4 rounded-lg space-y-2 flex">
                  <div>
                    <div className="text-orange-700 text-xl font-semibold">Регистрация завершена</div>
                  </div>
                </div>
              ) : (
                <div className="border border-green-500 p-4 rounded-lg space-y-2 flex items-center">

                    {
                      race.user_registration ?
                      (
                        <div className="h-fit">
                          <div className="text-green-500 text-xl font-semibold">Вы зарегистрированы</div>
                          <div className="text-sm text-gray-400">Ваша машина: {race.user_registration.car}</div>
                        </div>
                      ) : (
                        <div className="h-fit">
                          <div className="text-green-500 text-xl font-semibold">Регистрация открыта</div>
                          <div className="text-sm text-gray-400">ЗАКРЫВАЕТСЯ ЧЕРЕЗ</div>
                        </div>
                      )
                    }

                <div className="flex-grow"></div>
                  <div className="text-4xl flex space-x-2 justify-self-end mr-4">
                    <div>{(timeLeft.hours || timeLeft.hours == 0 ) ? timeLeft.hours.toString().padStart(2, '0') : '--'}</div>
                    <div>:</div>
                    <div>{(timeLeft.minutes || timeLeft.minutes == 0) ? timeLeft.minutes.toString().padStart(2, '0') : '--'}</div>
                    <div>:</div>
                    <div>{(timeLeft.seconds || timeLeft.seconds == 0) ? timeLeft.seconds.toString().padStart(2, '0') : '--'}</div>
                  </div>
                  <div className="max-w-60">
                  {
                    !user_auth.is_authorized ?
                    (
                      <p className="secondory-text-color font-semibold h-fit self-center"> Авторизуйтесь для регистрации </p>
                    ) : (
                      user_auth.is_registered ?
                      (
                        race.user_registration ?
                        (
                          <button onClick={toggleModal} className="border border-green-500 text-green-500 py-2 px-4 rounded-md hover:bg-green-500 hover:text-black transition ml-2 mr-2">Изменить регистрацию</button>
                        ) : (
                          <button onClick={toggleModal} className="border border-green-500 text-green-500 py-2 px-4 rounded-md hover:bg-green-500 hover:text-black transition ml-2 mr-2">Зарегистрироваться</button>
                        )
                      ) : (
                        <p className="text-red-700 font-semibold h-fit self-center"> Заполните данные в профиле для регистрации </p>
                      )
                    )
                  } 
                  </div>
                </div>
              )
            )
          }


          {/* Описание */}
          <div className="color-panel p-4 rounded-lg mt-2">
            <p dangerouslySetInnerHTML={{__html: race.description.replace(/(?:\r\n|\r|\n)/g, '<br>')}}></p>
          </div>
        </div>
    );
}