import "./Loader.css";

export default function Loader({ text = "Loading..." }) {
  return (
    <div className="loader-wrap">
      <div className="tire-loader">
        <div className="tire-hub" />
      </div>
      <p className="muted small">{text}</p>
    </div>
  );
}