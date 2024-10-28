import { parseRace, Race } from "@/models/races";
import React from 'react';
import { RacePage } from "./race_page";
import Header from "@/components/header";
import axios from "axios";
import { PageNotFoundError } from "next/dist/shared/lib/utils";
import { redirect } from "next/navigation";
import { get_user_auth } from "@/utils/api";
import ReturnLink from "@/components/main_page_link";


const get_race_url = 'http://backend:8000/api/race/get/';

type ResponseData = Race

export default async function Page({ params }: { params: { raceId: string } }) {
  let parsed_race;
  const user_auth = await get_user_auth();
  try {
      const response = await axios.get(get_race_url + params.raceId, { withCredentials: true });
      const race = JSON.parse(response.data) as ResponseData;
      if(!race) {
          throw PageNotFoundError;
      }
      parsed_race = parseRace(race, user_auth.steamid);
  } catch (error) {
      console.error('Ошибка при получении списка гонок:', error);
  } finally {
      if(!parsed_race) {
          redirect('/')
      }
  }
  return (
    <div>
      <Header user_auth={user_auth}/>
      <div className="mx-auto container">
        <ReturnLink/>
      </div>
      <RacePage race={parsed_race} user_auth={user_auth}/>
    </div>
  );
}