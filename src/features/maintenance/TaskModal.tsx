import { Modal } from '../../components/ui';
import { Icon } from '../../components/Icon';
import type { MaintenanceStatus, MaintenanceTask } from '../../lib/types';
import { MUTED_BTN } from './shared';
import { MaintenanceStatusBadge, PriorityBadge } from './Badges';

export interface TaskModalProps {
  /** Live task looked up from store state on every render (no stale copies). */
  task: MaintenanceTask | null;
  onClose(): void;
  onTransition(taskId: string, status: MaintenanceStatus): void;
}

/**
 * Task Details & Status Transition dialog (legacy `#maint-task-modal`).
 * Transition buttons depend on the task's current status, exactly as the
 * legacy `openTaskModal()` injected them.
 */
export function TaskModal({ task, onClose, onTransition }: TaskModalProps) {
  return (
    <Modal
      open={task !== null}
      onClose={onClose}
      size="md"
      tone="dark"
      panelClassName="!bg-[#07243e]"
      aria-label={task ? `${task.task} maintenance task` : 'Maintenance task'}
    >
      {task && (
        <div className="space-y-5 pr-8">
          {/* Header: title + priority badge + meta */}
          <div className="border-b border-[#0d3459] pb-3">
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-bold text-white">{task.task}</h3>
              <PriorityBadge priority={task.priority} className="!px-2.5 !text-xs !font-bold" />
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Machine: {task.machine} · Type: {task.type}
            </p>
          </div>

          {/* Details block */}
          <div className="space-y-2 rounded-xl border border-[#0d3459] bg-white/[0.03] p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400">Current Status:</span>
              <MaintenanceStatusBadge status={task.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400">Assigned Technician:</span>
              <span className="font-bold text-white">{task.technician}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400">Target Due Date:</span>
              <span className="font-bold text-white">{task.dueDate}</span>
            </div>
            <div className="border-t border-[#0d3459] pt-2">
              <span className="mb-1 block font-semibold text-slate-400">Procedure Notes:</span>
              <p className="font-normal leading-relaxed text-slate-300">{task.notes || 'Routine standard procedure.'}</p>
            </div>
          </div>

          {/* Status Transition Actions */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Update Task Status</h4>
            <div className="flex flex-wrap items-center gap-3">
              {task.status === 'Upcoming' && (
                <>
                  <button
                    type="button"
                    className="btn btn-sm rounded-xl bg-amber-500 text-white hover:bg-amber-600"
                    onClick={() => onTransition(task.id, 'In Progress')}
                  >
                    Start Task (In Progress)
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={() => onTransition(task.id, 'Completed')}
                  >
                    Mark as Completed
                  </button>
                </>
              )}

              {task.status === 'In Progress' && (
                <button
                  type="button"
                  className="btn btn-sm rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => onTransition(task.id, 'Completed')}
                >
                  <span>Complete Work Order</span>
                  <Icon name="check" className="h-3.5 w-3.5" />
                </button>
              )}

              {task.status === 'Completed' && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Icon name="check" className="h-3.5 w-3.5" />
                  Work Order Completed and Verified
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#0d3459] pt-4">
            <button type="button" className={MUTED_BTN} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
