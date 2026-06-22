import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

export function useStoredOrder(key: string, defaultOrder: string[]) {
  const [order, setOrder] = useState<string[]>(() => {
    if (typeof window === "undefined") return defaultOrder;
    try {
      const s = localStorage.getItem(key);
      if (!s) return defaultOrder;
      const parsed = JSON.parse(s) as string[];
      const valid = parsed.filter((x) => defaultOrder.includes(x));
      defaultOrder.forEach((x) => {
        if (!valid.includes(x)) valid.push(x);
      });
      return valid;
    } catch {
      return defaultOrder;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(order));
    } catch {}
  }, [key, order]);
  return [order, setOrder] as const;
}

export function SortableItem({
  id,
  children,
  handleClass = "",
}: {
  id: string;
  children: (handle: ReactNode) => ReactNode;
  handleClass?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : ("auto" as any),
  };
  const handle = (
    <button
      ref={setNodeRef as any}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground transition-colors ${handleClass}`}
      aria-label="Drag to reorder"
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
  return (
    <div ref={setNodeRef} style={style as any}>
      {children(handle)}
    </div>
  );
}

export function SortableList({
  ids,
  onReorder,
  children,
  axis = "y",
}: {
  ids: string[];
  onReorder: (next: string[]) => void;
  children: ReactNode;
  axis?: "x" | "y";
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = ids.indexOf(String(active.id));
    const newIdx = ids.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    onReorder(arrayMove(ids, oldIdx, newIdx));
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext
        items={ids}
        strategy={axis === "y" ? verticalListSortingStrategy : horizontalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
}
