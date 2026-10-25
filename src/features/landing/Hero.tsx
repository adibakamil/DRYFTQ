import { Link } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import robotUrl from '../../../assets/img/robot.webp';
import wordmarkUrl from '../../../assets/img/wordmark.webp';

export interface HeroProps {
  onWatchDemo: () => void;
}

/**
 * Hero — "Prevent the Unexpected". `Explore Platform` is a real React Router
 * link to the console (`/dashboard`), never a modal; `Watch Demo` opens the
 * video dialog.
 */
export function Hero({ onWatchDemo }: HeroProps) {
  return (
    <section id="hero" aria-labelledby="hero-title" className="overflow-hidden">
      <div className="container-x hero-grid">
        <div className="hero-art">
          <img
            src={robotUrl}
            width={379}
            height={375}
            alt="Futuristic white industrial AI robot with orange accents, shown in profile"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="hero-copy">
          <img
            className="hero-wordmark hero-in"
            src={wordmarkUrl}
            width={433}
            height={178}
            alt="DRYFTQ"
            fetchPriority="high"
            decoding="async"
          />
          <h1 className="hero-title hero-in" id="hero-title">
            <span className="text-brand" aria-hidden="true">#</span> Prevent the Unexpected<span className="text-brand">.</span>
          </h1>
          <p className="lead hero-in max-w-[34rem]">
            DRYFTQ combines machine data, human insights and quantum intelligence to detect subtle process drift
            early—reducing downtime, waste and quality loss.
          </p>
          <div className="hero-actions hero-in">
            <Link className="btn btn-primary btn-lg" to="/dashboard" title="Open the DRYFTQ dashboard platform">
              Explore Platform <Icon name="arrow" className="icon-arrow" />
            </Link>
            <button className="btn btn-outline btn-lg" type="button" aria-haspopup="dialog" onClick={onWatchDemo}>
              <Icon name="play" /> Watch Demo <Icon name="arrow" className="icon-arrow text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
