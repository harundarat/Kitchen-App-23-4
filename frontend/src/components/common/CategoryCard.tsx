import { Icon } from "@iconify/react";
import { useRef } from "react";

interface CategoryCardProps {
  image?: string;
  title?: string;
  isLoad?: boolean;
  onClick?: () => void;
}

export default function CategoryCard(props: CategoryCardProps) {
  const mouseDownTime = useRef(0);
  const mouseUpHandle = () => {
    const mouseUpTime = Date.now();
    const clickDuration = mouseUpTime - mouseDownTime.current;

    if (clickDuration < 200) {
      props.onClick?.();
    }
  };

  if (props.isLoad === true) {
    return (
      <div className="group flex aspect-square h-fit w-full max-w-[152px] min-w-[140px] animate-pulse cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-gray-300 select-none lg:min-w-[152px]">
        <Icon className="text-bg text-4xl" icon="uil:food" />
      </div>
    );
  }

  return (
    <div
      onMouseDown={() => (mouseDownTime.current = Date.now())}
      onMouseUp={() => mouseUpHandle()}
      className="group relative flex aspect-square h-fit w-full max-w-[152px] min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-black/30 select-none lg:min-w-[152px]"
    >
      <img
        className="absolute -z-10 h-full w-full object-cover transition duration-200 group-hover:scale-105"
        src={props.image}
        alt="category image"
      />
      <h1 className="text-bg font-medium drop-shadow-md md:font-semibold">
        {props.title}
      </h1>
    </div>
  );
}
