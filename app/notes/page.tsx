"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  NotebookPen,
  Plus,
  Trash2,
  Edit2,
  CheckSquare,
  Square,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AppModal } from "@/components/modals/generic/AppModal";
import { ConfirmModal } from "@/components/modals/generic/ConfirmModal";
import { Skeleton } from "@/components/ui/skeleton";
import { notesApi, type PersonalNoteData, type PersonalNoteItem } from "@/api/services";

export default function PersonalNotesPage() {
  const queryClient = useQueryClient();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Form states
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isChecklist, setIsChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState<PersonalNoteItem[]>([
    { id: "1", text: "", done: false },
  ]);

  // Delete State
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  // Query Notes
  const { data: notesData, isLoading } = useQuery({
    queryKey: ["notes", "list"],
    queryFn: () => notesApi.getNotes(),
  });

  const notes = notesData?.notes || [];

  // Reset form
  const resetForm = () => {
    setNoteTitle("");
    setNoteContent("");
    setIsChecklist(false);
    setChecklistItems([{ id: "1", text: "", done: false }]);
    setEditingNoteId(null);
  };

  // Add Item
  const handleAddItem = () => {
    setChecklistItems((prev) => [
      ...prev,
      { id: Date.now().toString(), text: "", done: false },
    ]);
  };

  const handleUpdateItemText = (index: number, text: string) => {
    setChecklistItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], text };
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setChecklistItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Create / Update Mutation
  const saveNoteMutation = useMutation({
    mutationFn: () => {
      const payload = {
        title: noteTitle.trim(),
        content: isChecklist ? "" : noteContent.trim(),
        isChecklist,
        items: isChecklist ? checklistItems.filter((it) => it.text.trim()) : undefined,
      };

      if (editingNoteId) {
        return notesApi.updateNote(editingNoteId, payload);
      }
      return notesApi.createNote(payload);
    },
    onSuccess: () => {
      toast.success(editingNoteId ? "Note updated!" : "Personal note created!");
      setCreateModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save note.");
    },
  });

  // Toggle checklist item from card mutation
  const toggleItemMutation = useMutation({
    mutationFn: ({ note, itemId }: { note: PersonalNoteData; itemId: string }) => {
      const items = (note.items || []).map((it) =>
        it.id === itemId ? { ...it, done: !it.done } : it
      );
      return notesApi.updateNote(note.id, { items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update checklist item.");
    },
  });

  // Delete Mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => notesApi.deleteNote(id),
    onSuccess: () => {
      toast.success("Note deleted.");
      setDeleteNoteId(null);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete note.");
    },
  });

  // Open Edit
  const openEdit = (note: PersonalNoteData) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content || "");
    setIsChecklist(note.isChecklist);
    setChecklistItems(
      note.items && note.items.length > 0
        ? note.items
        : [{ id: "1", text: "", done: false }]
    );
    setCreateModalOpen(true);
  };

  return (
    <AppShell>
      <PageHeader
        title="Personal Notes & Checklists"
        description="Private notes isolated from your mess. Persists even if you change rooms or messes."
        actions={
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setCreateModalOpen(true);
            }}
          >
            <Plus className="size-4 mr-1.5" />
            New Note
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : notes.length === 0 ? (
        <Card className="p-12 text-center max-w-md mx-auto space-y-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
            <NotebookPen className="size-6" />
          </div>
          <CardTitle className="text-xl">Your Notebook is Empty</CardTitle>
          <CardDescription>
            Keep track of personal grocery lists, reminders, mess chores, or room checklists. Completely confidential to you.
          </CardDescription>
          <Button
            onClick={() => {
              resetForm();
              setCreateModalOpen(true);
            }}
          >
            <Plus className="size-4 mr-1.5" /> Create First Note
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Card
              key={note.id}
              className="flex flex-col justify-between hover:border-primary/40 transition-colors shadow-xs"
            >
              <div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-1">{note.title}</CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      {note.isChecklist ? "Checklist" : "Note"}
                    </Badge>
                  </div>
                  <CardDescription className="text-[11px] flex items-center gap-1">
                    <Clock className="size-3" />
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-xs pt-1">
                  {note.isChecklist ? (
                    <div className="space-y-1.5">
                      {note.items && note.items.length > 0 ? (
                        note.items.map((it) => (
                          <div
                            key={it.id}
                            onClick={() =>
                              toggleItemMutation.mutate({ note, itemId: it.id })
                            }
                            className="flex items-center gap-2 py-0.5 cursor-pointer group"
                          >
                            {it.done ? (
                              <CheckSquare className="size-4 text-primary shrink-0" />
                            ) : (
                              <Square className="size-4 text-muted-foreground group-hover:text-primary shrink-0" />
                            )}
                            <span
                              className={`transition-colors ${
                                it.done
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {it.text}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground italic">Empty checklist</p>
                      )}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-foreground/90 line-clamp-6 leading-relaxed">
                      {note.content || "No text content."}
                    </p>
                  )}
                </CardContent>
              </div>

              <CardFooter className="pt-2 border-t border-border flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  title="Edit note"
                  onClick={() => openEdit(note)}
                >
                  <Edit2 className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  title="Delete note"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteNoteId(note.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Note Modal */}
      <AppModal
        open={createModalOpen}
        onOpenChange={(open) => {
          if (!open) resetForm();
          setCreateModalOpen(open);
        }}
        title={editingNoteId ? "Edit Personal Note" : "New Personal Note"}
        subtitle="Saved securely to your private profile"
        icon={NotebookPen}
        primaryActions={
          <Button
            disabled={saveNoteMutation.isPending || !noteTitle.trim()}
            onClick={() => saveNoteMutation.mutate()}
          >
            {saveNoteMutation.isPending ? "Saving…" : "Save Note"}
          </Button>
        }
        secondaryActions={
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              setCreateModalOpen(false);
            }}
          >
            Cancel
          </Button>
        }
      >
        <div className="space-y-4 py-2">
          {/* Mode Switch */}
          <div className="flex rounded-lg border border-border p-1 bg-muted/30">
            <button
              type="button"
              onClick={() => setIsChecklist(false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                !isChecklist
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Standard Note
            </button>
            <button
              type="button"
              onClick={() => setIsChecklist(true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                isChecklist
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Interactive Checklist
            </button>
          </div>

          <Input
            label="Title"
            placeholder="e.g. Room Groceries / Mess Chores"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            required
          />

          {!isChecklist ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Note Content
              </label>
              <textarea
                rows={6}
                placeholder="Write your personal thoughts or lists here…"
                className="w-full rounded-md border border-input bg-card p-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Checklist Items
              </label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {checklistItems.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Item #${idx + 1}`}
                      value={item.text}
                      onChange={(e) => handleUpdateItemText(idx, e.target.value)}
                      className="flex-1 h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    <button
                      type="button"
                      disabled={checklistItems.length <= 1}
                      onClick={() => handleRemoveItem(idx)}
                      className="text-muted-foreground hover:text-destructive disabled:opacity-30 p-1 cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={handleAddItem}
              >
                <Plus className="size-3 mr-1" /> Add Task Item
              </Button>
            </div>
          )}
        </div>
      </AppModal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deleteNoteId)}
        onOpenChange={(open) => !open && setDeleteNoteId(null)}
        title="Delete Personal Note?"
        subtitle="This note will be permanently removed from your notebook."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={() => deleteNoteId && deleteNoteMutation.mutate(deleteNoteId)}
        isPending={deleteNoteMutation.isPending}
      />
    </AppShell>
  );
}
