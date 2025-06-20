"use client";
import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface Task {
  id: string;
  content: string;
}

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

interface BoardData {
  columns: { [key: string]: Column };
  tasks: { [key: string]: Task };
  columnOrder: string[];
}

const initialData: BoardData = {
  columns: {
    "column-1": {
      id: "column-1",
      title: "À faire",
      taskIds: ["task-1", "task-2"],
    },
    "column-2": {
      id: "column-2",
      title: "En cours",
      taskIds: [],
    },
  },
  tasks: {
    "task-1": { id: "task-1", content: "Faire le design" },
    "task-2": { id: "task-2", content: "Configurer la base de données" },
  },
  columnOrder: ["column-1", "column-2"],
};

export default function Board() {
  const [data, setData] = useState<BoardData>(initialData);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceCol = data.columns[source.droppableId];
    const destCol = data.columns[destination.droppableId];

    const sourceTaskIds = Array.from(sourceCol.taskIds);
    const [movedTask] = sourceTaskIds.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceTaskIds.splice(destination.index, 0, movedTask);
      const newCol = {
        ...sourceCol,
        taskIds: sourceTaskIds,
      };
      setData({
        ...data,
        columns: {
          ...data.columns,
          [newCol.id]: newCol,
        },
      });
    } else {
      const destTaskIds = Array.from(destCol.taskIds);
      destTaskIds.splice(destination.index, 0, movedTask);

      setData({
        ...data,
        columns: {
          ...data.columns,
          [sourceCol.id]: {
            ...sourceCol,
            taskIds: sourceTaskIds,
          },
          [destCol.id]: {
            ...destCol,
            taskIds: destTaskIds,
          },
        },
      });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: "flex", gap: "16px" }}>
        {data.columnOrder.map((columnId) => {
          const column = data.columns[columnId];
          const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

          return (
            <Droppable droppableId={column.id} key={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    padding: 8,
                    backgroundColor: "#f4f4f4",
                    borderRadius: 4,
                    width: 250,
                    minHeight: 500,
                  }}
                >
                  <h3>{column.title}</h3>
                  {tasks.map((task, index) => (
                    <Draggable
                      draggableId={task.id}
                      index={index}
                      key={task.id}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            userSelect: "none",
                            padding: 16,
                            margin: "0 0 8px 0",
                            backgroundColor: "white",
                            borderRadius: 4,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                            ...provided.draggableProps.style,
                          }}
                        >
                          {task.content}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
