'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

import SidePanel from '@/components/SidePanel';
import TodoDetail from '@/components/TodoDetail';


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

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Listen for sidebar open events from header
    const handleOpenSidebar = (event: CustomEvent) => {
      setIsSidePanelOpen(event.detail.isOpen);
    };

    window.addEventListener('openSidebar', handleOpenSidebar as EventListener);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('openSidebar', handleOpenSidebar as EventListener);
    };
  }, []);

  // Notify header about sidebar state changes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebarToggle', { 
      detail: { isOpen: isSidePanelOpen } 
    }));
  }, [isSidePanelOpen]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTodos();
    }
  }, [status]);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/todos');
      setTodos(response.data);
    } catch (error) {
      toast.error('Failed to fetch todos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTodo = async (title: string, targetDate?: string) => {
    try {
      const response = await axios.post('/api/todos', { 
        title, 
        items: [],
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined
      });
      setTodos([response.data, ...todos]);
      setSelectedTodo(response.data);
      toast.success('Todo created successfully');
    } catch (error) {
      toast.error('Failed to create todo');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await axios.delete(`/api/todos/${id}`);
      setTodos(todos.filter((todo) => todo._id !== id));
      if (selectedTodo?._id === id) {
        setSelectedTodo(null);
      }
      toast.success('Todo deleted successfully');
    } catch (error) {
      toast.error('Failed to delete todo');
    }
  };

  const handleUpdateTodo = async (updatedTodo: Todo) => {
    try {
      const response = await axios.put(`/api/todos/${updatedTodo._id}`, updatedTodo);
      
      if (response.data) {
        setTodos(todos.map((todo) =>
          todo._id === updatedTodo._id ? response.data : todo
        ));
        setSelectedTodo(response.data);
        toast.success('Todo updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating todo:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update todo';
      toast.error(errorMessage);
      
      // Revert changes in UI if the API call failed
      if (selectedTodo) {
        setSelectedTodo({ ...selectedTodo });
      }
    }
  };

  // Show loading state or redirect to login
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black shadow-lg">
      <div 
        data-aos="fade-right" 
        data-aos-duration="800"
      >
        <SidePanel
          todos={todos}
          onTodoClick={(todo: Todo) => {
            setSelectedTodo(todo);
            // Close sidebar in mobile view when a todo is selected
            if (isMobile) {
              setIsSidePanelOpen(false);
            }
          }}
          onCreateTodo={handleCreateTodo}
          onDeleteTodo={handleDeleteTodo}
          onUpdateTodo={handleUpdateTodo}
          isMobile={isMobile}
          isOpen={isSidePanelOpen}
          setIsOpen={setIsSidePanelOpen}
          isLoading={isLoading}
        />
      </div>
      <div 
        className="flex-1 overflow-auto transition-all duration-300 ease-in-out"
        data-aos="fade-left"
        data-aos-delay="200"
      >

        
        {selectedTodo ? (
          <TodoDetail todo={selectedTodo} onUpdateTodo={handleUpdateTodo} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8">
            <div 
              className="max-w-md text-center p-8 rounded-xl bg-slate-800/80 backdrop-blur-sm shadow-xl border border-slate-700"
              data-aos="zoom-in"
              data-aos-delay="400"
            >
              <img 
                src="/window.svg" 
                alt="Todo" 
                className="w-24 h-24 mx-auto mb-6 opacity-60 invert"
                data-aos="flip-up"
                data-aos-delay="600"
              />
              <h2 className="text-xl font-medium text-yellow-400 mb-2">No Todo Selected</h2>
              <p className="text-slate-400">
                {todos.length > 0 
                  ? 'Select a todo from the sidebar or create a new one to get started'
                  : 'Create your first todo to get started'}
              </p>
            </div>
          </div>
        )}
      </div>
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            borderColor: '#334155'
          }
        }}
      />
    </div>
  );
}
