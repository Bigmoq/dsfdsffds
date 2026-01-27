import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface SortableItemProps {
  id: string;
  feature: string;
  onRemove: (feature: string) => void;
  isCustom: boolean;
}

function SortableItem({ id, feature, onRemove, isCustom }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 rounded-lg border bg-background ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>
      <span className="flex-1 font-arabic text-sm">{feature}</span>
      {isCustom && (
        <button
          type="button"
          onClick={() => onRemove(feature)}
          className="hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface SortableFeatureListProps {
  selectedFeatures: string[];
  setSelectedFeatures: (features: string[]) => void;
  noFeatures: boolean;
  setNoFeatures: (value: boolean) => void;
  availableFeatures: string[];
}

export function SortableFeatureList({
  selectedFeatures,
  setSelectedFeatures,
  noFeatures,
  setNoFeatures,
  availableFeatures,
}: SortableFeatureListProps) {
  const [customFeature, setCustomFeature] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = selectedFeatures.indexOf(active.id as string);
      const newIndex = selectedFeatures.indexOf(over.id as string);
      setSelectedFeatures(arrayMove(selectedFeatures, oldIndex, newIndex));
    }
  };

  const toggleFeature = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };

  const handleNoFeatures = (checked: boolean) => {
    setNoFeatures(checked);
    if (checked) {
      setSelectedFeatures([]);
      setCustomFeature("");
    }
  };

  const addCustomFeature = () => {
    const trimmed = customFeature.trim();
    if (trimmed && !selectedFeatures.includes(trimmed)) {
      setSelectedFeatures([...selectedFeatures, trimmed]);
      setCustomFeature("");
    }
  };

  const removeFeature = (feature: string) => {
    setSelectedFeatures(selectedFeatures.filter((f) => f !== feature));
  };

  return (
    <div className="space-y-3">
      <Label className="font-arabic font-semibold">المميزات</Label>

      <div className="flex items-center gap-2">
        <Checkbox
          id="noFeatures"
          checked={noFeatures}
          onCheckedChange={(checked) => handleNoFeatures(checked as boolean)}
        />
        <Label htmlFor="noFeatures" className="font-arabic text-sm cursor-pointer">
          لا توجد مميزات
        </Label>
      </div>

      {!noFeatures && (
        <>
          {/* Available Features Grid */}
          <div className="grid grid-cols-2 gap-2">
            {availableFeatures.map((feature) => (
              <button
                key={feature}
                type="button"
                onClick={() => toggleFeature(feature)}
                className={`p-2 text-sm rounded-lg border transition-colors font-arabic ${
                  selectedFeatures.includes(feature)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary"
                }`}
              >
                {feature}
              </button>
            ))}
          </div>

          {/* Custom Feature Input */}
          <div className="space-y-2">
            <Label className="font-arabic text-sm">إضافة ميزة مخصصة</Label>
            <div className="flex gap-2">
              <Input
                value={customFeature}
                onChange={(e) => setCustomFeature(e.target.value)}
                placeholder="اكتب ميزة جديدة..."
                className="text-right font-arabic"
                dir="rtl"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomFeature();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addCustomFeature}
                disabled={!customFeature.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Sortable Selected Features */}
          {selectedFeatures.length > 0 && (
            <div className="space-y-2">
              <Label className="font-arabic text-sm flex items-center gap-2">
                <GripVertical className="w-4 h-4" />
                المميزات المختارة (اسحب للترتيب)
              </Label>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedFeatures}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {selectedFeatures.map((feature) => (
                      <SortableItem
                        key={feature}
                        id={feature}
                        feature={feature}
                        onRemove={removeFeature}
                        isCustom={!availableFeatures.includes(feature)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </>
      )}
    </div>
  );
}
