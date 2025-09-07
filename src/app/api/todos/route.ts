import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/db';
import { Todo } from '@/lib/models';
import { authOptions } from '@/lib/auth';

// GET all todos for authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const todos = await Todo.find({ user: session.user.id }).sort({ createdAt: -1 });
    
    // Ensure all items have targetDate and status fields with defaults
    const processedTodos = todos.map((todo: any) => ({
      ...todo.toObject(),
      items: todo.items.map((item: any) => ({
        ...item.toObject(),
        targetDate: item.targetDate || undefined,
        status: item.status || 'ETS'
      }))
    }));
    
    return NextResponse.json(processedTodos);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

// CREATE a new todo for authenticated user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const data = await request.json();
    
    // Add user ID to the todo
    const todoData = {
      ...data,
      user: session.user.id
    };
    
    const todo = await Todo.create(todoData);
    return NextResponse.json(todo);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}
