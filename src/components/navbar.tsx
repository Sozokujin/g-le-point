"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import {
  MapIcon,
  StarIcon,
  PlusIcon,
  UserGroupIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import {
  MapIcon as SolidMapIcon,
  StarIcon as SolidStarIcon,
  UserGroupIcon as SolidUserGroupIcon,
  UserIcon as SolidUserIcon
} from "@heroicons/react/24/solid";
import classes from "@/styles/navbar.module.css";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 w-full z-10">
      <nav className={classes.navContainer}>
        <Link href="/map">
          {pathname === '/map'
            ? <SolidMapIcon className={classes.icon + ' active'} />
            : <MapIcon className={classes.icon} />
          }
        </Link>
        <Link href="/leaderboard">
          {pathname === '/leaderboard'
            ? <SolidStarIcon className={classes.icon + ' active'} />
            : <StarIcon className={classes.icon} />
          }
        </Link>
        <div className="-mt-7 sm:-mt-9 rounded-full">
          <Link href="/map" className="block bg-[#37b978] p-2.5 sm:p-3 rounded-full">
            <PlusIcon className={classes.icon + ' !text-white'} />
          </Link>
        </div>
        <Link href="/friends">
          {pathname === '/friends'
            ? <SolidUserGroupIcon className={classes.icon + ' active'} />
            : <UserGroupIcon className={classes.icon} />
          }
        </Link>
        <Link href="/profile">
          {pathname === '/profile'
            ? <SolidUserIcon className={classes.icon + ' active'} />
            : <UserIcon className={classes.icon} />
          }
        </Link>
      </nav>
    </div>
  );
};

export default Navbar;
