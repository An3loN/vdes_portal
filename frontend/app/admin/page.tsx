import RaceList from "@/app/admin/race_list"
import { Race } from "@/models/races"
import { AxiosError } from "axios";
import { cookies } from "next/headers";
import Link from "next/link"

const get_races_url = 'http://backend:8000/api/admin/race/get_list'

export type ResponseData = Race[] | undefined;

export default async function Page() {
  let races = [] as Race[]
  try {
    const response = await fetch(get_races_url, {
      headers: {Cookie: "login="+cookies().get('login')?.value},
      next: { tags: ['race_list'] }
     });
    const data = JSON.parse(await response.json()) as ResponseData;
    if (data) {
      races = data;
    }
  } catch (error) {
    if(error instanceof AxiosError){
      return (<h1>{(error as AxiosError).request.data}</h1>)
    }
    else if (error instanceof Error) {
      return (<h1>{(error as Error).message}</h1>)
    }
    else return <h1>Something went wrong.</h1>;
  }
  return (
  <div className='flex justify-center items-center mt-10'>
    <div className="max-w-2xl p-2">
      <Link href="/admin/race/create" className="block text-center m-auto color-panel color-panel-hover p-4 rounded-md align-middle">
        Создать гонку
      </Link>
      <RaceList races={races}/>
    </div>
  </div>
    )
  }
  