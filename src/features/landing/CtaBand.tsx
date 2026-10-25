import { Icon } from '../../components/Icon';

export interface CtaBandProps {
  onTalkToTeam: () => void;
}

/** Orange CTA band above the footer. */
export function CtaBand({ onTalkToTeam }: CtaBandProps) {
  return (
    <section
      className="on-brand relative bg-brand-action text-white"
      id="contact"
      aria-labelledby="cta-h"
      style={{ paddingBlock: 'clamp(3.5rem,7vw,5rem)' }}
    >
      <div className="container-x reveal text-center">
        <h2 className="h2 !text-white" id="cta-h">
          Ready to prevent the unexpected?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-lg text-white/90">Drive efficiency, quality and uptime with DRYFTQ.</p>
        <button className="btn btn-white btn-lg mt-7" type="button" aria-haspopup="dialog" onClick={onTalkToTeam}>
          Talk to Our Team <Icon name="arrow" className="icon-arrow" />
        </button>
      </div>
    </section>
  );
}
