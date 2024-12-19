import Link from "next/link";
import { FC } from "react";
import { api } from "~/utils/api";

interface dashboardProps {}

const dashboard: FC<dashboardProps> = ({}) => {
  return (
    <div className=" flex h-screen w-full items-center justify-center gap-8 font-medium">
      <Link className=" bg-gray-100 p-2 rounded-md" href="/dashboard/opening">
        Opening hours
      </Link>
      <Link className=" bg-gray-100 p-2 rounded-md" href="/dashboard/menu">
        Menu
      </Link>
    </div>
  );
};

export default dashboard;
