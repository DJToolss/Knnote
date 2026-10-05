export const FIELD_TYPES = ["text", "password", "link", "number", "date"] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export interface ProjectField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
}

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Text",
  password: "Password",
  link: "Link",
  number: "Number",
  date: "Date",
};

export const DEFAULT_FIELDS: ProjectField[] = [
  { id: "name", label: "Name", type: "text", required: false },
  { id: "notes", label: "Notes", type: "text", required: false },
  { id: "points", label: "Points", type: "number", required: false },
  { id: "links", label: "Links", type: "link", required: false },
  { id: "images", label: "Images", type: "link", required: false },
  { id: "targetDate", label: "Target date", type: "date", required: false },
];

export const DEFAULT_STATUS_OPTIONS = ["ETS", "IN_PROGRESS", "COMPLETED"];

export function newFieldId() {
  return `field_${Math.random().toString(36).slice(2, 10)}`;
}

export function resolveFields(fields?: ProjectField[] | null): ProjectField[] {
  if (!Array.isArray(fields)) return DEFAULT_FIELDS;
  return fields.filter((field) => field.label.trim() && FIELD_TYPES.includes(field.type));
}

export function resolveStatusOptions(options?: string[] | null): string[] {
  const cleaned = (options || []).map((option) => option.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : DEFAULT_STATUS_OPTIONS;
}

export function blankField(): ProjectField {
  return { id: newFieldId(), label: "", type: "text", required: false };
}
