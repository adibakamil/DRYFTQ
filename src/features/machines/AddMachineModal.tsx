import type { FormEvent } from 'react';
import { Field, Modal, Select, TextInput } from '../../components/ui';
import type { MachineStatus } from '../../lib/types';
import { ACCENT_BTN, FIELD_DARK, MUTED_BTN, type MachineDraft } from './shared';

export interface AddMachineModalProps {
  open: boolean;
  draft: MachineDraft;
  onDraft(patch: Partial<MachineDraft>): void;
  onClose(): void;
  onSubmit(e: FormEvent<HTMLFormElement>): void;
}

/** Register New Machine dialog (legacy `#add-machine-modal` / `#add-machine-form`). */
export function AddMachineModal({ open, draft, onDraft, onClose, onSubmit }: AddMachineModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      tone="dark"
      panelClassName="!bg-[#07243e]"
      labelledBy="add-machine-heading"
    >
      <div className="space-y-5 pr-8">
        <div className="border-b border-[#0d3459] pb-3">
          <h2 id="add-machine-heading" className="text-lg font-bold text-white">
            Register New Machine
          </h2>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Machine ID" htmlFor="new-mach-id" required className={FIELD_DARK}>
              <TextInput
                id="new-mach-id"
                required
                placeholder="e.g. CNC-03"
                value={draft.id}
                onChange={(e) => onDraft({ id: e.target.value })}
              />
            </Field>
            <Field label="Line / Location" htmlFor="new-mach-line" required className={FIELD_DARK}>
              <Select id="new-mach-line" value={draft.line} onChange={(e) => onDraft({ line: e.target.value })}>
                <option value="Line 1">Line 1</option>
                <option value="Line 2">Line 2</option>
                <option value="Line 3">Line 3</option>
                <option value="Line 4">Line 4</option>
              </Select>
            </Field>
          </div>

          <Field label="Machine Name / Model" htmlFor="new-mach-name" required className={FIELD_DARK}>
            <TextInput
              id="new-mach-name"
              required
              placeholder="e.g. 5-Axis Vertical Machining Center"
              value={draft.name}
              onChange={(e) => onDraft({ name: e.target.value })}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Operational Status" htmlFor="new-mach-status" className={FIELD_DARK}>
              <Select
                id="new-mach-status"
                value={draft.status}
                onChange={(e) => onDraft({ status: e.target.value as MachineStatus })}
              >
                <option value="Running">Running</option>
                <option value="Idle">Idle</option>
                <option value="Maintenance">Maintenance</option>
              </Select>
            </Field>
            <Field label="Initial Load (%)" htmlFor="new-mach-load" className={FIELD_DARK}>
              <TextInput
                id="new-mach-load"
                type="number"
                min={0}
                max={100}
                value={draft.load}
                onChange={(e) => onDraft({ load: e.target.value })}
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Temp (°C)" htmlFor="new-mach-temp" className={FIELD_DARK}>
              <TextInput
                id="new-mach-temp"
                type="number"
                value={draft.temp}
                onChange={(e) => onDraft({ temp: e.target.value })}
              />
            </Field>
            <Field label="Vibration (mm/s)" htmlFor="new-mach-vib" className={FIELD_DARK}>
              <TextInput
                id="new-mach-vib"
                type="number"
                step={0.1}
                value={draft.vibration}
                onChange={(e) => onDraft({ vibration: e.target.value })}
              />
            </Field>
            <Field label="Power (kW)" htmlFor="new-mach-power" className={FIELD_DARK}>
              <TextInput
                id="new-mach-power"
                value={draft.power}
                onChange={(e) => onDraft({ power: e.target.value })}
              />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#0d3459] pt-3">
            <button type="button" className={MUTED_BTN} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={ACCENT_BTN}>
              Save Machine
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
