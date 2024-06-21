import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";



const CardProfile = (props) => {
    const handleClick = () => {
        console.log(`${props.id} clicked`);
      };
  return (
    <div
      className="group w-full max-w-[255px] cursor-pointer select-none"
      onClick={props.onClick || handleClick}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg">
        {/* image recipe */}
        <img
          src={props.image}
          alt="Recipe Image"
          className="absolute -z-10 aspect-square w-full rounded-lg object-cover transition duration-300 ease-in-out group-hover:scale-105"
        />

        {/* time cook */}
        <div className="absolute left-3 top-3 flex w-fit items-center gap-1 rounded-full bg-accent-2 px-2 py-1 text-bg shadow-md">
          <Icon className="text-sm" icon="mingcute:time-line" />
          <p className="text-xs">{props.time}</p>
        </div>
           {/* EDIT BUTTON */}
           <Link 
          to={'/'}>
          <div className="absolute right-3 top-3 flex w-fit items-center gap-1 rounded-full bg-white p-2 text-bg shadow-md">
          <Icon className="text-md text-black" icon="material-symbols-light:edit-outline" />
          </div>
        </Link>

        {/* likes */}
        <div className="absolute bottom-3 right-3 flex w-fit items-center gap-1 rounded-full bg-bg px-2 py-1 text-primary shadow-lg">
          <Icon icon="icon-park-outline:like" />
          <p className="text-sm font-medium">{props.likes}</p>
        </div>
      </div>
      <div className="mt-2 flex w-full flex-col gap-2">
        {/* tittle recipe */}
        <h3 className="line-clamp-2 max-w-[255px] font-medium leading-tight md:font-semibold">
          {props.tittle}
        </h3>

        {/* creator */}
        <div className="flex items-center gap-1">
          <img
            className="aspect-square w-8 rounded-full object-cover"
            src={props.creatorImage}
            alt="Creator Image"
          />
          <p className="line-clamp-1 text-accent-1 text-opacity-80 md:font-medium">
            {props.creatorName}
          </p>
        </div>
      </div>
    </div>
  )
}

export default CardProfile