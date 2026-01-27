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
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Upload, Loader2 } from "lucide-react";

interface SortableImageItemProps {
  id: string;
  url: string;
  index: number;
  onRemove: (index: number) => void;
}

function SortableImageItem({ id, url, index, onRemove }: SortableImageItemProps) {
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
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative w-20 h-20 flex-shrink-0 group ${
        isDragging ? "opacity-70 scale-105" : ""
      }`}
    >
      <img
        src={url}
        alt=""
        className="w-full h-full object-cover rounded-lg"
      />
      
      {/* Drag Handle */}
      <button
        type="button"
        className="absolute top-1 left-1 bg-black/50 text-white rounded p-0.5 cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3 h-3" />
      </button>
      
      {/* Remove Button */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
      >
        <X className="w-3 h-3" />
      </button>
      
      {/* Index Badge */}
      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] rounded px-1">
        {index + 1}
      </span>
    </div>
  );
}

interface SortableImageListProps {
  images: string[];
  setImages: (images: string[]) => void;
  onRemove: (index: number) => void;
  onUploadClick: () => void;
  isUploading: boolean;
  maxImages?: number;
}

export function SortableImageList({
  images,
  setImages,
  onRemove,
  onUploadClick,
  isUploading,
  maxImages = 10,
}: SortableImageListProps) {
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
      const oldIndex = images.findIndex((_, i) => `image-${i}` === active.id);
      const newIndex = images.findIndex((_, i) => `image-${i}` === over.id);
      setImages(arrayMove(images, oldIndex, newIndex));
    }
  };

  const imageIds = images.map((_, index) => `image-${index}`);

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={imageIds} strategy={horizontalListSortingStrategy}>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <SortableImageItem
                key={`image-${idx}`}
                id={`image-${idx}`}
                url={img}
                index={idx}
                onRemove={onRemove}
              />
            ))}
            
            {images.length < maxImages && (
              <button
                type="button"
                onClick={onUploadClick}
                disabled={isUploading}
                className="w-20 h-20 flex-shrink-0 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground font-arabic">رفع</span>
                  </>
                )}
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>
      
      {images.length > 1 && (
        <p className="text-xs text-muted-foreground flex items-center gap-1 font-arabic">
          <GripVertical className="w-3 h-3" />
          اسحب الصور لإعادة ترتيبها
        </p>
      )}
    </div>
  );
}
