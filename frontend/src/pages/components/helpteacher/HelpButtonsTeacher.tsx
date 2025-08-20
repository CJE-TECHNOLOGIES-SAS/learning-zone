import '../help/styles/Help.css';

type HelpButtonsProps = {
  isLast: boolean;
  onNext: () => void;
  onSkip: () => void;
};

export default function HelpButtons({ isLast, onNext, onSkip }: HelpButtonsProps) {
  return (
    <div className="help-buttons">
        <button className="btn-help skip" onClick={onSkip}>Saltar</button>
      {!isLast && <button className="btn-help" onClick={onNext}>Siguiente</button>}

    </div>
  );
}
