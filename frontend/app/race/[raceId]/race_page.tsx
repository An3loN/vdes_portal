'use client'
import { get_allowed_classes, get_reserved_numbers, ParsedRace, Race } from "@/models/races";
import React, { useState, useEffect } from 'react';
import ToggleableList from "./car_dropdown";
import ModalForm from "./race_register_form";
import { unixTimePassed } from "@/utils/date_formats";
import { UserAuth } from "@/models/auth";

const race_register_url = '/api/race/register';

interface RacePageProps {
    race: ParsedRace;
    user_auth: UserAuth;
  }
  
  // Функция для форматирования оставшегося времени
  const formatTimeLeft = (timeLeft: number) => {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
  };
  
  
  export const RacePage: React.FC<RacePageProps> = ({ race, user_auth }) => {
    const [timeLeft, setTimeLeft] = useState(formatTimeLeft(Date.parse(race.date) - Date.now()));
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Открыть/закрыть модальное окно
    const toggleModal = () => {
      setIsModalOpen(!isModalOpen);
    };
    const closeModal = () => {
      setIsModalOpen(false);
    }

    const handleRegistrationSubmit = async (selectedCar: string, raceNum: number, carClass: string): Promise<boolean> => {
      try {
        const response = await fetch(race_register_url, {
          method: 'POST',
          body: JSON.stringify({
            'raceId': race.id,
            'selectedCar': selectedCar,
            'raceNum': raceNum,
            'carClass': carClass,
          }),
        });
        if(response.status != 200) {
          return false
        } 
        const result = await response.json() as {message?: string};
        console.log(result.message);
      } catch (error) {
        console.log(error);
        return false;
      }
      return true;
    }
  
    useEffect(() => {
      const timer = setInterval(() => {
        const remaining = new Date(Number(race.date) * 1000).getTime() - Date.now();
        setTimeLeft(formatTimeLeft(remaining));
      }, 1000);
  
      return () => clearInterval(timer); // Очищаем интервал при размонтировании
    }, [race.date]);
  
    return (
      <div className="p-4">
        {isModalOpen && (<ModalForm
          handleSubmit={handleRegistrationSubmit}
          closeModal={closeModal}
          reserved_numbers={get_reserved_numbers(race)}
          allowed_classes={get_allowed_classes(race)}
          active_registration={race.user_registration}
          />)}
        <div className="container mx-auto flex flex-col lg:flex-row">
          {/* Левая колонка */}
          <div className="lg:w-2/3 space-y-4">
            {/* Заголовок */}
            <h1 className="text-5xl font-bold">{race.title}</h1>
  
            {/* Навигация */}
            <div className="flex space-x-4 text-lg">
              <button className="py-2 px-4 text-gray-300 border-b-2 border-green-500">Описание</button>
              {/* <button className="py-2 px-4 text-gray-300">Участники</button> */}
            </div>
  
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
                      <div>{timeLeft.hours.toString().padStart(2, '0') || '--'}</div>
                      <div>:</div>
                      <div>{timeLeft.minutes.toString().padStart(2, '0') || '--'}</div>
                      <div>:</div>
                      <div>{timeLeft.seconds.toString().padStart(2, '0') || '--'}</div>
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
                          <p className="secondory-text-color font-semibold h-fit self-center"> Заполните данные в профиле для регистрации </p>
                        )
                      )
                    } 
                    </div>
                  </div>
                )
              )
            }

  
            {/* Описание */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <p dangerouslySetInnerHTML={{__html: race.description.replace(/(?:\r\n|\r|\n)/g, '<br>')}}></p>
            </div>
          </div>
  
          {/* Правая колонка */}
          <div className="lg:w-1/3 space-y-4 mt-8 lg:mt-0 lg:ml-8">
            {/* Картинка */}
            <div className="relative w-full h-80">
              <img src={race.image_url}
                alt={race.title}
                className="rounded-lg mr-4 object-cover"/>
            </div>
  
            {/* Доступные машины */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <label className="block text-gray-400 mb-2">ДОСТУПНЫЕ МАШИНЫ</label>
              {Object.values(race.car_classes).map((car_class, index) => (
                <ToggleableList
                key={index}
                items={car_class.cars}
                label={car_class.class_name}
                players={race.classes_registrations_count ? race.classes_registrations_count[car_class.class_name] : 0}
                max_players={car_class.capacity}/>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };