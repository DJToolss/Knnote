import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import FieldEditor from '@/components/FieldEditor';
import { ProjectField, resolveFields, resolveStatusOptions } from '@/lib/fields';

interface Item {
  _id: string;
  name?: string;
  notes?: string;
  points?: number;
  links?: string[];
  images?: string[];
  createdAt: string;
  targetDate?: string;
  status?: string;
  values?: Record<string, string>;
}

interface Todo {
  _id: string;
  title: string;
  items: Item[];
  user: string;
  createdAt: string;
  targetDate?: string;
  fields?: ProjectField[];
  statusOptions?: string[];
}

interface TodoDetailProps {
  todo: Todo;
  onUpdateTodo: (todo: Todo) => void;
}

function readFieldValue(item: Item, field: ProjectField): string {
  const stored = item.values?.[field.id];
  if (stored != null && stored !== '') return toInputValue(stored, field);
  if (field.id === 'name') return item.name || '';
  if (field.id === 'notes') return item.notes || '';
  if (field.id === 'points' && item.points != null) return String(item.points);
  if (field.id === 'links') return item.links?.join('\n') || '';
  if (field.id === 'images') return item.images?.join('\n') || '';
  if (field.id === 'targetDate' && item.targetDate) return toInputValue(item.targetDate, field);
  return stored ? toInputValue(stored, field) : '';
}

function toInputValue(value: string, field: ProjectField): string {
  if (field.type !== 'date' || !value.includes('T')) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString().split('T')[0];
}

function isImageUrl(url: string) {
  return /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url);
}

function toExternalHref(raw: string) {
  const value = raw.trim();
  if (/^(javascript|data):/i.test(value)) return '#';
  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) return value;
  return `https://${value.replace(/^\/\//, '')}`;
}

function Expandable({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;
    const measure = () => {
      setOverflows(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [expanded, children]);

  return (
    <div>
      <div ref={ref} className={expanded ? 'clamp-open' : 'clamp-5'}>
        {children}
      </div>
      {(overflows || expanded) && (
        <button type="button" className="read-more" onClick={() => setExpanded((open) => !open)}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

function LinkifiedText({ text }: { text: string }) {
  const pattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    const found = match[0];
    const trimmed = found.replace(/[),.;]+$/, '');
    if (index > last) nodes.push(text.slice(last, index));
    nodes.push(
      <a
        key={`${index}-${trimmed}`}
        href={toExternalHref(trimmed)}
        className="link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {trimmed}
      </a>
    );
    if (trimmed.length < found.length) nodes.push(found.slice(trimmed.length));
    last = index + found.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}

function statusTone(value: string, options: string[]) {
  const index = options.indexOf(value);
  if (options.length > 1 && index === options.length - 1) return 'status-positive';
  if (index > 0) return 'status-warn';
  return 'status-accent';
}

function itemLabel(item: Item, fields: ProjectField[]) {
  const named = fields.map((field) => readFieldValue(item, field)).find((value) => value.trim());
  return named || 'this item';
}

export default function TodoDetail({ todo, onUpdateTodo }: TodoDetailProps) {
  const fields = resolveFields(todo.fields);
  const statusOptions = resolveStatusOptions(todo.statusOptions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFieldsOpen, setIsFieldsOpen] = useState(false);
  const [draftFields, setDraftFields] = useState<ProjectField[]>([]);
  const [draftStatuses, setDraftStatuses] = useState<string[]>([]);
  const [fieldsError, setFieldsError] = useState('');
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemPendingDelete, setItemPendingDelete] = useState<Item | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const handleAddItem = () => {
    setCurrentItem(null);
    setIsEditing(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setCurrentItem(item);
    setIsEditing(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const confirmDeleteItem = () => {
    if (!itemPendingDelete) return;
    onUpdateTodo({
      ...todo,
      items: todo.items.filter((item) => item._id !== itemPendingDelete._id),
    });
    setItemPendingDelete(null);
  };

  const openFields = () => {
    setDraftFields(fields.map((field) => ({ ...field })));
    setDraftStatuses([...statusOptions]);
    setFieldsError('');
    setIsFieldsOpen(true);
  };

  const saveFields = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanedStatuses = draftStatuses.map((option) => option.trim()).filter(Boolean);
    if (cleanedStatuses.length === 0) {
      setFieldsError('Add at least one status value');
      return;
    }
    onUpdateTodo({
      ...todo,
      fields: draftFields.filter((field) => field.label.trim()),
      statusOptions: cleanedStatuses,
    });
    setIsFieldsOpen(false);
  };

  const handleStatusChange = (itemId: string, newStatus: string) => {
    onUpdateTodo({
      ...todo,
      items: todo.items.map((todoItem) =>
        todoItem._id === itemId ? { ...todoItem, status: newStatus } : todoItem
      ),
    });
  };

  const filteredItems = todo.items.filter((item) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    const haystack = [
      ...fields.map((field) => readFieldValue(item, field)),
      item.status || '',
    ].join(' ').toLowerCase();
    return haystack.includes(query);
  });

  return (
    <div className="content-pad max-w-7xl mx-auto">
      <div className="panel mb-4 flex items-center justify-between gap-4 p-4">
        <div className="min-w-0 flex-1">
          <h1 className="page-title mb-2">{todo.title}</h1>
          <div className="help flex flex-wrap items-center gap-3">
            <span className="mono">Created: {new Date(todo.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={openFields} className="btn-secondary">
            Fields
          </button>
          <button type="button" onClick={handleAddItem} className="btn-primary">
            Add Item
          </button>
        </div>
      </div>

      <div className="panel mb-4 p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="field pr-8"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="field-clear"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-[17px] w-[17px]" />
            </button>
          )}
        </div>
      </div>

      <div className="panel overflow-x-auto">
        <table className="data-table min-w-full">
          <thead>
            <tr>
              {fields.map((field) => (
                <th key={field.id}>{field.label}</th>
              ))}
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item._id}>
                {fields.map((field) => (
                  <td key={field.id}>
                    <FieldValue field={field} value={readFieldValue(item, field)} />
                  </td>
                ))}
                <td className="whitespace-nowrap">
                  <span className={`status-pill ${statusTone(item.status || statusOptions[0], statusOptions)}`}>
                    <select
                      value={item.status || statusOptions[0]}
                      onChange={(event) => handleStatusChange(item._id, event.target.value)}
                      className="status-select"
                    >
                      {statusChoices(item.status, statusOptions).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </span>
                </td>
                <td className="whitespace-nowrap text-right">
                  <button
                    type="button"
                    onClick={() => handleEditItem(item)}
                    className="icon-btn mr-2"
                    aria-label="Edit item"
                  >
                    <PencilIcon className="h-[17px] w-[17px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemPendingDelete(item)}
                    className="icon-btn icon-btn-danger"
                    aria-label="Delete item"
                  >
                    <TrashIcon className="h-[17px] w-[17px]" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={fields.length + 2} className="py-10 text-center">
                  <p className="help">
                    {searchQuery ? 'No items found matching your search.' : 'No items in this project yet. Add one to get started.'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="modal-overlay" aria-hidden="true" />
          <div className="modal-panel relative mx-4 w-full max-w-md p-6">
            <h3 className="panel-title mb-4 text-center">{isEditing ? 'Edit Item' : 'Add Item'}</h3>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const values: Record<string, string> = { ...(currentItem?.values || {}) };
                for (const field of fields) {
                  const raw = String(formData.get(field.id) || '');
                  if (field.required && !raw.trim()) {
                    setFormError(`${field.label} is required`);
                    return;
                  }
                  values[field.id] = raw;
                }
                const statusValue = String(formData.get('status') || statusOptions[0]);
                const nextItem: Item = {
                  _id: currentItem?._id || `temp_${Math.random().toString(36).slice(2, 10)}`,
                  createdAt: currentItem?.createdAt || new Date().toISOString(),
                  status: statusValue,
                  values,
                  name: values.name ?? currentItem?.name,
                  notes: values.notes ?? currentItem?.notes,
                  points: values.points != null && values.points !== '' ? Number(values.points) : currentItem?.points,
                  links: values.links != null ? values.links.split('\n').map((link) => link.trim()).filter(Boolean) : currentItem?.links,
                  images: values.images != null ? values.images.split('\n').map((image) => image.trim()).filter(Boolean) : currentItem?.images,
                  targetDate: values.targetDate ? new Date(values.targetDate).toISOString() : currentItem?.targetDate,
                };
                const updatedItems = isEditing && currentItem
                  ? todo.items.map((item) => (item._id === currentItem._id ? { ...item, ...nextItem } : item))
                  : [...todo.items, nextItem];
                onUpdateTodo({ ...todo, items: updatedItems });
                setIsModalOpen(false);
              }}
              className="space-y-4"
            >
              {fields.map((field) => (
                <div key={field.id}>
                  <label className="field-label" htmlFor={`item-${field.id}`}>
                    {field.label}{field.required ? ' *' : ''}
                  </label>
                  <FieldInput
                    field={field}
                    defaultValue={currentItem ? readFieldValue(currentItem, field) : ''}
                    revealed={Boolean(visiblePasswords[field.id])}
                    onToggleReveal={() =>
                      setVisiblePasswords((current) => ({ ...current, [field.id]: !current[field.id] }))
                    }
                  />
                </div>
              ))}
              <div>
                <label className="field-label" htmlFor="item-status">Status</label>
                <select
                  id="item-status"
                  name="status"
                  defaultValue={currentItem?.status || statusOptions[0]}
                  className="field mt-1"
                >
                  {statusChoices(currentItem?.status, statusOptions).map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              {formError && <p className="alert-error">{formError}</p>}
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {isEditing ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>

      <Dialog open={itemPendingDelete !== null} onClose={() => setItemPendingDelete(null)} className="fixed inset-0 z-20 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="modal-overlay" aria-hidden="true" />
          <div className="modal-panel relative mx-4 w-full max-w-md p-6">
            <h3 className="panel-title">Delete item</h3>
            <p className="help mt-3">
              Delete {itemPendingDelete ? itemLabel(itemPendingDelete, fields) : 'this item'}? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button type="button" className="btn-secondary" onClick={() => setItemPendingDelete(null)}>
                Cancel
              </button>
              <button type="button" className="btn-danger" onClick={confirmDeleteItem}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog open={isFieldsOpen} onClose={() => setIsFieldsOpen(false)} className="fixed inset-0 z-20 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="modal-overlay" aria-hidden="true" />
          <div className="modal-panel relative mx-4 w-full max-w-2xl p-6">
            <h3 className="panel-title mb-4">Project fields</h3>
            <form onSubmit={saveFields}>
              <FieldEditor
                fields={draftFields}
                statusOptions={draftStatuses}
                onChangeFields={setDraftFields}
                onChangeStatusOptions={setDraftStatuses}
              />
              {fieldsError && <p className="alert-error mt-4">{fieldsError}</p>}
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" className="btn-secondary" onClick={() => setIsFieldsOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save fields
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function statusChoices(current: string | undefined, options: string[]) {
  if (current && !options.includes(current)) return [current, ...options];
  return options;
}

function FieldValue({ field, value }: { field: ProjectField; value: string }) {
  if (!value.trim()) return <span className="help">-</span>;
  if (field.type === 'password') {
    return <span className="mono">{"•".repeat(Math.min(value.length, 10))}</span>;
  }
  if (field.type === 'number') return <span className="chip mono">{value}</span>;
  if (field.type === 'date') {
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    const parsed = dateOnly
      ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
      : new Date(value);
    const label = Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = !Number.isNaN(parsed.getTime()) && parsed < today;
    return <span className={`status-pill mono ${overdue ? 'status-negative' : 'status-positive'}`}>{label}</span>;
  }
  if (field.type === 'link') {
    const links = value.split('\n').map((link) => link.trim()).filter(Boolean);
    return (
      <Expandable>
        <div className="space-y-1">
          {links.map((link) => (
            <a
              key={link}
              href={toExternalHref(link)}
              className="link block break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {isImageUrl(link) ? (
                <img src={link} alt="" className="mr-2 inline-block h-10 w-10 rounded-md object-cover" />
              ) : (
                link
              )}
            </a>
          ))}
        </div>
      </Expandable>
    );
  }
  return (
    <Expandable>
      <span className="whitespace-pre-wrap">
        <LinkifiedText text={value} />
      </span>
    </Expandable>
  );
}

function FieldInput({
  field,
  defaultValue,
  revealed,
  onToggleReveal,
}: {
  field: ProjectField;
  defaultValue: string;
  revealed: boolean;
  onToggleReveal: () => void;
}) {
  if (field.type === 'password') {
    return (
      <div className="mt-1 flex gap-2">
        <input
          id={`item-${field.id}`}
          name={field.id}
          type={revealed ? 'text' : 'password'}
          defaultValue={defaultValue}
          required={field.required}
          className="field"
          autoComplete="new-password"
        />
        <button type="button" className="btn-secondary" onClick={onToggleReveal}>
          {revealed ? 'Hide' : 'Show'}
        </button>
      </div>
    );
  }
  if (field.type === 'number') {
    return (
      <input
        id={`item-${field.id}`}
        name={field.id}
        type="number"
        defaultValue={defaultValue}
        required={field.required}
        className="field mt-1"
      />
    );
  }
  if (field.type === 'date') {
    return (
      <input
        id={`item-${field.id}`}
        name={field.id}
        type="date"
        defaultValue={defaultValue}
        required={field.required}
        className="field mt-1"
      />
    );
  }
  if (field.type === 'link' || field.type === 'text') {
    return (
      <textarea
        id={`item-${field.id}`}
        name={field.id}
        defaultValue={defaultValue}
        required={field.required}
        className="field mt-1"
        rows={field.type === 'link' ? 3 : 2}
        placeholder={field.type === 'link' ? 'One link per line' : undefined}
      />
    );
  }
  return null;
}
