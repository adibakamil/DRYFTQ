import type { FormEvent } from 'react';
import { Field, Modal, Select, TextArea, TextInput } from '../../components/ui';
import type { Machine, MaintenanceType, Priority } from '../../lib/types';
import {
  ACCENT_BTN,
  FIELD_DARK,
  INPUT_DARK,
  MAINTENANCE_TYPES,
  MUTED_BTN,
  PRIORITIES,
  TECHNICIANS,
  type NewTaskDraft,
} from './shared';

export interface NewTaskModalProps {
  open: boolean;
  machines: Machine[];
  draft: NewTaskDraft;
  onDraft(patch: Partial<NewTaskDraft>): void;
  onClose(): void;
  onSubmit(e: FormEvent<HTMLFormElement>): void;
}

/**
 * New Maintenance Order dialog (legacy `#new-maint-modal` / `handleCreateNewMaintenance`).
 * Machine options render as `<id> (<name>)` from live state.
 */
export function NewTaskModal({ open, machines, draft, onDraft, onClose, onSubmit }: NewTaskModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      tone="dark"
      panelClassName="!bg-[#07243e]"
      labelledBy="new-maint-heading"
    >
      <div className="space-y-5 pr-8">
        <div className="border-b border-[#0d3459] pb-3">
          <h3 id="new-maint-heading" className="text-lg font-bold text-white">
            Create New Maintenance Task
          </h3>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Task Title" htmlFor="new-task-title" required className={FIELD_DARK}>
            <TextInput
              id="new-task-title"
              required
              className={INPUT_DARK}
              placeholder="e.g. Spindle Bearing Replacement"
              value={draft.task}
              onChange={(e) => onDraft({ task: e.target.value })}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Target Machine" htmlFor="new-task-machine" required className={FIELD_DARK}>
              <Select
                id="new-task-machine"
                required
                className={INPUT_DARK}
                value={draft.machine}
                onChange={(e) => onDraft({ machine: e.target.value })}
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#07243e] text-white">
                    {m.id} ({m.name})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Maintenance Type" htmlFor="new-task-type" className={FIELD_DARK}>
              <Select
                id="new-task-type"
                className={INPUT_DARK}
                value={draft.type}
                onChange={(e) => onDraft({ type: e.target.value as MaintenanceType })}
              >
                {MAINTENANCE_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-[#07243e] text-white">
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Priority" htmlFor="new-task-priority" className={FIELD_DARK}>
              <Select
                id="new-task-priority"
                className={INPUT_DARK}
                value={draft.priority}
                onChange={(e) => onDraft({ priority: e.target.value as Priority })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p} className="bg-[#07243e] text-white">
                    {p}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Assigned Technician" htmlFor="new-task-tech" className={FIELD_DARK}>
              <Select
                id="new-task-tech"
                className={INPUT_DARK}
                value={draft.technician}
                onChange={(e) => onDraft({ technician: e.target.value })}
              >
                {TECHNICIANS.map((t) => (
                  <option key={t} value={t} className="bg-[#07243e] text-white">
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Scheduled Due Date" htmlFor="new-task-due" className={FIELD_DARK}>
            <TextInput
              id="new-task-due"
              className={INPUT_DARK}
              value={draft.dueDate}
              onChange={(e) => onDraft({ dueDate: e.target.value })}
            />
          </Field>

          <Field label="Scope & Instructions" htmlFor="new-task-notes" className={FIELD_DARK}>
            <TextArea
              id="new-task-notes"
              rows={2}
              className={`${INPUT_DARK} min-h-[72px]`}
              placeholder="Specify steps, torque tolerances, and safety lockout..."
              value={draft.notes}
              onChange={(e) => onDraft({ notes: e.target.value })}
            />
          </Field>

          <div className="flex items-center justify-end gap-3 border-t border-[#0d3459] pt-3">
            <button type="button" className={MUTED_BTN} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={ACCENT_BTN}>
              Create Work Order
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
