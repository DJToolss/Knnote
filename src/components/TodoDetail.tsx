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
    <div className="p-6 max-w-7xl mx-auto">
      <div
        className="flex justify-between items-center mb-6 bg-slate-900 rounded-lg shadow-md p-4 border border-gray-300"
        data-aos="fade-down"
      >
        <div className="flex-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent mb-2">{todo.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <span>Created: {new Date(todo.createdAt).toLocaleDateString()}</span>
            {todo.targetDate && (
              <span className={`${new Date(todo.targetDate) < new Date() ? 'text-red-400' : 'text-green-400'}`}>
                Target: {new Date(todo.targetDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleAddItem}
          className="px-4 py-2 bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-bold text-xl rounded-md hover:from-blue-800 hover:to-indigo-900 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          data-aos="zoom-in"
          data-aos-delay="200"
        >
          Add Item
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-4 p-4 bg-slate-900 rounded-lg border border-gray-300">
        <div className="relative">
          <input
            type="text"
            placeholder="Search items by name or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-black border border-gray-300 rounded-md text-slate-200 placeholder-slate-400 focus:border-yellow-400 focus:ring-yellow-400 transition-all duration-300"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors duration-300"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div
        className="overflow-x-auto rounded-xl shadow-lg border border-gray-300 bg-slate-900"
        data-aos="fade-up"
        data-aos-delay="300"
      >
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-gradient-to-r from-slate-900 to-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold  text-yellow-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold  text-yellow-300 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold  text-yellow-300 uppercase tracking-wider">
                Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold  text-yellow-300 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold  text-yellow-300 uppercase tracking-wider">
                Target Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold  text-yellow-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold  text-yellow-300 uppercase tracking-wider">
                Links
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold  text-yellow-300 uppercase tracking-wider">
                Images
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold  text-yellow-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-black divide-y divide-slate-700">
            {filteredItems.map((item, index) => {
              console.log('Rendering item:', item._id, 'with status:', item.status);
              return (
                <tr
                  key={item._id}
                  className="hover:bg-slate-900 transition-all duration-300"
            
                >
                <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-300">{item.name || '-'}</td>
                <td className="px-6 py-4 text-slate-300">{item.notes || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.points ?
                    <span className="px-2 py-1 bg-blue-900/50 text-yellow-400 rounded-full text-xs font-medium">
                      {item.points}
                    </span> : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(() => {
                    console.log('Rendering target date for item:', item.name, 'targetDate:', item.targetDate);
                    return item.targetDate ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${new Date(item.targetDate) < new Date()
                          ? 'bg-red-900/50 text-red-400'
                          : 'bg-green-900/50 text-green-400'
                        }`}>
                        {new Date(item.targetDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                
                    key={`${item._id}-${item.status}`}
                    value={item.status || 'ETS'}
                    onChange={(e) => {
                      const newStatus = e.target.value as 'ETS' | 'IN_PROGRESS' | 'COMPLETED';
                      console.log('Dropdown onChange triggered for item:', item._id, 'new status:', newStatus, 'current status:', item.status);
                      handleStatusChange(item._id, newStatus);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-yellow-400 transition-all duration-300 ${item.status === 'COMPLETED'
                        ? 'bg-green-900/50 text-green-400 hover:bg-green-800'
                        : item.status === 'IN_PROGRESS'
                          ? 'bg-yellow-900/50 text-yellow-400 hover:bg-yellow-800'
                          : 'bg-blue-900 text-blue-400 hover:bg-blue-800'
                      }`}
                  >
                    <option value="ETS">ETS</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>

                </td>
                <td className="px-6 py-4">
                  {item.links?.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      className="text-blue-400 hover:text-yellow-300 block transition-colors duration-300 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link}
                    </a>
                  )) || '-'}
                </td>
                <td className="px-6 py-4">
                  {item.images?.map((image, i) => (
                    <img
                      key={i}
                      src={image}
                      alt={`Item ${i + 1}`}
                      className="h-10 w-10 object-cover rounded-md inline-block mr-2 hover:scale-150 transition-transform duration-300 cursor-pointer shadow-sm hover:shadow-md"
                    />
                  )) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="text-white  mr-4 p-1.5 rounded-full hover:bg-slate-600 transition-all duration-300"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="text-red-400 hover:text-red-300 p-1.5 rounded-full hover:bg-slate-900 transition-all duration-300"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            );
            })}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-10 text-center text-slate-400">
                  <div
                    className="flex flex-col items-center justify-center"
                    data-aos="fade-up"
                  >
                    <img
                      src="/file.svg"
                      alt="No items"
                      className="h-16 w-16 mb-4 opacity-60 invert"
                    />
                    <p>{searchQuery ? 'No items found matching your search.' : 'No items in this todo yet. Add one to get started.'}</p>
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
          <div className="fixed inset-0 bg-black backdrop-blur-sm" aria-hidden="true" />

          <div
            className="relative bg-black00 rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl border border-gray-300"
            data-aos="zoom-in"
          >
            <h3 className="text-lg font-medium mb-4 text-center bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
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
                <label className="block text-sm font-medium text-yellow-400">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={currentItem?.name || ''}
                  className="mt-1 p-2 block w-full rounded-md border-gray-300 bg-slate-700 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 text-slate-200 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-400">
                  Notes
                </label>
                <textarea
                  name="notes"
                  defaultValue={currentItem?.notes || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-slate-700 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 text-slate-200 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-400">
                  Points
                </label>
                <input
                  type="number"
                  name="points"
                  defaultValue={currentItem?.points || ''}
                  className="mt-1 block p-2 w-full rounded-md border-gray-300 bg-slate-700 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 text-slate-200 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-400">
                  Links (one per line)
                </label>
                <textarea
                  name="links"
                  defaultValue={currentItem?.links?.join('\n') || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-slate-700 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 text-slate-200 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-400">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  name="targetDate"
                  defaultValue={currentItem?.targetDate ? new Date(currentItem.targetDate).toISOString().split('T')[0] : ''}
                  className="mt-1 p-2 block w-full rounded-md border-gray-300 bg-slate-700 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 text-slate-200 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-400">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={currentItem?.status || 'ETS'}
                  className="mt-1 p-2 block w-full rounded-md border-gray-300 bg-slate-700 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 text-slate-200 transition-all duration-300"
                >
                  <option value="ETS">ETS</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>

              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-400">
                  Image URLs (one per line)
                </label>
                <textarea
                  name="images"
                  defaultValue={currentItem?.images?.join('\n') || ''}
                  className="mt-1 p-2 block w-full rounded-md border-gray-300 bg-slate-700 shadow-sm focus:border-yellow-400 focus:ring-yellow-400 text-slate-200 transition-all duration-300"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors duration-300 border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-yellow-400 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-md hover:from-blue-800 hover:to-indigo-900 transition-all duration-300 shadow-md"
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
