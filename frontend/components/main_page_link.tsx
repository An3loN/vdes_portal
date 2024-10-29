'use client';
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

const ReturnLink: React.FC = () => {
  const router = useRouter();
  return (
    <button onClick={() => {
      router.back();
      router.refresh();
    }} className="flex max-w-fit">
        <ArrowUturnLeftIcon className="w-6"/>
        <h2 className="secondory-text-color min-w-fit text-lg ml-2"> Назад </h2>
    </button>
  );
};

export default ReturnLink;