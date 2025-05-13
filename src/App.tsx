import { useEffect, useState } from 'react'
import './App.css'
import localforage from 'localforage';
import { isTodos } from "./lib/isTodos";

type Todo ={
  value: string;
  readonly id: number;
  checked: boolean;
  removed: boolean;
};

type Filter = 'all' | 'checked' | 'unchecked' | 'removed';

export const App = () => {
  const [text, setText] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] =useState<Filter>('all');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleSubmit = () => {
    if (!text) return;

    const newTodo: Todo = {
      value: text,
      id: new Date().getTime(),
      checked: false,
      removed: false,
    };

    setTodos((todos) => [newTodo, ...todos]);
    setText('');
  }

  const handleTodo = <K extends keyof Todo, V extends Todo[K]>(
    id: number,
    key: K,
    value: V,
  ) => {
    setTodos((todos) => {
      const newTodos = todos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, [key]: value };
        } else {
          return todo;
        }
      });

      return newTodos;
    });
  };

  const handleEdit = (id:number, value:string) => {
      setTodos((todos) => {
        const newTodos = todos.map((todo) => {
          if (todo.id === id){
            return {...todo, value: value};
          }
          return todo;
        });
        return newTodos;
      });
};

const handleCheck = (id: number, checked: boolean) => {
  setTodos((todos) => {
    const newTodos = todos.map((todo) => {
      if (todo.id === id) {
        return {...todo, checked};
      }
      return todo;
    });

    return newTodos;
  });
};

 const handleRemove = (id: number, removed: boolean) => {
  setTodos((todos) => {
    const newTodos = todos.map((todo) => {
      if(todo.id === id) {
        return {...todo, removed};
      }
      return todo;
    });
    return newTodos;
  });
 };

 const handlerFilter = (filter : Filter) => {
  setFilter(filter);
 };

 const handleEmpty = () => {
  setTodos((todos) => todos.filter((todo) => !todo.removed));
 };

 const filteredTodos = todos.filter((todo) => {
  switch (filter) {
    case 'all':
      return !todo.removed;
      case 'checked':
        return todo.checked && !todo.removed;
        case 'unchecked':
          return !todo.checked && !todo.removed;
          case 'removed':
            return todo.removed;
            default:
              return todo;
  }
 });

 useEffect(() => {
  localforage
  .getItem("todo-20200101")
  .then((values) => {
    if (isTodos(values)) {
       setTodos(values);
 }
});
 }, []);

 useEffect(() => {
  localforage.setItem("todo-20200101", todos);
 }, [todos]);

  return (
    <div>
      <select defaultValue="all" onChange={(e) => handlerFilter(e.target.value as Filter)}>
        <option value="all">全てのタスク</option>
        <option value="checked">完了したタスク</option>
        <option value="unchecked">現在のタスク</option>
        <option value="removed">ゴミ箱</option>
      </select>
      {filter === 'removed' ? (
        <button onClick={handleEmpty}
        disabled={todos.filter((todo) => todo.removed).length === 0}
        >
          ごみを空にする
        </button>
      ) : (
        filter !== 'checked' && (
          <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          >
            <input type="text" value={text} onChange={(e) => handleChange(e)} />
            <input type="submit" value="追加" />
            </form>
        )
      )}
      <ul>
        {filteredTodos.map((todo) => {
          return (
            <li key={todo.id}>
              <input 
              type='checkbox'
              checked={todo.checked}
              onChange={() => handleCheck(todo.id, !todo.checked)}
              />
            <input
            type='text'
            disabled={todo.checked || todo.removed}
            value={todo.value}
            onChange={(e) => handleEdit(todo.id, e.target.value)}
            />
            <button onClick={() => handleRemove(todo.id, !todo.removed)}>
              {todo.removed ? '復元' : '削除'}
            </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};




export default App
