import { ParsedRace, parseRace, Race } from "@/models/races";
import { MainContent } from "./main_content";
import axios from "axios";
import Header from "@/components/header";
import { get_user_auth } from "@/utils/api";

const get_races_url = 'http://backend:8000/api/race/get_list/'

export type ResponseData = Race[] | undefined;

export default async function Page() {
  const user_auth = await get_user_auth();
  let parsed_races = [] as ParsedRace[]
  try {
    const response = await axios.get(get_races_url, { withCredentials: true });
    const data = JSON.parse(response.data) as ResponseData;
    if (data) {
      parsed_races = data.map(race => parseRace(race, user_auth.steamid));
    }
  } catch (error) {
    console.error('Ошибка при получении списка гонок:', error);
  }
  return (
    <div>
      <Header user_auth={user_auth}/>
      <div className="flex flex-col items-center">
        <h1 className="text-4xl"> Предстоящие события </h1>
        <main className="flex items-center color-panel mt-4">
          <MainContent races={parsed_races}/>
        </main>
      </div>
    </div>
  );
}