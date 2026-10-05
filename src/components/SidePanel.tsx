import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ExclamationTriangleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';

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

interface SidePanelProps {
  todos: Todo[];
  onTodoClick: (todo: Todo) => void;
  onCreateTodo: (title: string, targetDate?: string) => void;
  onDeleteTodo: (id: string) => void;
  onUpdateTodo: (todo: Todo) => void;
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isLoading?: boolean;
  activeTodoId?: string;
}

export default function SidePanel({
  todos,
  onTodoClick,
  onCreateTodo,
  onDeleteTodo,
  onUpdateTodo,
  isMobile,
  isOpen,
  setIsOpen,
  isLoading = false,
  activeTodoId,
}: SidePanelProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoTargetDate, setNewTodoTargetDate] = useState('');
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoTitle.trim()) {
      onCreateTodo(newTodoTitle, newTodoTargetDate);
      setNewTodoTitle('');
      setNewTodoTargetDate('');
      setIsCreateModalOpen(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setTodoToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (todoToDelete) {
      onDeleteTodo(todoToDelete);
      setTodoToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditTargetDate(todo.targetDate ? new Date(todo.targetDate).toISOString().split('T')[0] : '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTodo && editTitle.trim()) {
      const updatedTodo = {
        ...editingTodo,
        title: editTitle.trim(),
        targetDate: editTargetDate ? new Date(editTargetDate).toISOString() : undefined
      };
      onUpdateTodo(updatedTodo);
      setIsEditModalOpen(false);
      setEditingTodo(null);
      setEditTitle('');
      setEditTargetDate('');
    }
  };

  // Filter todos based on search query
  const filteredTodos = todos.filter(todo =>
    todo.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const panel = (
    <div className="sidebar">
      <div className="sidebar-head">
        <h2 className="sidebar-label">Todos</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-on-nav"
          data-aos="zoom-in"
          data-aos-delay="300"
        >
          Create Project
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Search Input */}
        <div className="sidebar-section">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Project..."
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
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-pulse nav-muted">Loading todos...</div>
          </div>
        ) : (
          <ul className="py-2">
            {filteredTodos.map((todo, index) => (
              <li 
                key={todo._id} 
                className={`nav-row ${activeTodoId === todo._id ? 'nav-row-active' : ''}`}
                data-aos="fade-up"
                data-aos-delay={100 + index * 50}
              >
                <div className="flex items-center justify-between gap-2 px-2 py-2">
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => onTodoClick(todo)}
                      className="nav-row-title truncate"
                    >
                      {todo.title}
                    </button>
                    <div className="nav-muted mt-1 flex flex-wrap items-center gap-2">
                      <span className="mono">Created: {new Date(todo.createdAt).toLocaleDateString()}</span>
                      {todo.targetDate && (
                        <span className={`status-pill ${new Date(todo.targetDate) < new Date() ? 'status-negative' : 'status-positive'}`}>
                          Target: {new Date(todo.targetDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleEditClick(todo)}
                      className="nav-icon"
                      aria-label="Edit todo"
                    >
                      <PencilIcon className="h-[17px] w-[17px]" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(todo._id)}
                      className="nav-icon nav-icon-danger"
                      aria-label="Delete todo"
                    >
                      <TrashIcon className="h-[17px] w-[17px]" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {filteredTodos.length === 0 && !isLoading && (
              <li 
                className="nav-muted p-8 text-center"
                data-aos="fade-up"
              >
                {searchQuery ? 'No todos found matching your search.' : 'No todos yet. Create one to get started.'}
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Transition.Root show={isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setIsOpen}>
            <div className="modal-overlay transition-opacity" />
            <div className="fixed inset-0 overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
                  <Transition.Child
                    as={Fragment}
                    enter="transform transition ease-in-out duration-500"
                    enterFrom="-translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform transition ease-in-out duration-500"
                    leaveFrom="translate-x-0"
                    leaveTo="-translate-x-full"
                  >
                    <Dialog.Panel className="pointer-events-auto w-80">
                      <div className="sidebar h-full">
                        <div className="sidebar-head">
                          <Dialog.Title className="sidebar-label">
                            Todos
                          </Dialog.Title>
                          <button 
                            onClick={() => setIsOpen(false)}
                            className="nav-icon"
                            aria-label="Close sidebar"
                          >
                            <XMarkIcon className="h-[17px] w-[17px]" />
                          </button>
                        </div>
                        {panel}
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Create Todo Modal */}
        <CreateTodoModal 
          isOpen={isCreateModalOpen}
          setIsOpen={setIsCreateModalOpen}
          title={newTodoTitle}
          setTitle={setNewTodoTitle}
          targetDate={newTodoTargetDate}
          setTargetDate={setNewTodoTargetDate}
          onSubmit={handleCreateSubmit}
        />

        {/* Edit Todo Modal */}
        <EditTodoModal
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          title={editTitle}
          setTitle={setEditTitle}
          targetDate={editTargetDate}
          setTargetDate={setEditTargetDate}
          onSubmit={handleEditSubmit}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
          onConfirm={handleConfirmDelete}
        />
      </>
    );
  }

  return (
    <>
      <div className="sidebar-frame">{panel}</div>
      
      {/* Create Todo Modal */}
      <CreateTodoModal 
        isOpen={isCreateModalOpen}
        setIsOpen={setIsCreateModalOpen}
        title={newTodoTitle}
        setTitle={setNewTodoTitle}
        targetDate={newTodoTargetDate}
        setTargetDate={setNewTodoTargetDate}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit Todo Modal */}
      <EditTodoModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        title={editTitle}
        setTitle={setEditTitle}
        targetDate={editTargetDate}
        setTargetDate={setEditTargetDate}
        onSubmit={handleEditSubmit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

// Create Todo Modal Component
function CreateTodoModal({
  isOpen,
  setIsOpen,
  title,
  setTitle,
  targetDate,
  setTargetDate,
  onSubmit
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
  setTitle: (title: string) => void;
  targetDate: string;
  setTargetDate: (date: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="modal-overlay" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="modal-panel w-full max-w-md transform overflow-hidden p-6 text-left align-middle transition-all">
                <Dialog.Title
                  as="h3"
                  className="panel-title"
                >
                  Create New Todo
                </Dialog.Title>
                <form onSubmit={onSubmit}>
                  <div className="mt-4">
                    <label htmlFor="todoTitle" className="field-label">
                      Todo Title
                    </label>
                    <input
                      type="text"
                      id="todoTitle"
                      className="field mt-1"
                      placeholder="Enter todo title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      autoFocus
                    />
                  </div>
                  {/* <div className="mt-4">
                    <label htmlFor="todoTargetDate" className="field-label">
                      Target Date (Optional)
                    </label>
                    <input
                      type="date"
                      id="todoTargetDate"
                      className="field mt-1"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                    />
                  </div> */}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Edit Todo Modal Component
function EditTodoModal({
  isOpen,
  setIsOpen,
  title,
  setTitle,
  targetDate,
  setTargetDate,
  onSubmit
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
  setTitle: (title: string) => void;
  targetDate: string;
  setTargetDate: (date: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="modal-overlay" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="modal-panel w-full max-w-md transform overflow-hidden p-6 text-left align-middle transition-all">
                <Dialog.Title
                  as="h3"
                  className="panel-title"
                >
                  Edit Todo
                </Dialog.Title>
                <form onSubmit={onSubmit}>
                  <div className="mt-4">
                    <label htmlFor="editTodoTitle" className="field-label">
                      Todo Title
                    </label>
                    <input
                      type="text"
                      id="editTodoTitle"
                      className="field mt-1"
                      placeholder="Enter todo title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      autoFocus
                    />
                  </div>
                  {/* <div className="mt-4">
                    <label htmlFor="editTodoTargetDate" className="field-label">
                      Target Date (Optional)
                    </label>
                    <input
                      type="date"
                      id="editTodoTargetDate"
                      className="field mt-1"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                    />
                  </div> */}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Delete Confirmation Modal Component
function DeleteConfirmationModal({
  isOpen,
  setIsOpen,
  onConfirm
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="modal-overlay" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="modal-panel w-full max-w-md transform overflow-hidden p-6 text-left align-middle transition-all">
                <div className="flex items-center gap-4">
                  <div className="danger-chip">
                    <ExclamationTriangleIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="panel-title"
                  >
                    Delete Todo
                  </Dialog.Title>
                </div>
                
                <div className="mt-3">
                  <p className="help">
                    Are you sure you want to delete this todo? This action cannot be undone.
                  </p>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={onConfirm}
                  >
                    Delete
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
