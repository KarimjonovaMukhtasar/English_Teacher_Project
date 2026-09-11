import React, { useState } from 'react';
import { X, Users, Plus, Trash2, Check, UserPlus } from 'lucide-react';
import { StudentGroup } from '@/types';

interface GroupManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: StudentGroup[];
  activeGroupId: string | null;
  onSelectActiveGroup: (groupId: string) => void;
  onSaveGroup: (group: StudentGroup) => Promise<void>;
  onDeleteGroup: (groupId: string) => Promise<void>;
}

export const GroupManagerModal: React.FC<GroupManagerModalProps> = ({
  isOpen,
  onClose,
  groups,
  activeGroupId,
  onSelectActiveGroup,
  onSaveGroup,
  onDeleteGroup,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<StudentGroup | null>(
    groups.length > 0 ? groups[0] : null
  );
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newStudentsRaw, setNewStudentsRaw] = useState<string>('');

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setIsCreating(true);
    setNewGroupName('');
    setNewStudentsRaw('');
  };

  const handleSaveNewGroup = async () => {
    if (!newGroupName.trim()) return;

    // Parse students line by line or by commas
    const students = newStudentsRaw
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newGroup: StudentGroup = {
      id: 'grp_' + Date.now(),
      name: newGroupName.trim(),
      students: students.length > 0 ? students : ['Student 1', 'Student 2', 'Student 3'],
      createdAt: Date.now(),
    };

    await onSaveGroup(newGroup);
    setSelectedGroup(newGroup);
    setIsCreating(false);
  };

  const handleAddStudentToActive = async (name: string) => {
    if (!selectedGroup || !name.trim()) return;
    const updated = {
      ...selectedGroup,
      students: [...selectedGroup.students, name.trim()],
    };
    await onSaveGroup(updated);
    setSelectedGroup(updated);
  };

  const handleRemoveStudent = async (index: number) => {
    if (!selectedGroup) return;
    const updated = {
      ...selectedGroup,
      students: selectedGroup.students.filter((_, i) => i !== index),
    };
    await onSaveGroup(updated);
    setSelectedGroup(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="flex h-[550px] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">O'quvchilar Guruhlari</h3>
              <p className="text-xs text-slate-500">
                Random Student Picker (tasodifiy o'quvchi tanlash) uchun guruhlarni boshqarish
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Group list */}
          <div className="w-1/3 border-r border-slate-100 bg-slate-50/50 p-4 flex flex-col justify-between">
            <div className="overflow-y-auto space-y-2">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Mavjud guruhlar
                </span>
                <button
                  onClick={handleStartCreate}
                  className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Yangi
                </button>
              </div>

              {groups.map((group) => {
                const isSelected = selectedGroup?.id === group.id;
                const isActive = activeGroupId === group.id;

                return (
                  <div
                    key={group.id}
                    onClick={() => {
                      setSelectedGroup(group);
                      setIsCreating(false);
                    }}
                    className={`group relative flex cursor-pointer items-center justify-between rounded-xl p-3 transition border ${
                      isSelected
                        ? 'bg-white border-blue-200 shadow-sm'
                        : 'border-transparent hover:bg-white/80'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-slate-800 truncate">
                          {group.name}
                        </span>
                        {isActive && (
                          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                            Faol
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {group.students.length} nafar o'quvchi
                      </span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteGroup(group.id);
                          if (selectedGroup?.id === group.id) {
                            setSelectedGroup(groups.find((g) => g.id !== group.id) || null);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Group Details or Create form */}
          <div className="flex-1 p-6 overflow-y-auto">
            {isCreating ? (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-800">Yangi guruh qo'shish</h4>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Guruh nomi
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Masalan: IELTS Morning 09:00"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    O'quvchilar ismlari (har bir qatorga bittadan ism)
                  </label>
                  <textarea
                    rows={8}
                    value={newStudentsRaw}
                    onChange={(e) => setNewStudentsRaw(e.target.value)}
                    placeholder="Ali Valiyev&#10;Malika Karimova&#10;Jasur Bekzodov&#10;Madina Umarova"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleSaveNewGroup}
                    className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
                  >
                    Guruhni saqlash
                  </button>
                </div>
              </div>
            ) : selectedGroup ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{selectedGroup.name}</h4>
                    <p className="text-xs text-slate-500">
                      Jami: {selectedGroup.students.length} nafar o'quvchi
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectActiveGroup(selectedGroup.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                      activeGroupId === selectedGroup.id
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    }`}
                  >
                    <Check className="h-4 w-4" />
                    {activeGroupId === selectedGroup.id ? 'Darsda tanlangan' : 'Dars uchun faollashtirish'}
                  </button>
                </div>

                {/* Add student inline */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem('studentName') as HTMLInputElement;
                    if (input.value) {
                      handleAddStudentToActive(input.value);
                      input.value = '';
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    name="studentName"
                    type="text"
                    placeholder="Yangi o'quvchi ismini yozing..."
                    className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Qo'shish
                  </button>
                </form>

                {/* Students list */}
                <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
                  {selectedGroup.students.map((student, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-sm text-slate-700"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs font-bold text-slate-400 w-5">
                          {idx + 1}.
                        </span>
                        <span className="font-medium truncate">{student}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(idx)}
                        className="text-slate-400 hover:text-rose-500 transition p-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Guruhni tanlang yoki yangisini qo'shing
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
