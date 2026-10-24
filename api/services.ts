import { http } from "./http";
import type { AuthUser, ActiveMembership } from "@/lib/authStorage.util";

/* ================= AUTH API ================= */
export interface AuthResponse {
  message: string;
  user: AuthUser;
  token: string;
}

export interface MeResponse {
  user: AuthUser;
  activeMembership: ActiveMembership | null;
}

export const authApi = {
  login: (body: { email: string; password: string }) =>
    http<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  register: (body: { name: string; email: string; password: string; phone?: string }) =>
    http<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getMe: () => http<MeResponse>("/auth/me", { method: "GET" }),

  updateMe: (body: {
    name?: string;
    phone?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) =>
    http<{ message: string; user: AuthUser }>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteMe: (body: { password: string }) =>
    http<{ message: string }>("/auth/me", {
      method: "DELETE",
      body: JSON.stringify(body),
    }),
};

/* ================= MESS API ================= */
export interface MessMemberData {
  id: string;
  userId: string;
  role: "MANAGER" | "MEMBER";
  status: "ACTIVE" | "LEFT" | "REMOVED";
  joinedAt: string;
  leftAt?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
}

export interface MessData {
  id: string;
  name: string;
  inviteCode: string;
  managerId: string;
  rotationType: string;
  createdAt: string;
  updatedAt: string;
  members: MessMemberData[];
}

export const messApi = {
  getMess: () => http<{ mess: MessData }>("/mess", { method: "GET" }),

  createMess: (body: { name: string }) =>
    http<{ message: string; mess: MessData; membership: any }>("/mess/create", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  joinMess: (body: { inviteCode: string }) =>
    http<{ message: string; mess: MessData; membership: any }>("/mess/join", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  leaveMess: () =>
    http<{ message: string }>("/mess/leave", {
      method: "POST",
    }),

  updateMess: (body: { name?: string; regenerateInviteCode?: boolean }) =>
    http<{ message: string; mess: MessData }>("/mess", {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteMess: (body: { password: string }) =>
    http<{ message: string }>("/mess", {
      method: "DELETE",
      body: JSON.stringify(body),
    }),

  getMembers: () => http<{ members: MessMemberData[] }>("/mess/members", { method: "GET" }),

  getMonths: () => http<{ months: Array<{ id: string; monthKey: string; status: string; createdAt: string }> }>("/mess/months", { method: "GET" }),

  createMonth: (body: { monthKey: string }) =>
    http<{ message: string; month: any }>("/mess/months", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getSequence: () =>
    http<{ sequence: Array<{ id: string; memberId: string; orderIndex: number; member: MessMemberData }> }>("/mess/manager/sequence", { method: "GET" }),

  updateSequence: (body: { memberIds: string[] }) =>
    http<{ message: string }>("/mess/manager/sequence", {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  transferManager: (body: { newManagerId: string; reason?: string }) =>
    http<{ message: string }>("/mess/manager/transfer", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getLogs: () =>
    http<{ logs: Array<{ id: string; action: string; previousManagerId?: string; newManagerId?: string; reason?: string; createdAt: string }> }>("/mess/manager/logs", { method: "GET" }),

  exportData: (monthKey?: string) =>
    http<any>(`/mess/export${monthKey ? `?monthKey=${monthKey}` : ""}`, { method: "GET" }),

  importData: (payload: any) =>
    http<{ message: string }>("/mess/import", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

/* ================= BAZAR API ================= */
export interface ChecklistItem {
  name: string;
  qty?: string;
  price: number;
  bought?: boolean;
}

export interface BazarEntryData {
  id: string;
  messMonthId: string;
  memberId: string;
  amount: number;
  category: string;
  date: string;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  mode: "QUICK" | "CHECKLIST";
  items?: ChecklistItem[] | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  member: MessMemberData;
}

export const bazarApi = {
  getEntries: (monthKey?: string) =>
    http<{ entries: BazarEntryData[]; pendingCount: number; approvedSum: number }>(
      `/bazar${monthKey ? `?monthKey=${monthKey}` : ""}`,
      { method: "GET" }
    ),

  createEntry: (body: {
    monthKey: string;
    amount: number;
    category: string;
    date: string;
    mode?: "QUICK" | "CHECKLIST";
    items?: ChecklistItem[];
    notes?: string;
  }) =>
    http<{ message: string; entry: BazarEntryData }>("/bazar", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateEntry: (id: string, body: any) =>
    http<{ message: string; entry: BazarEntryData }>(`/bazar/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteEntry: (id: string) =>
    http<{ message: string }>(`/bazar/${id}`, { method: "DELETE" }),

  approveEntry: (id: string, status: "APPROVED" | "REJECTED") =>
    http<{ message: string; entry: BazarEntryData }>(`/bazar/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

/* ================= MEALS API ================= */
export interface DailyMealRecord {
  id: string;
  messMonthId: string;
  memberId: string;
  date: string;
  lunch: number;
  dinner: number;
  isLeave: boolean;
  member?: MessMemberData;
}

export interface LeaveRequestData {
  id: string;
  memberId: string;
  startDate: string;
  endDate: string;
  reason?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  member: MessMemberData;
}

export const mealsApi = {
  getMeals: (monthKey?: string) =>
    http<{ meals: DailyMealRecord[]; members: MessMemberData[] }>(
      `/meals${monthKey ? `?monthKey=${monthKey}` : ""}`,
      { method: "GET" }
    ),

  updateMeal: (body: { memberId: string; date: string; lunch: number; dinner: number }) =>
    http<{ message: string; meal: DailyMealRecord }>("/meals/update", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  createLeaveRequest: (body: { startDate: string; endDate: string; reason?: string }) =>
    http<{ message: string; request: LeaveRequestData }>("/meals/leave-request", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getLeaveRequests: () =>
    http<{ requests: LeaveRequestData[] }>("/meals/leave-requests", { method: "GET" }),

  approveLeaveRequest: (id: string, status: "APPROVED" | "REJECTED") =>
    http<{ message: string }>(`/meals/leave-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

/* ================= DEPOSITS API ================= */
export interface DepositData {
  id: string;
  messMonthId: string;
  memberId: string;
  amount: number;
  date: string;
  notes?: string | null;
  createdAt: string;
  member: MessMemberData;
}

export const depositsApi = {
  getDeposits: (monthKey?: string) =>
    http<{ deposits: DepositData[]; totalDeposits: number }>(
      `/deposits${monthKey ? `?monthKey=${monthKey}` : ""}`,
      { method: "GET" }
    ),

  createDeposit: (body: { monthKey: string; memberId: string; amount: number; date: string; notes?: string }) =>
    http<{ message: string; deposit: DepositData }>("/deposits", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateDeposit: (id: string, body: any) =>
    http<{ message: string; deposit: DepositData }>(`/deposits/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteDeposit: (id: string) =>
    http<{ message: string }>(`/deposits/${id}`, { method: "DELETE" }),
};

/* ================= SUMMARY API ================= */
export interface MemberSummaryData {
  memberId: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
  totalMeals: number;
  totalDeposit: number;
  mealCost: number;
  balance: number;
}

export interface MonthlySummaryResponse {
  monthKey: string;
  totalApprovedBazar: number;
  totalDeposits: number;
  totalMeals: number;
  mealRate: number;
  memberSummaries: MemberSummaryData[];
}

export const summaryApi = {
  getSummary: (monthKey?: string) =>
    http<MonthlySummaryResponse>(`/summary${monthKey ? `?monthKey=${monthKey}` : ""}`, {
      method: "GET",
    }),
};

/* ================= TOURS API ================= */
export interface TourMemberSummary {
  id: string;
  tourId: string;
  userId?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: "LEAD" | "ACCOUNTANT" | "MEMBER";
  joinedAt: string;
  totalDeposited?: number;
  totalSpent?: number;
  shareCost?: number;
  netBalance?: number;
}

export interface TourSummaryItem {
  id: string;
  name: string;
  description?: string | null;
  destination?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  budget: number;
  status: "PLANNING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  inviteCode: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  totalDeposits: number;
  totalExpenses: number;
  balance: number;
  membersCount: number;
  leadName: string;
  accountantNames: string[];
  myRole?: string | null;
}

export interface TourDetailedData {
  tour: {
    id: string;
    name: string;
    description: string | null;
    destination: string | null;
    startDate: string | null;
    endDate: string | null;
    budget: number;
    status: "PLANNING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
    inviteCode: string;
    creatorId: string;
    createdAt: string;
  };
  summary: {
    budget: number;
    totalDeposits: number;
    totalExpenses: number;
    balance: number;
    budgetRemaining: number;
    perMemberShare: number;
    membersCount: number;
    categoryBreakdown: Record<string, number>;
  };
  members: TourMemberSummary[];
  expenses: Array<{
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    notes?: string | null;
    member?: { id: string; name: string } | null;
  }>;
  deposits: Array<{
    id: string;
    amount: number;
    date: string;
    notes?: string | null;
    member: { id: string; name: string };
  }>;
}

export const toursApi = {
  getTours: (viewAll = false) =>
    http<{ tours: TourSummaryItem[] }>(`/tours${viewAll ? "?all=true" : ""}`, { method: "GET" }),

  createTour: (body: {
    name: string;
    description?: string;
    destination?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
  }) =>
    http<{ message: string; tour: any }>("/tours", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  joinTour: (body: { inviteCode: string }) =>
    http<{ message: string; tour: any }>("/tours/join", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getTourById: (id: string) => http<TourDetailedData>(`/tours/${id}`, { method: "GET" }),

  updateTour: (id: string, body: any) =>
    http<{ message: string; tour: any }>(`/tours/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteTour: (id: string) =>
    http<{ message: string }>(`/tours/${id}`, { method: "DELETE" }),

  createDeposit: (tourId: string, body: { memberId: string; amount: number; date?: string; notes?: string }) =>
    http<{ message: string; deposit: any }>(`/tours/${tourId}/deposits`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  deleteDeposit: (tourId: string, depositId: string) =>
    http<{ message: string }>(`/tours/${tourId}/deposits/${depositId}`, { method: "DELETE" }),

  createExpense: (tourId: string, body: { title: string; amount: number; category?: string; date?: string; notes?: string; memberId?: string }) =>
    http<{ message: string; expense: any }>(`/tours/${tourId}/expenses`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  deleteExpense: (tourId: string, expenseId: string) =>
    http<{ message: string }>(`/tours/${tourId}/expenses/${expenseId}`, { method: "DELETE" }),

  createMember: (tourId: string, body: { name: string; phone?: string; email?: string; role?: string }) =>
    http<{ message: string; member: any }>(`/tours/${tourId}/members`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateMember: (tourId: string, memberId: string, body: any) =>
    http<{ message: string; member: any }>(`/tours/${tourId}/members/${memberId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteMember: (tourId: string, memberId: string) =>
    http<{ message: string }>(`/tours/${tourId}/members/${memberId}`, { method: "DELETE" }),
};

/* ================= NOTES API ================= */
export interface PersonalNoteItem {
  id: string;
  text: string;
  done: boolean;
}

export interface PersonalNoteData {
  id: string;
  userId: string;
  title: string;
  content: string;
  isChecklist: boolean;
  items?: PersonalNoteItem[] | null;
  createdAt: string;
  updatedAt: string;
}

export const notesApi = {
  getNotes: () => http<{ userId: string; notes: PersonalNoteData[] }>("/notes", { method: "GET" }),

  createNote: (body: { title: string; content?: string; isChecklist?: boolean; items?: PersonalNoteItem[] }) =>
    http<{ message: string; note: PersonalNoteData }>("/notes", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateNote: (id: string, body: any) =>
    http<{ message: string; note: PersonalNoteData }>(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteNote: (id: string) =>
    http<{ message: string }>(`/notes/${id}`, { method: "DELETE" }),
};

/* ================= ADMIN API ================= */
export interface AdminPlatformData {
  stats: {
    totalUsers: number;
    totalMesses: number;
    totalMeals: number;
    totalBazarAmount: number;
    totalTours: number;
    totalTourBudget: number;
    totalTourExpenses: number;
    totalTourDeposits: number;
  };
  users: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    isSuperAdmin: boolean;
    createdAt: string;
    currentRole: string;
    activeMess?: {
      id: string;
      name: string;
      inviteCode: string;
      role: string;
      joinedAt: string;
    } | null;
  }>;
  messes: Array<{
    id: string;
    name: string;
    inviteCode: string;
    managerId: string;
    managerName: string;
    managerEmail: string;
    totalMembersCount: number;
    activeMembersCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
  tours: TourSummaryItem[];
}

export const adminApi = {
  getPlatformData: () => http<AdminPlatformData>("/admin", { method: "GET" }),

  deleteMess: (id: string) =>
    http<{ message: string }>(`/admin/messes/${id}`, { method: "DELETE" }),

  createUser: (body: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    isSuperAdmin?: boolean;
  }) =>
    http<{ message: string; user: any }>("/admin/users", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  deleteUser: (id: string) =>
    http<{ message: string }>(`/admin/users/${id}`, { method: "DELETE" }),

  createMess: (body: {
    name: string;
    managerId: string;
    memberIds?: string[];
  }) =>
    http<{ message: string; mess: any }>("/admin/messes", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateUser: (
    id: string,
    body: {
      password?: string;
      newPassword?: string;
      name?: string;
      email?: string;
      phone?: string;
      isSuperAdmin?: boolean;
    }
  ) => {
    const payload: any = { ...body };
    if (body.password && !body.newPassword) {
      payload.newPassword = body.password;
    }
    return http<{ message: string; user?: any }>(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};

/* ================= APP CONFIG API ================= */
export interface AppConfigData {
  id: string;
  appName: string;
  appIconSvg?: string | null;
  creatorName: string;
  creatorEmail: string;
  creatorPortfolio: string;
  creatorBio?: string | null;
  broadcastNotice?: string | null;
  noticeActive: boolean;
  updatedAt?: string;
}

export const configApi = {
  getConfig: () => http<{ config: AppConfigData }>("/config", { method: "GET" }),

  updateConfig: (body: Partial<AppConfigData>) =>
    http<{ message: string; config: AppConfigData }>("/config", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};
