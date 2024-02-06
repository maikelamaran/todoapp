import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { FilterType, TodoModel } from '../../models/todo';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css',
})
export class TodoComponent implements OnInit {
  constructor() {
    effect(() => {
      localStorage.setItem('todos', JSON.stringify(this.todolist()));
    });
  }
  ngOnInit(): void {
    const storage = localStorage.getItem('todos');
    if (storage) {
      this.todolist.set(JSON.parse(storage));
    }
  }

  todolist = signal<TodoModel[]>([
    // { id: 1, title: 'comprar leche', completed: false, editing: false },
    // { id: 2, title: 'comprar lapiz', completed: false, editing: false },
    // { id: 3, title: 'comprar libreta', completed: true, editing: false },
  ]);

  filter = signal<FilterType>('all');

  todoListFiltered = computed(() => {
    const filter = this.filter();
    const todos = this.todolist();
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);

      default:
        return todos;
    }
  });

  changeFilter(filterString: FilterType) {
    this.filter.set(filterString);
  }

  newTodo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });

  addTodo() {
    const newTodoTitle = this.newTodo.value.trim(); //cojo el valor del input vinculado al formcontrol de arriba
    if (this.newTodo.valid && newTodoTitle !== '') {
      this.todolist.update((prevValue) => {
        return [
          ...prevValue,
          { id: prevValue.length + 1, title: newTodoTitle, completed: false },
        ];
      });
      this.newTodo.reset();
    } else {
      //si no es valida la entrada o está vacio...
      this.newTodo.reset();
    }
  }

  // toggleTodo(todoId: number) {
  //   //pone completa o no cierta tarea al darle al checkbox
  //   this.todolist.update((prevValue) =>
  //     prevValue.map((todo) => {
  //       if (todo.id === todoId) {
  //         return { ...todo, completed: !todo.completed };
  //       }
  //       return { ...todo };
  //     })
  //   );
  // }
  toggleTodo(todoId: number) {
    //pone completa o no cierta tarea al darle al checkbox
    this.todolist.update((prevValue) =>
      prevValue.map((todo) => {
        return todo.id === todoId
          ? { ...todo, completed: !todo.completed }
          : todo;
      })
    );
  }

  removeTodo(todoId: number) {
    this.todolist.update((prevValue) =>
      prevValue.filter((todo) => todo.id !== todoId)
    );
  }

  updateTodoEditingMode(todoId: number) {
    return this.todolist.update((prevValue) =>
      prevValue.map((todo) => {
        return todo.id === todoId
          ? { ...todo, editing: true }
          : { ...todo, editing: false };
      })
    );
  }

  saveTitleTodo(todoId: number, evento: any) {
    const titulo = (evento.target as HTMLInputElement).value;
    // const titulo = evento.target.value;
    return this.todolist.update((prevValue) =>
      prevValue.map((todo) => {
        return todo.id === todoId
          ? { ...todo, title: titulo, editing: false }
          : { ...todo };
      })
    );
  }
}
