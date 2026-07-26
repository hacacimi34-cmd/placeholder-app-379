import { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onDone?: () => void;
  className?: string;
}

export default function TypewriterText({
  text,
  speed = 22,
  onDone,
  className = "",
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    indexRef.current = 0;

    const interval = setInterval(() => {
      if (indexRef.current >= text.length) {
        clearInterval(interval);
        setDone(true);
        onDoneRef.current?.();
        return;
      }
      // \n xüsusi simvolu
      const char = text[indexRef.current];
      setDisplayed((prev) => prev + char);
      indexRef.current++;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  const handleSkip = () => {
    setDisplayed(text);
    indexRef.current = text.length;
    setDone(true);
    onDoneRef.current?.();
  };

  return (
    <div onClick={handleSkip} className={className} style={{ cursor: done ? "default" : "pointer" }}>
      <span style={{ whiteSpace: "pre-wrap" }}>{displayed}</span>
      {!done && <span className="inline-block w-0.5 h-5 ml-0.5 bg-amber-400 animate-pulse align-middle" />}
    </div>
  );
}
