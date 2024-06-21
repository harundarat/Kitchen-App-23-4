import { Icon } from "@iconify/react/dist/iconify.js";

export default function CategoryCard(props) {
  let mouseDownTime = 0;
  const mouseUpHandle = () => {
    const mouseUpTime = Date.now();
    const clickDuration = mouseUpTime - mouseDownTime;

    if (clickDuration < 200) {
      props.onClick();
    }
  };

  if (props.isLoad === true) {
    return (
      <div className="group flex aspect-square h-fit w-full min-w-[140px] max-w-[152px] animate-pulse cursor-pointer select-none items-center justify-center overflow-hidden rounded-lg bg-gray-300 lg:min-w-[152px]">
        <Icon className="text-4xl text-bg" icon="uil:food" />
      </div>
    );
  }

  return (
    <div
      onMouseDown={() => (mouseDownTime = Date.now())}
      onMouseUp={() => mouseUpHandle()}
      className="group relative flex aspect-square h-fit w-full min-w-[140px] max-w-[152px] cursor-pointer select-none items-center justify-center overflow-hidden rounded-lg bg-black bg-opacity-30 lg:min-w-[152px]"
    >
      <img
        className="absolute -z-10 h-full w-full object-cover transition duration-200 group-hover:scale-105"
        src={props.image}
        alt="category image"
      />
      <h1 className="font-medium text-bg drop-shadow-md md:font-semibold">
        {props.title}
      </h1>
    </div>
  );
}
