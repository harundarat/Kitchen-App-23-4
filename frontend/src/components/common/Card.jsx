import React, { useState } from "react";
import { Icon } from "@iconify/react";
import BlankProfile from "../../assets/blank_profile.webp";
import { useNavigate } from "react-router-dom";

export default function Card(props) {
  const navigate = useNavigate();
  const handleClick = () => {
    // console.log(`${props.id} clicked`);
    if (props.id) {
      navigate(`/recipe/${props.id}`);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };
  const handleEditClick = (e) => {
    e.stopPropagation();
    navigate(`/recipe/edit/${props.id}`);
  };

  if (props.isLoad) {
    return (
      <div className="flex aspect-[9/10] w-full max-w-[255px] animate-pulse flex-col gap-2 overflow-hidden rounded-lg">
        <div className="h-[75%] w-full rounded-lg bg-gray-300"></div>
        <div className="h-[6%] w-full rounded-lg bg-gray-300"></div>
        <div className="flex items-center gap-3">
          <div className="aspect-square w-[15%] rounded-full bg-gray-300"></div>
          <div className="h-[35%] w-[50%] rounded-full bg-gray-300"></div>
        </div>
      </div>
    );
  }

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
          <p className="text-xs">{formatMinute(parseInt(props.time))}</p>
        </div>

        {/* Edit */}
        {props.editor === true && (
          <div>
            <button
              className="absolute right-3 top-3 flex aspect-square w-9 items-center justify-center rounded-full bg-bg p-1 text-primary shadow-md transition-none hover:bg-gray-200 lg:w-10"
              onClick={(e) => handleEditClick(e)}
            >
              <Icon className="text-lg" icon="material-symbols:edit-outline" />
            </button>
          </div>
        )}

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
        <div className="flex items-center gap-2">
          <img
            className="aspect-square w-8 rounded-full object-cover"
            src={props.creatorImage || BlankProfile}
            alt="Creator Image"
          />
          <p className="line-clamp-1 text-accent-1 text-opacity-80 md:font-medium">
            {props.creatorName || "Creator"}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatMinute(menit) {
  let jam = Math.floor(menit / 60);
  let sisaMenit = menit % 60;

  if (jam > 0 && sisaMenit > 0) {
    return `${jam} j ${sisaMenit} m`;
  } else if (jam > 0) {
    return `${jam} j`;
  } else {
    return `${sisaMenit} m`;
  }
}
