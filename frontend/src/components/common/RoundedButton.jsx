function RoundedButton(props) {
  if (props.btnStroke === true) {
    return (
      <button
        onClick={props.onClick}
        className={`rounded-full border-[1px] border-primary bg-transparent px-4 py-1 font-medium text-primary outline-primary transition-all duration-75 hover:outline hover:outline-[2px] active:scale-95 ${props.className}`}
      >
        {props.name}
      </button>
    );
  }
  return (
    <>
      <button
        onClick={props.onClick}
        type={props.type}
        className={`rounded-full border-[1px] border-primary bg-primary px-4 py-1 font-medium text-bg outline-primary transition-all duration-75 hover:bg-opacity-90 hover:outline hover:outline-[2px] active:scale-95 ${props.className}`}
      >
        {props.name}
      </button>
    </>
  );
}
export default RoundedButton;
