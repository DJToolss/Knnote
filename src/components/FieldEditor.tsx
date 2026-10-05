"use client";

import { FIELD_TYPE_LABELS, FIELD_TYPES, ProjectField, blankField } from "@/lib/fields";

export default function FieldEditor({
  fields,
  statusOptions,
  onChangeFields,
  onChangeStatusOptions,
}: {
  fields: ProjectField[];
  statusOptions: string[];
  onChangeFields: (fields: ProjectField[]) => void;
  onChangeStatusOptions: (options: string[]) => void;
}) {
  const updateField = (id: string, patch: Partial<ProjectField>) => {
    onChangeFields(fields.map((field) => (field.id === id ? { ...field, ...patch } : field)));
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="field-label">Fields</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onChangeFields([...fields, blankField()])}
          >
            Add field
          </button>
        </div>
        <p className="help mb-3">
          Choose the fields this project needs. Only these fields are shown on items.
        </p>
        <div className="space-y-3">
          {fields.length === 0 && (
            <p className="help">No extra fields. Items will only show status.</p>
          )}
          {fields.map((field) => (
            <div key={field.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_120px_auto_auto] sm:items-center">
              <input
                type="text"
                value={field.label}
                onChange={(event) => updateField(field.id, { label: event.target.value })}
                className="field"
                placeholder="Field name"
                aria-label="Field name"
              />
              <select
                value={field.type}
                onChange={(event) => updateField(field.id, { type: event.target.value as ProjectField["type"] })}
                className="field"
                aria-label="Field type"
              >
                {FIELD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {FIELD_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
              <label className="help flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(event) => updateField(field.id, { required: event.target.checked })}
                />
                Required
              </label>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onChangeFields(fields.filter((entry) => entry.id !== field.id))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="field-label">Status values</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onChangeStatusOptions([...statusOptions, ""])}
          >
            Add status
          </button>
        </div>
        <p className="help mb-3">Status is always shown. These are the values people can pick.</p>
        <div className="space-y-2">
          {statusOptions.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={option}
                onChange={(event) => {
                  const next = [...statusOptions];
                  next[index] = event.target.value;
                  onChangeStatusOptions(next);
                }}
                className="field"
                placeholder="Status name"
                aria-label={`Status ${index + 1}`}
              />
              <button
                type="button"
                className="btn-secondary"
                disabled={statusOptions.length === 1}
                onClick={() => onChangeStatusOptions(statusOptions.filter((_, optionIndex) => optionIndex !== index))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
