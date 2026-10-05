import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Item {
  _id: string;
  name?: string;
  notes?: string;
  points?: number;
  links?: string[];
  images?: string[];
  createdAt: string;
  targetDate?: string;
  status?: 'ETS' | 'IN_PROGRESS' | 'COMPLETED';
}

interface Todo {
  _id: string;
  title: string;
  items: Item[];
  user: string;
  createdAt: string;
  targetDate?: string;
}

interface TodoDetailProps {
  todo: Todo;
  onUpdateTodo: (todo: Todo) => void;
}

export default function TodoDetail({ todo, onUpdateTodo }: TodoDetailProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddItem = () => {
    setCurrentItem(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setCurrentItem(item);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedTodo = {
      ...todo,
      items: todo.items.filter((item) => item._id !== itemId),
    };
    onUpdateTodo(updatedTodo);
  };

  const handleSubmitItem = (formData: Item) => {
    console.log('handleSubmitItem called with:', JSON.stringify(formData, null, 2));

    let updatedItems;
    if (isEditing && currentItem) {
      updatedItems = todo.items.map((item) =>
        item._id === currentItem._id ? { ...item, ...formData } : item
      );
    } else {
      // Let MongoDB generate the ID
      const newItem = {
        ...formData,
      };
      updatedItems = [...todo.items, newItem];
    }

    console.log('Updated items array:', JSON.stringify(updatedItems, null, 2));

    onUpdateTodo({
      ...todo,
      items: updatedItems,
    });
    setIsModalOpen(false);
  };

  const handleStatusChange = (itemId: string, newStatus: string) => {
    console.log('Status changing for item', itemId, 'to', newStatus);

    // Validate the status value
    if (!['ETS', 'IN_PROGRESS', 'COMPLETED'].includes(newStatus)) {
      console.error('Invalid status value:', newStatus);
      return;
    }

    const updatedItems = todo.items.map((todoItem) => {
      if (todoItem._id === itemId) {
        console.log('Updating item:', todoItem._id, 'from status:', todoItem.status, 'to:', newStatus);
        return {
          ...todoItem,
          status: newStatus as 'ETS' | 'IN_PROGRESS' | 'COMPLETED'
        } as Item;
      }
      return todoItem;
    });

    console.log('Updated items array:', updatedItems);
    console.log('Calling onUpdateTodo with updated todo');
    onUpdateTodo({
      ...todo,
      items: updatedItems as Item[],
    });
  };

  // Filter items based on search query
  const filteredItems = todo.items.filter(item =>
  (item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.notes?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="content-pad max-w-7xl mx-auto">
      <div
        className="panel mb-4 flex items-center justify-between gap-4 p-4"
        data-aos="fade-down"
      >
        <div className="flex-1 min-w-0">
          <h1 className="page-title mb-2">{todo.title}</h1>
          <div className="help flex flex-wrap items-center gap-3">
            <span className="mono">Created: {new Date(todo.createdAt).toLocaleDateString()}</span>
            {todo.targetDate && (
              <span className={`status-pill ${new Date(todo.targetDate) < new Date() ? 'status-negative' : 'status-positive'}`}>
                Target: {new Date(todo.targetDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleAddItem}
          className="btn-primary shrink-0"
          data-aos="zoom-in"
          data-aos-delay="200"
        >
          Add Item
        </button>
      </div>

      {/* Search Input */}
      <div className="panel mb-4 p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search items by name or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="field-clear"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-[17px] w-[17px]" />
            </button>
          )}
        </div>
      </div>

      <div
        className="panel overflow-x-auto"
        data-aos="fade-up"
        data-aos-delay="300"
      >
        <table className="data-table min-w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Notes</th>
              <th>Points</th>
              <th>Created</th>
              <th>Target Date</th>
              <th>Status</th>
              <th>Links</th>
              <th>Images</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, index) => {
              console.log('Rendering item:', item._id, 'with status:', item.status);
              return (
                <tr key={item._id}>
                <td className="whitespace-nowrap font-medium">{item.name || '-'}</td>
                <td>{item.notes || '-'}</td>
                <td className="whitespace-nowrap">
                  {item.points ?
                    <span className="chip mono">
                      {item.points}
                    </span> : '-'}
                </td>
                <td className="mono whitespace-nowrap">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap">
                  {(() => {
                    console.log('Rendering target date for item:', item.name, 'targetDate:', item.targetDate);
                    return item.targetDate ? (
                      <span className={`status-pill mono ${new Date(item.targetDate) < new Date()
                          ? 'status-negative'
                          : 'status-positive'
                        }`}>
                        {new Date(item.targetDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="help">-</span>
                    );
                  })()}
                </td>
                <td className="whitespace-nowrap">
                  <span className={`status-pill ${item.status === 'COMPLETED'
                        ? 'status-positive'
                        : item.status === 'IN_PROGRESS'
                          ? 'status-warn'
                          : 'status-accent'
                      }`}>
                  <select
                    key={`${item._id}-${item.status}`}
                    value={item.status || 'ETS'}
                    onChange={(e) => {
                      const newStatus = e.target.value as 'ETS' | 'IN_PROGRESS' | 'COMPLETED';
                      console.log('Dropdown onChange triggered for item:', item._id, 'new status:', newStatus, 'current status:', item.status);
                      handleStatusChange(item._id, newStatus);
                    }}
                    className="status-select"
                  >
                    <option value="ETS">ETS</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                  </span>

                </td>
                <td>
                  {item.links?.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      className="link block break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link}
                    </a>
                  )) || '-'}
                </td>
                <td>
                  {item.images?.map((image, i) => (
                    <img
                      key={i}
                      src={image}
                      alt={`Item ${i + 1}`}
                      className="mr-2 inline-block h-10 w-10 rounded-md object-cover"
                    />
                  )) || '-'}
                </td>
                <td className="whitespace-nowrap text-right">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="icon-btn mr-2"
                    aria-label="Edit item"
                  >
                    <PencilIcon className="h-[17px] w-[17px]" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="icon-btn icon-btn-danger"
                    aria-label="Delete item"
                  >
                    <TrashIcon className="h-[17px] w-[17px]" />
                  </button>
                </td>
              </tr>
            );
            })}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={9} className="py-10 text-center">
                  <div
                    className="flex flex-col items-center justify-center"
                    data-aos="fade-up"
                  >
                    <img
                      src="/file.svg"
                      alt="No items"
                      className="mb-4 h-16 w-16 opacity-60"
                    />
                    <p className="help">{searchQuery ? 'No items found matching your search.' : 'No items in this todo yet. Add one to get started.'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="modal-overlay" aria-hidden="true" />

          <div
            className="modal-panel relative w-full max-w-md mx-4 p-6"
            data-aos="zoom-in"
          >
            <h3 className="panel-title mb-4 text-center">
              {isEditing ? 'Edit Item' : 'Add Item'}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const targetDateValue = formData.get('targetDate') as string;
                const statusValue = formData.get('status') as string;
                console.log('Form submitted - targetDateValue:', targetDateValue);
                console.log('Form submitted - statusValue:', statusValue);
                console.log('All form data:');
                for (let [key, value] of formData.entries()) {
                  console.log(`${key}: ${value}`);
                }
                const data: Item = {
                  _id: currentItem?._id || `temp_${Math.random().toString(36).substr(2, 9)}`,
                  name: formData.get('name') as string,
                  notes: formData.get('notes') as string,
                  points: formData.get('points')
                    ? Number(formData.get('points'))
                    : undefined,
                  links: formData.get('links')
                    ? (formData.get('links') as string).split('\n')
                    : [],
                  images: formData.get('images')
                    ? (formData.get('images') as string).split('\n')
                    : [],
                  createdAt: currentItem?.createdAt || new Date().toISOString(),
                  targetDate: targetDateValue && targetDateValue.trim() !== ''
                    ? new Date(targetDateValue).toISOString()
                    : undefined,
                  status: statusValue as 'ETS' | 'IN_PROGRESS' | 'COMPLETED',
                };


                console.log('Submitting item data:', JSON.stringify(data, null, 2));
                handleSubmitItem(data);
              }}
              className="space-y-4"
            >
              <div>
                <label className="field-label">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={currentItem?.name || ''}
                  className="field mt-1"
                />
              </div>
              <div>
                <label className="field-label">
                  Notes
                </label>
                <textarea
                  name="notes"
                  defaultValue={currentItem?.notes || ''}
                  className="field mt-1"
                />
              </div>
              <div>
                <label className="field-label">
                  Points
                </label>
                <input
                  type="number"
                  name="points"
                  defaultValue={currentItem?.points || ''}
                  className="field mt-1"
                />
              </div>
              <div>
                <label className="field-label">
                  Links (one per line)
                </label>
                <textarea
                  name="links"
                  defaultValue={currentItem?.links?.join('\n') || ''}
                  className="field mt-1"
                />
              </div>
              <div>
                <label className="field-label">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  name="targetDate"
                  defaultValue={currentItem?.targetDate ? new Date(currentItem.targetDate).toISOString().split('T')[0] : ''}
                  className="field mt-1"
                />
              </div>
              <div>
                <label className="field-label">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={currentItem?.status || 'ETS'}
                  className="field mt-1"
                >
                  <option value="ETS">ETS</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>

              </div>
              <div>
                <label className="field-label">
                  Image URLs (one per line)
                </label>
                <textarea
                  name="images"
                  defaultValue={currentItem?.images?.join('\n') || ''}
                  className="field mt-1"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {isEditing ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
