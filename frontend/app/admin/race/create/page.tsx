import RaceInputForm from "@/app/admin/race/create/create_race_form";
import { is_admin } from "@/utils/api";

export default async function Page() {
    if(!(await is_admin())) {
        return (<h1> Недостаточно прав </h1>);
    }
    return (
    <div className='flex justify-center items-center mt-10'>
        <div className="max-w-2xl">
            <RaceInputForm/>
        </div>
    </div>
      )
  }