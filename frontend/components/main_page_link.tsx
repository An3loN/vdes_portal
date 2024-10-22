import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

const ReturnLink: React.FC = () => {
  return (
    <Link href='/' className="flex max-w-fit">
        <ArrowUturnLeftIcon className="w-6"/>
        <h2 className="secondory-text-color min-w-fit text-lg ml-2"> К списку гонок </h2>
    </Link>
  );
};

export default ReturnLink;