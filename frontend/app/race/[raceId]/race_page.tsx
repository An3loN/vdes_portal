'use client'
import { Car, get_allowed_classes, get_reserved_numbers, ParsedRace } from "@/models/races";
import React, { useState } from 'react';
import CarList from "./car_dropdown";
import ModalForm from "./race_register_form";
import { UserAuth } from "@/models/auth";
import { RaceDescription } from "./description";
import { RaceResults } from "./results";
import { RaceDrivers } from "./drivers";
import { AdminRaceDrivers } from "./admin_drivers";
import { useRouter } from "next/navigation";
import WeatherSummary from "@/components/weather_summary";

const race_register_url = '/api/race/register';
const delete_registration_url = '/api/race/delete_registration/';
const admin_delete_registration_url = '/api/race/{race_id}/delete_registration/{user_id}';

interface RacePageProps {
    race: ParsedRace;
    user_auth: UserAuth;
  }
  
  // Функция для форматирования оставшегося времени

  
  
  export const RacePage: React.FC<RacePageProps> = ({ race, user_auth }) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [pickedCar, setPickedCar] = useState<Car | undefined>(undefined);
    const [activeTab, setActiveTab] = useState<'description' | 'drivers' | 'results'>('description');

    const router = useRouter();

    const handleTabChange = (tab: 'description' | 'drivers' | 'results') => {
      setActiveTab(tab);
    };

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
        console.error(error);
        return false;
      }
      return true;
    }

    const handleRegistrationDelete = async (): Promise<boolean> => {
      try {
        const response = await fetch(delete_registration_url + race.id, {
          method: 'DELETE',
        });
        if(response.status != 200) {
          return false
        } 
        const result = await response.json() as {message?: string};
        console.log(result.message);
      } catch (error) {
        console.error(error);
        return false;
      }
      return true;
    }

    const handleAdminRegistrationDelete = async (user_id: string) => {
      if(!confirm("Вы уверены, что хотите удалить регистрацию?")) return;
      try {
        let url = admin_delete_registration_url
        url = url.replace('{race_id}', race.id);
        url = url.replace('{user_id}', user_id);
        const response = await fetch(url, {
          method: 'DELETE',
        });
        if(response.status != 200) {
          return;
        } 
        const result = await response.json() as {message?: string};
        router.refresh();
        console.log(result.message);
      } catch (error) {
        console.error(error);
        return;
      }
    }

    const handleCarPick = (car: Car) => {
      setPickedCar(car);
      toggleModal();
    }
  
    return (
      <div className="p-4">
        {isModalOpen && (<ModalForm
          handleSubmit={handleRegistrationSubmit}
          handleDelete={handleRegistrationDelete}
          closeModal={closeModal}
          reserved_numbers={get_reserved_numbers(race)}
          allowed_classes={get_allowed_classes(race)}
          active_registration={race.user_registration}
          picked_car={pickedCar}
          />)}
        <div className="container mx-auto flex flex-col lg:flex-row">
          {/* Левая колонка */}
          <div className="lg:w-2/3 space-y-4">
            {/* Заголовок */}
            <h1 className="text-5xl font-bold">{race.title}</h1>
  
            {/* Навигация */}
            <div className="flex space-x-4 text-lg">
              <button
              className={"py-2 px-4 text-gray-300" + (activeTab == 'description' ? " border-b-2 border-green-500" : "")}
              onClick={() => handleTabChange('description')}
              >Описание</button>
              <button
              className={"py-2 px-4 text-gray-300" + (activeTab == 'drivers' ? " border-b-2 border-green-500" : "")}
              onClick={() => handleTabChange('drivers')}
              >Участники</button>
              {
                (race.race_finished && race.results) && (
                  <button
                  className={"py-2 px-4 text-gray-300" + (activeTab == 'results' ? " border-b-2 border-green-500" : "")}
                  onClick={() => handleTabChange('results')}
                  >Результаты</button>
                )
              }
            </div>
            {
              activeTab == 'description' && 
              <RaceDescription race={race} user_auth={user_auth} toggleModal={toggleModal}/>
            }
            {
              (activeTab == 'drivers') && (
                user_auth.is_admin && !race.race_finished ?
                <AdminRaceDrivers handleDelete={handleAdminRegistrationDelete} registrations={race.registrations} />
                :
                <RaceDrivers registrations={race.registrations}/>
              ) 
            }
            {
              (activeTab == 'results') && (
                race.results ? (
                  <RaceResults results={race.results}/>
                ) : (
                  <p>Результаты будут доступны в ближайшее время</p>
                )
              ) 
            }

          </div>
  
          {/* Правая колонка */}
          <div className="lg:w-1/3 space-y-4 mt-8 lg:mt-0 lg:ml-8">
            {/* Картинка */}
            <div className="relative w-full h-80">
              <img src={race.image_url}
                alt={race.title}
                className="rounded-lg mr-4 object-cover"/>
            </div>

            <div className="color-panel p-4 rounded-lg">
              <label className="block secondory-text-color mb-2"> ПОГОДНЫЕ УСЛОВИЯ </label>
              <WeatherSummary weather={race.weather} air_temperature={race.air_temperature} track_temperature={race.track_temperature}/>
            </div>
  
            {/* Доступные машины */}
            <div className="color-panel p-4 rounded-lg">
              <label className="block secondory-text-color mb-2">ДОСТУПНЫЕ МАШИНЫ</label>
              {Object.values(race.car_classes).map((car_class, index) => (
                <CarList
                handleCarPick={handleCarPick}
                key={index}
                cars={car_class.cars.map((car_name) => 
                  ({
                    class_name: car_class.class_name,
                    name: car_name
                  } as Car))}
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