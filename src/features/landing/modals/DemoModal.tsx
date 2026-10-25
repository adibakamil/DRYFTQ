import { Icon } from '../../../components/Icon';
import { Modal } from '../../../components/ui';

export interface DemoModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * "Watch Demo" video dialog. Uses the shared dark Modal (focus trap, Esc,
 * backdrop click) but renders the close button itself so it stacks above the
 * aspect-video placeholder, exactly like the legacy `#videoModal`.
 */
export function DemoModal({ open, onClose }: DemoModalProps) {
  return (
    <Modal open={open} onClose={onClose} size="lg" tone="dark" labelledBy="videoTitle" hideClose>
      <button
        className="modal-close !text-gray-300 hover:!bg-white/10 hover:!text-white"
        type="button"
        aria-label="Close dialog"
        style={{ zIndex: 2 }}
        onClick={onClose}
      >
        <Icon name="close" />
      </button>
      <div className="relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-lg border border-gray-800 bg-gradient-to-tr from-[#111519] to-[#1e252c] p-6 text-center">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-action text-white">
          <Icon name="play" className="!h-7 !w-7 translate-x-0.5" />
        </span>
        <h2 className="text-lg font-bold text-white" id="videoTitle">
          DRYFTQ Platform Architecture Walkthrough
        </h2>
        <p className="mt-1 text-sm text-gray-300">
          Autonomous Drift Detection in Automated Production Cells — video coming soon.
        </p>
      </div>
    </Modal>
  );
}
