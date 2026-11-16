import { Link } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import robotUrl from '../../../assets/img/robot.webp';
import wordmarkUrl from '../../../assets/img/wordmark.webp';

export interface HeroProps {
  onWatchDemo: () => void;
}

/**
 * Hero — "Build Smarter. Create Better." (layout taken from the Android app's
 * home screen: oversized wordmark, compact headline, two CTAs). `Get Started`
 * is a real React Router link into the console (`/dashboard`); `Learn More`
 * anchors to the About section; the demo video stays reachable from the muted
 * link.
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
            Build Smarter. Create Better.
          </h1>
          <div className="hero-actions hero-in">
            <Link className="btn btn-primary btn-lg" to="/dashboard" title="Open the DRYFTQ dashboard platform">
              Get Started <Icon name="arrow" className="icon-arrow" />
            </Link>
            <a className="btn btn-outline btn-lg" href="#about">
              Learn More
            </a>
          </div>
          <button className="hero-demo hero-in" type="button" aria-haspopup="dialog" onClick={onWatchDemo}>
            <Icon name="play" /> Watch the 90-second demo
          </button>
        </div>
      </div>
    </section>
  );
}
