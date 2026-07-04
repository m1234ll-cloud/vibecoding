from itertools import count
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field

app = FastAPI(title="Simple TODO API")
BASE_DIR = Path(__file__).resolve().parent


# TODO 항목에 사용할 고유 ID를 1부터 자동 생성합니다.
todo_id_generator = count(1)


class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, description="할 일 제목")


class TodoUpdate(BaseModel):
    completed: bool = Field(..., description="완료 여부")


class Todo(BaseModel):
    id: int
    title: str
    completed: bool


# 메모리에만 저장되는 TODO 리스트입니다.
todos: List[Todo] = [
    Todo(id=next(todo_id_generator), title="FastAPI 배우기", completed=False),
    Todo(id=next(todo_id_generator), title="TODO API 만들기", completed=True),
]


def find_todo(todo_id: int) -> Optional[Todo]:
    for todo in todos:
        if todo.id == todo_id:
            return todo
    return None


@app.get("/", response_class=HTMLResponse)
def root():
    return (BASE_DIR / "index.html").read_text(encoding="utf-8")


@app.get("/todos", response_model=list[Todo])
def get_todos():
    """할 일 목록을 모두 조회합니다."""
    return todos


@app.post("/todos", response_model=Todo, status_code=201)
def create_todo(todo: TodoCreate):
    """새로운 할 일을 추가합니다."""
    new_todo = Todo(
        id=next(todo_id_generator),
        title=todo.title,
        completed=False,
    )
    todos.append(new_todo)
    return new_todo


@app.patch("/todos/{todo_id}", response_model=Todo)
def update_todo_status(todo_id: int, payload: TodoUpdate):
    """할 일의 완료 상태를 변경합니다."""
    todo = find_todo(todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    todo.completed = payload.completed
    return todo


@app.delete("/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int):
    """할 일을 삭제합니다."""
    todo = find_todo(todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    todos.remove(todo)
    return None
